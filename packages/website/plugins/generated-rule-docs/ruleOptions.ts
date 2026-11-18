const optionRegex = /option='(?<option>.*?)'/;

export function getSerializedRuleOptionsFromMeta(
  meta: string | null | undefined,
): string | undefined {
  return meta?.match(optionRegex)?.groups?.option;
}

export function parseRuleOptionsFromMeta(
  meta: string | null | undefined,
): readonly unknown[] {
  const serializedOptions = getSerializedRuleOptionsFromMeta(meta);
  if (!serializedOptions) {
    return [];
  }

  return JSON.parse(`[${serializedOptions}]`) as unknown[];
}
