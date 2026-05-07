/**
 * Simulated backend registry for admin/club users with token-based activation.
 * In production, this would be a database table with proper server-side logic.
 */

export type UserStatus = "pendente" | "ativo";
export type RegistryRole = "admin" | "clube";

export interface RegisteredUser {
  id: string;
  role: RegistryRole;
  nome: string;
  email: string;
  senha: string;
  status: UserStatus;
  token: string;
  createdAt: string;
  // Club-specific fields
  nomeClube?: string;
  cnpj?: string;
}

const STORAGE_KEY = "png_user_registry";

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function generateId(): string {
  return `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getRegistry(): RegisteredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RegisteredUser[]) : [];
  } catch {
    return [];
  }
}

function saveRegistry(users: RegisteredUser[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function registerAdmin(data: {
  nome: string;
  email: string;
  senha: string;
}): { success: boolean; error?: string } {
  const registry = getRegistry();
  if (registry.some((u) => u.email === data.email)) {
    return { success: false, error: "Este e-mail já está cadastrado." };
  }
  const user: RegisteredUser = {
    id: generateId(),
    role: "admin",
    nome: data.nome,
    email: data.email,
    senha: data.senha,
    status: "pendente",
    token: generateToken(),
    createdAt: new Date().toISOString(),
  };
  registry.push(user);
  saveRegistry(registry);
  return { success: true };
}

export function registerClube(data: {
  nomeClube: string;
  cnpj: string;
  nome: string;
  email: string;
  senha: string;
}): { success: boolean; error?: string } {
  const registry = getRegistry();
  if (registry.some((u) => u.email === data.email)) {
    return { success: false, error: "Este e-mail já está cadastrado." };
  }
  const user: RegisteredUser = {
    id: generateId(),
    role: "clube",
    nome: data.nome,
    nomeClube: data.nomeClube,
    cnpj: data.cnpj,
    email: data.email,
    senha: data.senha,
    status: "pendente",
    token: generateToken(),
    createdAt: new Date().toISOString(),
  };
  registry.push(user);
  saveRegistry(registry);
  return { success: true };
}

export function authenticateUser(
  email: string,
  senha: string
): { success: boolean; user?: RegisteredUser; error?: string } {
  const registry = getRegistry();
  const user = registry.find((u) => u.email === email && u.senha === senha);
  if (!user) {
    return { success: false, error: "E-mail ou senha incorretos." };
  }
  // Restrição de ativação temporariamente desabilitada
  // if (user.status === "pendente") {
  //   return {
  //     success: false,
  //     error: "Acesso não liberado. Entre em contato com o suporte.",
  //   };
  // }
  return { success: true, user };
}

export function activateUser(userId: string): boolean {
  const registry = getRegistry();
  const idx = registry.findIndex((u) => u.id === userId);
  if (idx === -1) return false;
  registry[idx].status = "ativo";
  saveRegistry(registry);
  return true;
}

export function getPendingUsers(): RegisteredUser[] {
  return getRegistry().filter((u) => u.status === "pendente");
}

export function getAllUsers(): RegisteredUser[] {
  return getRegistry();
}
