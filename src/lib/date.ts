/** Converte ISO YYYY-MM-DD em Date local (sem deslocamento UTC). */
export function fromISODate(iso: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(iso);
}

/** Calcula a idade em anos completos a partir de uma data de nascimento (ISO YYYY-MM-DD ou Date). */
export function calcularIdade(dataNascimento: string | Date): number {
  const d = typeof dataNascimento === "string" ? fromISODate(dataNascimento) : dataNascimento;
  if (Number.isNaN(d.getTime())) return 0;
  const hoje = new Date();
  let idade = hoje.getFullYear() - d.getFullYear();
  const m = hoje.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < d.getDate())) idade--;
  return Math.max(0, idade);
}


/** Formata uma data ISO ou Date como dd/mm/aaaa. */
export function formatarDataBR(data: string | Date): string {
  const d = typeof data === "string" ? new Date(data) : data;
  if (Number.isNaN(d.getTime())) return "";
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

/** Retorna data ISO YYYY-MM-DD a partir de um Date local. */
export function toISODate(d: Date): string {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export const IDADE_MIN = 8;
export const IDADE_MAX = 40;
