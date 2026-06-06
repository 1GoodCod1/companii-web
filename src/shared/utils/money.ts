const mdlFull = new Intl.NumberFormat('ro-MD', {
  style: 'currency',
  currency: 'MDL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const mdlCompact = new Intl.NumberFormat('ro-MD', {
  style: 'currency',
  currency: 'MDL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatMdl(value: number | null | undefined): string {
  return mdlFull.format(Number(value ?? 0));
}

export function formatMdlCompact(value: number | null | undefined): string {
  return mdlCompact.format(Number(value ?? 0));
}
