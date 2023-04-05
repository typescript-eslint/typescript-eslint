import type * as ts from 'typescript';

import type { ASTMaps } from './convert';
import type { ParserServices } from './parser-options';

type MethodKeyOf<Container> = keyof {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [Key in keyof Container]: Container[Key] extends (arg: any) => void
    ? Key
    : never;
};

function memoizeMethods<Container, Keys extends MethodKeyOf<Container>[]>(
  container: Container,
  keys: Keys,
): void {
  for (const key of keys) {
    const originalMethod = (
      container[key] as (parameter: object) => unknown
    ).bind(container);
    const cache = new WeakMap<object, unknown>();

    container[key] = ((parameter: object): unknown => {
      const cached = cache.get(parameter);
      if (cached) {
        return cached;
      }

      const created = originalMethod(parameter);
      cache.set(parameter, created);
      return created;
    }) as Container[typeof key];
  }
}

export function createParserServices(
  astMaps: ASTMaps,
  program: ts.Program | null,
  memoize: boolean,
): ParserServices {
  if (!program) {
    // we always return the node maps because
    // (a) they don't require type info and
    // (b) they can be useful when using some of TS's internal non-type-aware AST utils
    return { program, ...astMaps };
  }

  const checker = program.getTypeChecker();

  if (memoize) {
    memoizeMethods(checker, [
      'getApparentType',
      'getContextualType',
      'getPropertyOfType',
      'getSymbolAtLocation',
      'getTypeAtLocation',
      'getTypeOfSymbolAtLocation',
    ]);
  }

  return {
    program,
    ...astMaps,
    getSymbolAtLocation: node =>
      checker.getSymbolAtLocation(astMaps.esTreeNodeToTSNodeMap.get(node)),
    getTypeAtLocation: node =>
      checker.getTypeAtLocation(astMaps.esTreeNodeToTSNodeMap.get(node)),
  };
}
