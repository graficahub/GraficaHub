/**
 * Utilitários de máscara para campos de formulário
 */

/**
 * Aplica máscara de CPF: 000.000.000-00
 */
export function maskCPF(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 11) {
    return cleaned
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return value;
}

/**
 * Aplica máscara de CNPJ: 00.000.000/0000-00
 */
export function maskCNPJ(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 14) {
    return cleaned
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }
  return value;
}

/**
 * Aplica máscara de CPF/CNPJ automaticamente baseado no tamanho
 */
export function maskCpfCnpj(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 11) {
    return maskCPF(cleaned);
  } else {
    return maskCNPJ(cleaned);
  }
}

/**
 * Aplica máscara de telefone: (00) 00000-0000 ou (00) 0000-0000
 */
export function maskPhone(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 11) {
    if (cleaned.length <= 10) {
      // Telefone fixo: (00) 0000-0000
      return cleaned
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      // Celular: (00) 00000-0000
      return cleaned
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
  }
  return value;
}

/**
 * Aplica máscara de CEP: 00000-000
 */
export function maskCEP(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 8) {
    return cleaned.replace(/(\d{5})(\d)/, '$1-$2');
  }
  return value;
}
