#!/usr/bin/env python3
"""
Validador da regra de negócio central: aprovação de cadastros de admin (olheiros).

Lê todas as solicitações pendentes em `admin_requests` no Lovable Cloud e verifica
se cada uma cumpre os critérios obrigatórios antes de poder ser aprovada pelo
suporte. NÃO altera dados — apenas leitura.

Uso:
    pip install supabase python-dotenv
    export SUPABASE_URL="https://<project>.supabase.co"
    export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
    python scripts/validate_admin_requests.py
    python scripts/validate_admin_requests.py --request-id <uuid>

Exit code 0 se todas as pending são aprováveis, 1 caso contrário.
"""
from __future__ import annotations

import argparse
import os
import re
import sys
from typing import Any

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

try:
    from supabase import create_client, Client
except ImportError:
    print("ERRO: dependência ausente. Rode: pip install supabase python-dotenv", file=sys.stderr)
    sys.exit(2)


EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
ALLOWED_EXT = {"jpg", "jpeg", "png", "webp"}
BUCKET = "admin-docs"


def get_client() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("ERRO: defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.", file=sys.stderr)
        sys.exit(2)
    return create_client(url, key)


def digits_only(value: str | None) -> str:
    return re.sub(r"\D", "", value or "")


def file_exists(supabase: Client, path: str) -> bool:
    """Verifica se o objeto existe no bucket gerando uma signed URL."""
    try:
        res = supabase.storage.from_(BUCKET).create_signed_url(path, 60)
        return bool(res and (res.get("signedURL") or res.get("signed_url")))
    except Exception:
        return False


def validate_request(
    record: dict[str, Any],
    *,
    profile_exists: bool,
    already_admin: bool,
    duplicate_pending: bool,
    supabase: Client,
) -> list[str]:
    errors: list[str] = []

    # 1. Identidade
    if not profile_exists:
        errors.append("user_id não encontrado em profiles")
    nome = (record.get("nome") or "").strip()
    if len(nome) < 3:
        errors.append("nome ausente ou com menos de 3 caracteres")
    email = (record.get("email") or "").strip()
    if not EMAIL_RE.match(email):
        errors.append("email em formato inválido")

    # 2. Contato
    cel = digits_only(record.get("celular"))
    if not (10 <= len(cel) <= 15):
        errors.append(f"celular inválido ({len(cel)} dígitos; esperado 10-15)")

    # 3. Idade
    idade = record.get("idade")
    if idade is None or not isinstance(idade, int) or not (18 <= idade <= 99):
        errors.append(f"idade inválida ({idade!r}; esperado 18-99)")

    # 4. Clube atual
    clube = (record.get("clube_atual") or "").strip()
    if len(clube) < 2:
        errors.append("clube_atual ausente ou muito curto")

    # 5. Documentos RG
    for field in ("rg_frente_path", "rg_verso_path"):
        path = record.get(field)
        if not path:
            errors.append(f"{field} ausente")
            continue
        ext = path.rsplit(".", 1)[-1].lower() if "." in path else ""
        if ext not in ALLOWED_EXT:
            errors.append(f"{field} com extensão inválida ('.{ext}')")
        elif not file_exists(supabase, path):
            errors.append(f"{field} não encontrado no bucket '{BUCKET}'")

    # 6. Integridade
    if already_admin:
        errors.append("usuário já possui role 'admin' — aprovação duplicada")
    if duplicate_pending:
        errors.append("existem múltiplas solicitações pending para o mesmo user_id")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Valida solicitações pendentes de admin.")
    parser.add_argument("--request-id", help="Validar apenas uma solicitação específica (uuid).")
    args = parser.parse_args()

    supabase = get_client()

    query = supabase.table("admin_requests").select("*").eq("status", "pending")
    if args.request_id:
        query = query.eq("id", args.request_id)
    requests = query.execute().data or []

    if not requests:
        print("Nenhuma solicitação pending encontrada.")
        return 0

    # Pré-carregar profiles e roles para evitar N+1
    user_ids = list({r["user_id"] for r in requests if r.get("user_id")})
    profiles = (
        supabase.table("profiles").select("id").in_("id", user_ids).execute().data or []
    )
    profile_ids = {p["id"] for p in profiles}

    admin_roles = (
        supabase.table("user_roles")
        .select("user_id")
        .eq("role", "admin")
        .in_("user_id", user_ids)
        .execute()
        .data
        or []
    )
    admin_user_ids = {r["user_id"] for r in admin_roles}

    # Detectar duplicatas pending pelo mesmo user_id
    pending_counts: dict[str, int] = {}
    all_pending = (
        supabase.table("admin_requests")
        .select("user_id")
        .eq("status", "pending")
        .execute()
        .data
        or []
    )
    for row in all_pending:
        pending_counts[row["user_id"]] = pending_counts.get(row["user_id"], 0) + 1

    ok_count = 0
    fail_count = 0

    print(f"Validando {len(requests)} solicitação(ões) pending...\n")
    for rec in requests:
        uid = rec.get("user_id")
        errors = validate_request(
            rec,
            profile_exists=uid in profile_ids,
            already_admin=uid in admin_user_ids,
            duplicate_pending=pending_counts.get(uid, 0) > 1,
            supabase=supabase,
        )
        header = f"{rec.get('id')}  ({rec.get('email') or '-'})"
        if errors:
            fail_count += 1
            print(f"[FAIL] {header}")
            for e in errors:
                print(f"       - {e}")
        else:
            ok_count += 1
            print(f"[ OK ] {header}")

    print("\n--- Resumo ---")
    print(f"Total verificado : {len(requests)}")
    print(f"Aprováveis       : {ok_count}")
    print(f"Com falhas       : {fail_count}")

    return 0 if fail_count == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
