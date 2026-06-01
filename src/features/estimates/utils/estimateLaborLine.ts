type LaborLineInput = {
  unit: string;
  description: string;
  kind?: 'labor' | 'material';
};

export function isEstimateLaborLine(line: LaborLineInput): boolean {
  if (line.kind === 'labor') return true;
  if (line.kind === 'material') return false;
  const description = line.description.toLowerCase();
  return (
    line.unit === 'ore' ||
    line.unit === 'h' ||
    description.includes('manoperă') ||
    description.includes('manopera') ||
    description.includes('lucrări') ||
    description.includes('lucrari') ||
    description.includes('labor')
  );
}
