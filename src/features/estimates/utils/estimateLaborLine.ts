type LaborLineInput = {
  unit: string;
  description: string;
  kind?: 'labor' | 'material';
  stageKind?: string;
};

function descriptionLooksMaterial(description: string): boolean {
  const d = description.toLowerCase();
  return (
    d.includes('(material)') ||
    d.includes('material') ||
    d.includes('materiale') ||
    d.includes('componente') ||
    d.includes('component') ||
    d.includes('piese') ||
    d.includes('licen')
  );
}

function descriptionLooksLabor(description: string, unit: string): boolean {
  const d = description.toLowerCase();
  return (
    unit === 'ore' ||
    unit === 'h' ||
    d.includes('manoperă') ||
    d.includes('manopera') ||
    d.includes('lucrări') ||
    d.includes('lucrari') ||
    d.includes('labor') ||
    d.includes('dezvoltare') ||
    d.includes('design') ||
    d.includes('audit') ||
    d.includes('testare') ||
    d.includes('instruire') ||
    d.includes('suport') ||
    d.includes('migrare') ||
    d.includes('configurare') ||
    d.includes('instalare') ||
    d.includes('diagnostic') ||
    d.includes('asamblare pc (lucrări)') ||
    d.includes('asamblare pc (lucrari)')
  );
}

export function isEstimateLaborLine(line: LaborLineInput): boolean {
  if (line.kind === 'labor') return true;
  if (line.kind === 'material') return false;

  const description = line.description.toLowerCase();
  if (descriptionLooksMaterial(description)) return false;
  if (descriptionLooksLabor(description, line.unit)) return true;

  if (line.stageKind === 'MATERIAL') return false;
  return false;
}
