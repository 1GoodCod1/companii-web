export type PointTemplate = {
  key: string;
  labelRo: string;
  labelRu: string;
  counts: Record<string, number>;
};

export const CATEGORY_TEMPLATES: Record<string, PointTemplate[]> = {
  santehnika: [
    {
      key: 'baie_standard',
      labelRo: 'Baie standard (1)',
      labelRu: 'Ванная стандарт (1)',
      counts: { water: 2, drain: 2, mixer: 2, toilet: 1 },
    },
    {
      key: 'baie_bucatarie',
      labelRo: 'Baie + Bucătărie',
      labelRu: 'Ванная + Кухня',
      counts: { water: 4, drain: 3, mixer: 3, toilet: 1 },
    },
  ],
  elektrika: [
    {
      key: 'apartament_1_camera',
      labelRo: 'Apartament 1 cameră',
      labelRu: 'Квартира 1-комнатная',
      counts: { socket: 6, switch: 3, light: 4, panel: 1 },
    },
    {
      key: 'apartament_2_camere',
      labelRo: 'Apartament 2 camere',
      labelRu: 'Квартира 2-комнатная',
      counts: { socket: 10, switch: 5, light: 7, panel: 1 },
    },
    {
      key: 'casa_etaj',
      labelRo: 'Casă 1 etaj',
      labelRu: 'Дом 1 этаж',
      counts: { socket: 14, switch: 7, light: 10, panel: 1 },
    },
    {
      key: 'doar_tablou',
      labelRo: 'Doar tablou electric',
      labelRu: 'Только электрощит',
      counts: { panel: 1 },
    },
  ],
  clima: [
    {
      key: 'apartament_1_ac',
      labelRo: '1 unitate AC',
      labelRu: '1 кондиционер',
      counts: { indoor: 1, outdoor: 1 },
    },
    {
      key: 'apartament_2_ac',
      labelRo: '2 unități AC',
      labelRu: '2 кондиционера',
      counts: { indoor: 2, outdoor: 2 },
    },
  ],
  'lucrari-finisaj': [
    {
      key: 'zugraveli',
      labelRo: 'Doar zugrăveli',
      labelRu: 'Только покраска',
      counts: { wall: 1, ceiling: 1 },
    },
    {
      key: 'renovare_completa',
      labelRo: 'Renovare completă',
      labelRu: 'Полный ремонт',
      counts: { wall: 3, ceiling: 2, floor: 2, door: 2 },
    },
  ],
  acoperis: [
    {
      key: 'standard',
      labelRo: 'Acoperiș standard',
      labelRu: 'Кровля стандарт',
      counts: {},
    },
  ],
  fatade: [
    {
      key: 'standard',
      labelRo: 'Fațadă standard',
      labelRu: 'Фасад стандарт',
      counts: {},
    },
  ],
  'okna-dveri': [
    {
      key: 'apartament_2_camere',
      labelRo: 'Apartament 2 camere',
      labelRu: 'Квартира 2-комнатная',
      counts: { window: 3, door: 1 },
    },
    {
      key: 'casa',
      labelRo: 'Casă',
      labelRu: 'Дом',
      counts: { window: 6, door: 2 },
    },
  ],
  mobila: [
    {
      key: 'bucatarie',
      labelRo: 'Bucătărie',
      labelRu: 'Кухня',
      counts: { cabinet: 5, wardrobe: 0 },
    },
    {
      key: 'dormitor',
      labelRo: 'Dormitor',
      labelRu: 'Спальня',
      counts: { wardrobe: 2, cabinet: 1 },
    },
  ],
  cleaning: [
    {
      key: 'apartament',
      labelRo: 'Apartament',
      labelRu: 'Квартира',
      counts: { room: 3, bathroom: 1, window: 4 },
    },
    {
      key: 'casa',
      labelRo: 'Casă',
      labelRu: 'Дом',
      counts: { room: 5, bathroom: 2, window: 8 },
    },
  ],
  'it-networks': [
    {
      key: 'retsea_mica',
      labelRo: 'Rețea mică (3 camere)',
      labelRu: 'Сеть малая (3 комнаты)',
      counts: { networkPoint: 4, ap: 1, camera: 1 },
    },
    {
      key: 'retsea_medie',
      labelRo: 'Rețea medie (birou)',
      labelRu: 'Сеть средняя (офис)',
      counts: { networkPoint: 12, ap: 3, camera: 4 },
    },
  ],
};

export function getTemplatesForCategory(categorySlug: string): PointTemplate[] {
  return CATEGORY_TEMPLATES[categorySlug] ?? [];
}