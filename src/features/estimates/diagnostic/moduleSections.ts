const MODULE_SECTION_MAP: Record<string, { key: string; label: string }> = {
  // it-networks
  audit: { key: 'general', label: 'General' },
  web_design: { key: 'web', label: 'Web' },
  frontend: { key: 'web', label: 'Web' },
  backend: { key: 'web', label: 'Web' },
  cms: { key: 'web', label: 'Web' },
  ecommerce: { key: 'web', label: 'Web' },
  network_cabling: { key: 'infrastructure', label: 'Infrastructură' },
  cameras: { key: 'security', label: 'Securitate' },
  servers: { key: 'infrastructure', label: 'Infrastructură' },
  security: { key: 'security', label: 'Securitate' },
  hardware_components: { key: 'hardware', label: 'Hardware' },
  migration: { key: 'support', label: 'Suport' },
  sla: { key: 'support', label: 'Suport' },
  // it-hardware
  diagnostic_hw: { key: 'general', label: 'General' },
  repair: { key: 'repair', label: 'Reparație' },
  assembly: { key: 'assembly', label: 'Asamblare' },
  upgrade: { key: 'upgrade', label: 'Upgrade' },
  cleaning_hw: { key: 'maintenance', label: 'Mentenanță' },
  os_install: { key: 'software', label: 'Software' },
  data_recovery: { key: 'recovery', label: 'Recuperare' },
  peripheral: { key: 'peripheral', label: 'Periferice' },
  // elektrika
  project: { key: 'planning', label: 'Proiectare' },
  chasing: { key: 'preparation', label: 'Pregătire' },
  cabling: { key: 'wiring', label: 'Cablare' },
  panel: { key: 'panel_board', label: 'Tablou' },
  devices: { key: 'devices_fit', label: 'Aparataj' },
  low_voltage: { key: 'wiring', label: 'Cablare' },
  smart_home: { key: 'devices_fit', label: 'Aparataj' },
  testing: { key: 'finishing', label: 'Finalizare' },
  // santehnika
  water_pipes: { key: 'water_supply', label: 'Alimentare apă' },
  drain: { key: 'drainage', label: 'Canalizare' },
  sanitary_objects: { key: 'fixtures', label: 'Obiecte sanitare' },
  boiler: { key: 'fixtures', label: 'Obiecte sanitare' },
  wall_chasing: { key: 'preparation', label: 'Pregătire' },
  // constructii
  constructii_project: { key: 'planning', label: 'Proiectare' },
  excavation: { key: 'earthworks', label: 'Terasament' },
  foundation: { key: 'foundation_section', label: 'Fundație' },
  waterproofing: { key: 'foundation_section', label: 'Fundație' },
  structure: { key: 'structure_section', label: 'Structură' },
  slab: { key: 'structure_section', label: 'Structură' },
  stairs: { key: 'finishing', label: 'Finisaje' },
  roof: { key: 'roofing', label: 'Acoperiș' },
  utilities: { key: 'finishing', label: 'Finisaje' },
};

export function getModuleSection(moduleKey: string): { key: string; label: string } {
  return MODULE_SECTION_MAP[moduleKey] ?? { key: 'general', label: 'General' };
}

export const MODULE_SECTIONS = [
  'general', 'web', 'infrastructure', 'hardware', 'security', 'support',
  'repair', 'assembly', 'upgrade', 'maintenance', 'software', 'recovery', 'peripheral',
] as const;