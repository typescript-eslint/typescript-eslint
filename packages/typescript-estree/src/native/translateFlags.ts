type FlagTranslations = readonly (readonly [number, number])[];

/** Pairs bits up by name; composite masks are built from the single bits. */
export function createFlagTranslations(
  nativeFlags: object,
  classicFlags: object,
): FlagTranslations {
  const classic = classicFlags as Record<string, unknown>;
  return Object.entries(nativeFlags).flatMap(([name, value]) => {
    const native: number = typeof value === 'number' ? value : 0;
    const isSingleBit = native > 0 && (native & (native - 1)) === 0;
    return isSingleBit && typeof classic[name] === 'number'
      ? [[native, classic[name]] as const]
      : [];
  });
}

export function translateFlags(
  translations: FlagTranslations,
  flags: number,
): number {
  let translated = 0;
  for (const [nativeFlag, classicFlag] of translations) {
    if (flags & nativeFlag) {
      translated |= classicFlag;
    }
  }
  return translated;
}
