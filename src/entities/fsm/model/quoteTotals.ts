import type { QuoteLineDto } from './types';

type QuoteLineAmounts = Pick<QuoteLineDto, 'qty' | 'unitPrice' | 'vatRate'>;

/** VAT computed from quote lines — the invoice bills it on top of the net total. */
export function quoteTvaAmount(lines: QuoteLineAmounts[] | undefined): number {
  if (!lines?.length) return 0;
  const tva = lines.reduce(
    (acc, line) =>
      acc + Number(line.qty) * Number(line.unitPrice) * (Number(line.vatRate ?? 0) / 100),
    0,
  );
  return Math.round(tva * 100) / 100;
}
