export function normalizePhone(input: string): string {
  const compact = input.replace(/[\s\-().]/g, '');
  const digitsOnly = compact.replace(/\D/g, '');

  if (digitsOnly.length === 8) return `+373${digitsOnly}`;
  if (digitsOnly.startsWith('373') && digitsOnly.length === 11) return `+${digitsOnly}`;
  if (compact.startsWith('+')) return `+${digitsOnly}`;
  if (digitsOnly.startsWith('0') && digitsOnly.length === 9) return `+373${digitsOnly.slice(1)}`;

  return compact;
}

export function isEmailLogin(value: string): boolean {
  return value.includes('@');
}
