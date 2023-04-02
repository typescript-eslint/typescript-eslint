interface TsParsedEnums {
  SyntaxKind: Record<number, string>;
  NodeFlags: Record<number, string>;
  TokenFlags: Record<number, string>;
  ModifierFlags: Record<number, string>;
  ObjectFlags: Record<number, string>;
  SymbolFlags: Record<number, string>;
  FlowFlags: Record<number, string>;
  TypeFlags: Record<number, string>;
  ScriptKind: Record<number, string>;
  TransformFlags: Record<number, string>;
  ScriptTarget: Record<number, string>;
  LanguageVariant: Record<number, string>;
}

/**
 * Extract the enum values from the TypeScript enum.
 * typescript enum's have duplicates, and we always want to take first one.
 * e.g. SyntaxKind.EqualsToken = 63, SyntaxKind.FirstAssignment = 63
 */
export function extractEnum(
  obj: Record<number, string | number>,
): Record<number, string> {
  const result: Record<number, string> = {};
  const keys = Object.entries(obj);
  for (const [name, value] of keys) {
    if (typeof value === 'number') {
      if (!(value in result)) {
        result[value] = name;
      }
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
    SyntaxKind: extractEnum(window.ts.SyntaxKind),
    NodeFlags: extractEnum(window.ts.NodeFlags),
    TokenFlags: extractEnum(window.ts.TokenFlags),
    ModifierFlags: extractEnum(window.ts.ModifierFlags),
    ObjectFlags: extractEnum(window.ts.ObjectFlags),
    SymbolFlags: extractEnum(window.ts.SymbolFlags),
    FlowFlags: extractEnum(window.ts.FlowFlags),
    TypeFlags: extractEnum(window.ts.TypeFlags),
    ScriptKind: extractEnum(window.ts.ScriptKind),
    ScriptTarget: extractEnum(window.ts.ScriptTarget),
    LanguageVariant: extractEnum(window.ts.LanguageVariant),
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
  return getTsEnum(type)?.[value];
}

/**
 * Convert a TypeScript enum flag value to a concatenated string of the flags.
 */
export function tsEnumFlagToString(
  type: keyof TsParsedEnums,
  value: number,
): string | undefined {
  const allFlags = getTsEnum(type);
  if (allFlags) {
    return Object.entries(allFlags)
      .filter(([f]) => (Number(f) & value) !== 0)
      .map(([, name]) => `${type}.${name}`)
      .join('\n');
  }
  return '';
}
