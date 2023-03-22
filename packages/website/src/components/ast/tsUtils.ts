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

export function getTsEnum(type: keyof TsParsedEnums): Record<number, string> {
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

export function tsEnumValue(
  type: keyof TsParsedEnums,
  value: unknown,
): string | undefined {
  const allFlags = getTsEnum(type);
  if (allFlags) {
    return allFlags[Number(value)];
  }
  return undefined;
}

export function expandFlags(
  type: keyof TsParsedEnums,
  value: unknown,
): string | undefined {
  const allFlags = getTsEnum(type);
  const flags = Number(value);
  if (allFlags) {
    return Object.entries(allFlags)
      .filter(([f, _]) => (Number(f) & flags) !== 0)
      .map(([_, name]) => `${type}.${name}`)
      .join('\n');
  }
  return '';
}
