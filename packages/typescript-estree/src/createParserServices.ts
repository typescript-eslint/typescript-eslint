import type * as ts from 'typescript';

import type { ASTMaps } from './convert';
import type { ParserServices } from './parser-options';

function memoize<Key extends object, Return>(
  get: (key: Key) => Return,
): typeof get {
  const cache = new WeakMap<Key, Return>();

  return key => {
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }

    const created = get(key);
    cache.set(key, created);
    return created;
  };
}

export function createParserServices(
  astMaps: ASTMaps,
  program: ts.Program | null,
): ParserServices {
  if (!program) {
    // we always return the node maps because
    // (a) they don't require type info and
    // (b) they can be useful when using some of TS's internal non-type-aware AST utils
    return { program, ...astMaps };
  }

  const checker = program.getTypeChecker();

  checker.getSymbolAtLocation = memoize(
    checker.getSymbolAtLocation.bind(checker),
  );
  checker.getTypeAtLocation = memoize(checker.getTypeAtLocation.bind(checker));

  return {
    program,
    ...astMaps,
    getSymbolAtLocation: node =>
      checker.getSymbolAtLocation(astMaps.esTreeNodeToTSNodeMap.get(node)),
    getTypeAtLocation: node =>
      checker.getTypeAtLocation(astMaps.esTreeNodeToTSNodeMap.get(node)),
  };
}
