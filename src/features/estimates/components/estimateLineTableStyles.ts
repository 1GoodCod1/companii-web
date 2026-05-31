/** Shared field styles for estimate line tables (Stages + Review). */
export const estimateLineInputBase =
  'h-8 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-800 shadow-xs transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-gray-500';

export const estimateLineQtyInput = `${estimateLineInputBase} mx-auto block w-[4.5rem] px-2 text-center tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`;

export const estimateLinePriceInput = `${estimateLineInputBase} w-[5.25rem] px-2 text-right tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`;

export const estimateLineUnitSelect = `${estimateLineInputBase} w-full cursor-pointer appearance-none text-center pl-2 pr-7 tabular-nums`;

export const estimateLineNumericCell = 'py-3 align-middle';

export const estimateLineNumericCellCenter = `${estimateLineNumericCell} text-center`;

export const estimateLineNumericCellEnd = `${estimateLineNumericCell} text-right`;

export const estimateLineFieldWrap = 'inline-flex w-[4.5rem] items-center justify-center';

export const estimateLinePriceWrap = 'ml-auto inline-flex items-center justify-end gap-1.5';

export const estimateLineColQty = 'w-[4.5rem]';

export const estimateLineColUnit = 'w-[4.5rem]';

export const estimateLineColPrice = 'w-[7.5rem]';

export const estimateLineColTotal = 'w-[6.5rem]';
