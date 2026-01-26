/**
 * Utilitários para verificação de perfil completo
 */

export interface UserProfile {
  email?: string | null;
  name?: string | null;
  cpf_cnpj?: string | null;
  phone?: string | null;
  address?: string | null;
  cep?: string | null;
}

/**
 * Verifica se o perfil do usuário está completo (todos os campos obrigatórios preenchidos)
 * 
 * Campos obrigatórios:
 * - email
 * - name
 * - cpf_cnpj
 * - phone
 * - address
 * - cep
 */
export function isProfileComplete(profile: UserProfile | null | undefined): boolean {
  if (!profile) {
    return false;
  }

  // Verifica se todos os campos obrigatórios estão preenchidos
  const hasEmail = !!profile.email && profile.email.trim().length > 0;
  const hasName = !!profile.name && profile.name.trim().length > 0;
  const hasCpfCnpj = !!profile.cpf_cnpj && profile.cpf_cnpj.trim().length > 0;
  const hasPhone = !!profile.phone && profile.phone.trim().length > 0;
  const hasAddress = !!profile.address && profile.address.trim().length > 0;
  const hasCep = !!profile.cep && profile.cep.trim().length > 0;

  return hasEmail && hasName && hasCpfCnpj && hasPhone && hasAddress && hasCep;
}

/**
 * Retorna lista de campos faltantes no perfil
 */
export function getMissingFields(profile: UserProfile | null | undefined): string[] {
  if (!profile) {
    return ['email', 'name', 'cpf_cnpj', 'phone', 'address', 'cep'];
  }

  const missing: string[] = [];

  if (!profile.email || !profile.email.trim()) {
    missing.push('email');
  }
  if (!profile.name || !profile.name.trim()) {
    missing.push('name');
  }
  if (!profile.cpf_cnpj || !profile.cpf_cnpj.trim()) {
    missing.push('cpf_cnpj');
  }
  if (!profile.phone || !profile.phone.trim()) {
    missing.push('phone');
  }
  if (!profile.address || !profile.address.trim()) {
    missing.push('address');
  }
  if (!profile.cep || !profile.cep.trim()) {
    missing.push('cep');
  }

  return missing;
}
