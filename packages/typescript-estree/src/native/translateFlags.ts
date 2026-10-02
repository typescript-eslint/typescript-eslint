type FlagTranslations = readonly (readonly [number, number])[];

export function createFlagTranslations(
  nativeFlags: Readonly<Record<string, number | string>>,
  classicFlags: Readonly<Record<string, number | string>>,
): FlagTranslations {
  return Object.entries(nativeFlags).flatMap(([name, native]) => {
    const classic = classicFlags[name];
    return typeof native === 'number' &&
      native > 0 &&
      (native & (native - 1)) === 0 &&
      typeof classic === 'number'
      ? [[native, classic] as const]
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
