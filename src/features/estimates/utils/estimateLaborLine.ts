type LaborLineInput = {
  unit: string;
  description: string;
  kind?: 'labor' | 'material';
  stageKind?: string;
};

export function isEstimateLaborLine(line: LaborLineInput): boolean {
  if (line.kind === 'labor' || line.stageKind === 'LABOR') return true;
  if (line.kind === 'material' || line.stageKind === 'MATERIAL') return false;
  const description = line.description.toLowerCase();
  return (
    line.unit === 'ore' ||
    line.unit === 'h' ||
    description.includes('manoperă') ||
    description.includes('manopera') ||
    description.includes('lucrări') ||
    description.includes('lucrari') ||
    description.includes('labor') ||
    description.includes('dezvoltare') ||
    description.includes('design') ||
    description.includes('audit') ||
    description.includes('testare') ||
    description.includes('instruire') ||
    description.includes('suport') ||
    description.includes('migrare') ||
    description.includes('configurare') ||
    description.includes('instalare')
  );
}
