import { useTranslation } from 'react-i18next';

export const OPTION_TRANSLATIONS: Record<string, { ro: string; ru: string }> = {
  // general shapes & types
  rectangle: { ro: 'Dreptunghi / Pătrat', ru: 'Прямоугольник / Квадрат' },
  'l-shape': { ro: 'Formă L', ru: 'Г-образная' },
  't-shape': { ro: 'Formă T', ru: 'Т-образная' },
  'u-shape': { ro: 'Formă U', ru: 'П-образная' },
  complex: { ro: 'Complex / Atipic', ru: 'Сложная / Нестандартная' },

  // roofing materials
  metal_tile: { ro: 'Țiglă metalică — Econom', ru: 'Металлочерепица — Эконом' },
  ceramic_tile: { ro: 'Țiglă ceramică — Exclusiv (+50% cost)', ru: 'Керамическая черепица — Эксклюзив (+50% к стоимости)' },
  bitumen: { ro: 'Șindrilă bituminoasă — Standard', ru: 'Битумная черепица — Стандарт' },
  standing_seam: { ro: 'Tablă falțuită — Premium (+35% cost)', ru: 'Фальцевая кровля — Премиум (+35% к стоимости)' },
  'Molid Clasa A': { ro: 'Molid Clasa A — Standard', ru: 'Ель Класс А — Стандарт' },
  'Pin Tratativ': { ro: 'Pin Tratativ — Durabil (+15% cost)', ru: 'Сосна обработанная — Прочная (+15% к стоимости)' },
  'Fag Uscat': { ro: 'Fag Uscat — Premium (+30% cost)', ru: 'Бук сухой — Премиум (+30% к стоимости)' },

  // plumbing (santehnika)
  ppr: { ro: 'PPR (Polipropilenă) — Econom', ru: 'ППР (Полипропилен) — Эконом' },
  pex: { ro: 'PEX (Polietilenă reticulată) — Premium (+20% cost)', ru: 'PEX (Сшитый полиэтилен) — Премиум (+20% к стоимости)' },
  multistrat: { ro: 'Multistrat — Standard', ru: 'Металлопластик — Стандарт' },
  cupru: { ro: 'Cupru — Exclusiv (+45% cost)', ru: 'Медь — Эксклюзив (+45% к стоимости)' },

  // paving (pavaj)
  simple: { ro: 'Model Simplu — Standard', ru: 'Простая укладка — Стандарт' },
  mixed: { ro: 'Model Mixt — Mediu (+15% la costul lucrărilor)', ru: 'Смешанная укладка — Средний уровень (+15% к работе)' },
  decorative: { ro: 'Model Decorativ / Complex (+35% la costul lucrărilor)', ru: 'Декоративная / Сложная укладка (+35% к работе)' },
  pedestrian: { ro: 'Trafic pietonal (pavele subțiri)', ru: 'Пешеходный трафик (тонкая плитка)' },
  car: { ro: 'Trafic auto ușor — Mediu (+20% cost)', ru: 'Легковой транспорт — Средняя прочность (+20% к стоимости)' },
  heavy: { ro: 'Trafic greu / camioane — Robust (+45% cost)', ru: 'Грузовой транспорт — Усиленная прочность (+45% к стоимости)' },

  // solar panels (panouri-solare)
  metal: { ro: 'Acoperiș metalic — Standard', ru: 'Металлическая крыша — Стандарт' },
  tile: { ro: 'Acoperiș din țiglă — Complex (+15% la costul lucrărilor)', ru: 'Черепичная крыша — Сложная (+15% к работе)' },
  flat: { ro: 'Acoperiș plat / terasă — Cu balast', ru: 'Плоская крыша / терраса — Балластная' },
  ground: { ro: 'Montaj la sol — Structură specială', ru: 'Наземный монтаж — Спец. конструкция' },
  on_grid: { ro: 'On-Grid (Injectare rețea)', ru: 'On-Grid (Сетевая)' },
  off_grid: { ro: 'Off-Grid (Autonom cu baterii) — Exclusiv (+60% cost)', ru: 'Off-Grid (Автономная с АКБ) — Эксклюзив (+60% к стоимости)' },
  hybrid: { ro: 'Hibrid (Rețea + Baterii) — Premium (+40% cost)', ru: 'Гибридная (Сеть + АКБ) — Премиум (+40% к стоимости)' },
  roof_mount: { ro: 'Montaj pe acoperiș — Standard', ru: 'Монтаж на крыше — Стандарт' },
  ground_mount: { ro: 'Structură la sol — Robust (+25% cost)', ru: 'Наземная конструкция — Усиленная (+25% к стоимости)' },
  ballasted: { ro: 'Structură balastată — Suprafață plată', ru: 'Балластная система — Для плоских крыш' },

  // windows & doors (okna-dveri)
  standard: { ro: 'Standard', ru: 'Стандарт' },
  warm_installation: { ro: 'Montaj cald (ISO-BLOCO) — Premium (+35% la costul lucrărilor)', ru: 'Тёплый монтаж (евромонтаж) — Премиум (+35% к работе)' },
  renovation: { ro: 'Renovare (fără demontare toc) — Econom', ru: 'Реновация (без демонтажа коробки) — Эконом' },
  econom: { ro: 'Clasa Econom', ru: 'Класс Эконом' },
  premium: { ro: 'Clasa Premium (+30% cost)', ru: 'Класс Премиум (+30% к стоимости)' },
  double: { ro: 'Geam dublu (2 sticle) — Econom', ru: 'Двухкамерный стеклопакет (2 стекла) — Эконом' },
  triple: { ro: 'Geam triplu (3 sticle) — Premium (+25% cost)', ru: 'Трёхкамерный стеклопакет (3 стекла) — Премиум (+25% к стоимости)' },
  low_e: { ro: 'Low-E (Eficiență energetică) — Eco', ru: 'Low-E энергосберегающий — Эко' },

  // furniture (mobila)
  pal: { ro: 'PAL melaminat — Econom', ru: 'ДСП ламинированное — Эконом' },
  mdf: { ro: 'MDF vopsit / înfoliat — Premium (+30% cost)', ru: 'МДФ крашеный / плёночный — Премиум (+30% к стоимости)' },
  lemn: { ro: 'Lemn masiv — Exclusiv (+60% cost)', ru: 'Массив дерева — Эксклюзив (+60% к стоимости)' },
  hpl: { ro: 'HPL (Compact laminat) — Ultra-Durabil', ru: 'HPL пластик — Ультра-прочный' },
  basic: { ro: 'Garnituri Basic — Econom', ru: 'Фурнитура Basic — Эконом' },
  premiumHardware: { ro: 'Garnituri Premium — Silent/Auto (+40% cost)', ru: 'Фурнитура Premium — Бесшумная (+40% к стоимости)' },

  // wall/finish condition & quality (lucrari-finisaj)
  new: { ro: 'Construcție nouă (gri/roșu) — Standard', ru: 'Новостройка (серый/красный вариант) — Стандарт' },
  old: { ro: 'Clădire veche (necesită curățare) — Mediu (+20% la costul lucrărilor)', ru: 'Вторичное жилье (требует очистки) — Средне (+20% к работе)' },
  very_bad: { ro: 'Stare degradată / avariată — Dificil (+40% la costul lucrărilor)', ru: 'Аварийное / сильно поврежденное — Сложно (+40% к работе)' },
  economic: { ro: 'Pachet Economic', ru: 'Пакет Экономичный' },

  // IT directions (it-networks)
  web: { ro: 'Dezvoltare Web / Site-uri', ru: 'Веб-разработка / Сайты' },
  security: { ro: 'Securitate cibernetică / CCTV', ru: 'Кибербезопасность / Видеонаблюдение' },
  hardware: { ro: 'Echipamente & Serveri', ru: 'Оборудование и серверы' },
  network: { ro: 'Rețele & Cablare structurată', ru: 'Сети и структурированный кабель' },
  full_stack: { ro: 'Full-Stack IT / Integrare', ru: 'Full-Stack IT / Интеграция' },
  'Mic (1-5 pagini / 1-2 zile)': {
    ro: 'Mic (1-5 pagini / 1-2 zile) — Econom',
    ru: 'Малый (1-5 страниц / 1-2 дня) — Эконом',
  },
  'Mediu (6-20 pagini / 1-2 săptămâni)': {
    ro: 'Mediu (6-20 pagini / 1-2 săptămâni) — Standard',
    ru: 'Средний (6-20 страниц / 1-2 недели) — Стандарт',
  },
  'Enterprise (20+ pagini / 1+ lună)': {
    ro: 'Enterprise (20+ pagini / 1+ lună) — Premium',
    ru: 'Крупный / Корпоративный (20+ страниц / 1+ месяц) — Премиум',
  },

  // facade materials (fatade)
  polistiren: { ro: 'Polistiren — Standard', ru: 'Пенополистирол — Стандарт' },
  vata_bazaltica: { ro: 'Vată bazaltică — Premium/Ignifug (+40% cost)', ru: 'Базальтовая вата — Премиум/Огнестойкая (+40% к стоимости)' },
  xps: { ro: 'Polistiren extrudat (XPS) — Ultra-rezistent', ru: 'Экструдированный пенополистирол (XPS) — Цоколь' },
  damaged: { ro: 'Deteriorată (necesită reparații) — Dificil (+25% la costul lucrărilor)', ru: 'Поврежденная (требуется ремонт) — Сложно (+25% к работе)' },

  // wall material for facade dowel density (fatade.wallMaterial)
  panel: { ro: 'Panou beton prefabricat — Dens (-15% dibluri)', ru: 'Бетонные панели — Плотный (-15% дюбелей)' },

  // flat-roof waterproofing membranes (acoperis-plat.waterproofingType)
  bitumen_membrane: { ro: 'Membrană bituminoasă — Econom, durabilitate 15 ani', ru: 'Битумная мембрана — Эконом, срок 15 лет' },
  tpo: { ro: 'TPO termoplastic — Modern, durabilitate 25+ ani (+140% cost)', ru: 'TPO термопластик — Современный, 25+ лет (+140% к стоимости)' },
  pvc: { ro: 'PVC sudat — Modern, durabilitate 25+ ani (+120% cost)', ru: 'ПВХ мембрана — Современная, 25+ лет (+120% к стоимости)' },
  epdm: { ro: 'EPDM cauciuc — Premium, durabilitate 30+ ani (+95% cost)', ru: 'EPDM каучук — Премиум, 30+ лет (+95% к стоимости)' },

  // electrical wall materials (elektrika)
  gips: { ro: 'Gips-carton — Ușor (Fără ștrobire)', ru: 'Гипсокартон — Легко (без штробления)' },
  bca: { ro: 'BCA — Mediu (Ușor de frezat)', ru: 'Газобетон / пеноблок — Средне (легко режется)' },
  caramida: { ro: 'Cărămidă — Greu (+25% la costul lucrărilor)', ru: 'Кирпич — Сложно (+25% к работе)' },
  beton: { ro: 'Beton armat — Extrem (+60% la costul lucrărilor)', ru: 'Железобетон — Экстремально (+60% к работе)' },

  // structural foundation types & masonry (constructii)
  strip: { ro: 'Fundație continuă (centură) — Bază', ru: 'Ленточный фундамент — Базовый' },
  slab: { ro: 'Radier general (placă) — Robust (+30% cost)', ru: 'Плитный фундамент — Усиленный (+30% к стоимости)' },
  pile: { ro: 'Piloni — Soluție geotehnică specială', ru: 'Свайный фундамент — Спец. решение' },
  isolated: { ro: 'Fundație izolată (pahare) — Industrial', ru: 'Столбчатый фундамент — Промышленный' },
  brick: { ro: 'Zidărie cărămidă — Clasic (+20% la costul lucrărilor)', ru: 'Кирпичная кладка — Классика (+20% к работе)' },
  concrete: { ro: 'Beton monolit — Rezistență maximă', ru: 'Монолитный бетон — Макс. прочность' },
  wood_frame: { ro: 'Cadru din lemn — Eco/Rapid', ru: 'Деревянный каркас — Эко/Быстро' },
  monolithic: { ro: 'Planșeu monolit — Premium', ru: 'Монолитное перекрытие — Премиум' },
  prefab: { ro: 'Plăci prefabricate — Standard', ru: 'Сборные плиты перекрытия — Стандарт' },
  wood: { ro: 'Planșeu din lemn — Econom', ru: 'Деревянное перекрытие — Эконом' },

  // cleaning service types & floors (cleaning)
  deep: { ro: 'Curățenie generală — Profundă (+35% cost)', ru: 'Генеральная уборка — Глубокая (+35% к стоимости)' },
  post_construction: { ro: 'Curățenie după constructor — Complex (+65% cost)', ru: 'Уборка после ремонта — Сложная (+65% к стоимости)' },
  move_out: { ro: 'Curățenie la mutare — Detaliată (+25% cost)', ru: 'Уборка при въезде/выезде — Детальная (+25% к стоимости)' },
  carpet: { ro: 'Mochetă / covoare — Aspirare profesională', ru: 'Ковролин / ковры — Проф. очистка' },

  // cleaning afterRepairDustLevel options
  low: { ro: 'Praf scăzut (lucrări minore)', ru: 'Низкий уровень пыли (мелкие работы)' },
  medium: { ro: 'Praf mediu — reparații (+15% cost)', ru: 'Средний — после ремонта (+15% к стоимости)' },
  high: { ro: 'Praf ridicat — construcție completă (+35% cost)', ru: 'Сильное запыление — после стройки (+35% к стоимости)' },
};

export function useTranslateOption() {
  const { i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage || i18n.language || 'ro') as 'ro' | 'ru';

  return (value: unknown): string => {
    if (value == null) return '';
    const key = String(value).trim();
    if (!key) return '';
    const item = OPTION_TRANSLATIONS[key];
    if (item) {
      return item[lang] || item['ro'] || key;
    }
    return key.replace(/_/g, ' ');
  };
}
