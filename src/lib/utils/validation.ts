/**
 * Utilitários de validação para formulários
 */

/**
 * Remove máscaras de um valor (remove caracteres não numéricos)
 */
export function removeMask(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Valida CPF (11 dígitos) ou CNPJ (14 dígitos)
 */
export function validateCpfCnpj(cpfCnpj: string): { isValid: boolean; error?: string } {
  const cleaned = removeMask(cpfCnpj);
  
  if (!cleaned) {
    return { isValid: false, error: 'CPF/CNPJ é obrigatório' };
  }
  
  if (cleaned.length === 11) {
    // Validação básica de CPF (11 dígitos)
    if (!/^\d{11}$/.test(cleaned)) {
      return { isValid: false, error: 'CPF deve conter 11 dígitos' };
    }
    // Validação de dígitos verificadores do CPF (opcional, mas recomendado)
    if (!isValidCPF(cleaned)) {
      return { isValid: false, error: 'CPF inválido' };
    }
    return { isValid: true };
  } else if (cleaned.length === 14) {
    // Validação básica de CNPJ (14 dígitos)
    if (!/^\d{14}$/.test(cleaned)) {
      return { isValid: false, error: 'CNPJ deve conter 14 dígitos' };
    }
    // Validação de dígitos verificadores do CNPJ (opcional, mas recomendado)
    if (!isValidCNPJ(cleaned)) {
      return { isValid: false, error: 'CNPJ inválido' };
    }
    return { isValid: true };
  } else {
    return { isValid: false, error: 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos' };
  }
}

/**
 * Valida CPF usando algoritmo de dígitos verificadores
 */
function isValidCPF(cpf: string): boolean {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false; // Todos os dígitos iguais
  }
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) return false;
  
  return true;
}

/**
 * Valida CNPJ usando algoritmo de dígitos verificadores
 */
function isValidCNPJ(cnpj: string): boolean {
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
    return false; // Todos os dígitos iguais
  }
  
  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  const digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  length = length + 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
}

/**
 * Valida telefone com DDD (10 ou 11 dígitos após remover máscara)
 */
export function validatePhone(phone: string): { isValid: boolean; error?: string } {
  const cleaned = removeMask(phone);
  
  if (!cleaned) {
    return { isValid: false, error: 'Telefone é obrigatório' };
  }
  
  // Telefone fixo: 10 dígitos (DDD + número)
  // Celular: 11 dígitos (DDD + número com 9)
  if (cleaned.length === 10 || cleaned.length === 11) {
    // Verifica se começa com DDD válido (11-99)
    const ddd = cleaned.substring(0, 2);
    if (parseInt(ddd) < 11 || parseInt(ddd) > 99) {
      return { isValid: false, error: 'DDD inválido' };
    }
    return { isValid: true };
  }
  
  return { isValid: false, error: 'Telefone deve conter 10 ou 11 dígitos (com DDD)' };
}

/**
 * Valida CEP (8 dígitos)
 */
export function validateCep(cep: string): { isValid: boolean; error?: string } {
  const cleaned = removeMask(cep);
  
  if (!cleaned) {
    return { isValid: false, error: 'CEP é obrigatório' };
  }
  
  if (cleaned.length !== 8) {
    return { isValid: false, error: 'CEP deve conter 8 dígitos' };
  }
  
  if (!/^\d{8}$/.test(cleaned)) {
    return { isValid: false, error: 'CEP deve conter apenas números' };
  }
  
  return { isValid: true };
}

/**
 * Valida se um endereço não está vazio
 */
export function validateAddress(address: string): { isValid: boolean; error?: string } {
  if (!address || !address.trim()) {
    return { isValid: false, error: 'Endereço é obrigatório' };
  }
  
  if (address.trim().length < 5) {
    return { isValid: false, error: 'Endereço deve ter pelo menos 5 caracteres' };
  }
  
  return { isValid: true };
}
