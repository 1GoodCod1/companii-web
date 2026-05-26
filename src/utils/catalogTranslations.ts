export function buildCatalogTranslations(roName: string, ruName?: string) {
  const ro = roName.trim();
  const ru = ruName?.trim() || ro;
  return {
    ro: { name: ro },
    ru: { name: ru },
  };
}

export function readCatalogRuName(
  translations?: Record<string, { name?: string }> | null,
): string {
  return translations?.ru?.name?.trim() ?? '';
}
