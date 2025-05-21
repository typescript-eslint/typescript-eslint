interface TsParsedEnums {
  LanguageVariant: Record<number, string>;
  ModifierFlags: Record<number, string>;
  NodeFlags: Record<number, string>;
  ObjectFlags: Record<number, string>;
  ScriptKind: Record<number, string>;
  ScriptTarget: Record<number, string>;
  SymbolFlags: Record<number, string>;
  SyntaxKind: Record<number, string>;
  TokenFlags: Record<number, string>;
  TransformFlags: Record<number, string>;
  TypeFlags: Record<number, string>;
}

/**
 * Extract the enum values from the TypeScript enum.
 * typescript enum's have duplicates, and we always want to take first one.
 * e.g. SyntaxKind.EqualsToken = 63, SyntaxKind.FirstAssignment = 63
 */
export function extractEnum(
  obj: Record<number, number | string>,
): Record<number, string> {
  const result: Record<number, string> = {};
  const keys = Object.entries(obj);
  for (const [name, value] of keys) {
    if (typeof value === 'number' && !(value in result)) {
      result[value] = name;
    }
  }
  return result;
}

let tsEnumCache: TsParsedEnums | undefined;

/**
 * Get the TypeScript enum values.
 */
function getTsEnum(type: keyof TsParsedEnums): Record<number, string> {
  tsEnumCache ??= {
    LanguageVariant: extractEnum(window.ts.LanguageVariant),
    ModifierFlags: extractEnum(window.ts.ModifierFlags),
    NodeFlags: extractEnum(window.ts.NodeFlags),
    ObjectFlags: extractEnum(window.ts.ObjectFlags),
    ScriptKind: extractEnum(window.ts.ScriptKind),
    ScriptTarget: extractEnum(window.ts.ScriptTarget),
    SymbolFlags: extractEnum(window.ts.SymbolFlags),
    SyntaxKind: extractEnum(window.ts.SyntaxKind),
    TokenFlags: extractEnum(window.ts.TokenFlags),
    TypeFlags: extractEnum(window.ts.TypeFlags),
    // @ts-expect-error: non public API
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    TransformFlags: extractEnum(window.ts.TransformFlags),
  };
  return tsEnumCache[type];
}

/**
 * Convert a TypeScript enum value to a string.
 */
export function tsEnumToString(
  type: keyof TsParsedEnums,
  value: number,
): string | undefined {
  return getTsEnum(type)[value];
}

/**
 * Convert a TypeScript enum flag value to a concatenated string of the flags.
 */
export function tsEnumFlagToString(
  type: keyof TsParsedEnums,
  value: number,
): string | undefined {
  return Object.entries(getTsEnum(type))
    .filter(([f]) => (Number(f) & value) !== 0)
    .map(([, name]) => `${type}.${name}`)
    .join('\n');
}
