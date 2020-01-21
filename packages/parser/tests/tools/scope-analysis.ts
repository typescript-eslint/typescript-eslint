import {
  TSESTree,
  TSESLintScope,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import { ScopeManager } from '../../src/scope/scope-manager';

/** Reference resolver. */
export class ReferenceResolver<TKey = unknown> {
  map: Map<TKey, { $id: number }>;

  constructor() {
    this.map = new Map();
  }

  resolve<T>(obj: TKey, properties: T): T & { $id: number } {
    const resolved = { ...properties, $id: this.map.size };
    this.map.set(obj, resolved);
    return resolved;
  }

  ref(obj: TKey): { $ref: number } | TKey {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const map = this.map;
    return {
      get $ref(): number {
        return map.get(obj)!.$id;
      },
    };
  }
}

/**
 * Convert a given node object to JSON object.
 * This saves only type and range to know what the node is.
 * @param node The AST node object.
 * @returns The object that can be used for JSON.stringify.
 */
export function nodeToJSON(
  node: TSESTree.Node | null | undefined,
):
  | { type: AST_NODE_TYPES; range: [number, number]; name?: string }
  | null
  | undefined {
  if (!node) {
    return node;
  }

  const { type, range } = node;
  if (node.type === AST_NODE_TYPES.Identifier) {
    return { type, name: node.name, range };
  }
  return { type, range };
}

/**
 * Convert a given variable object to JSON object.
 * @param variable The eslint-scope's variable object.
 * @param resolver The reference resolver.
 * @returns The object that can be used for JSON.stringify.
 */
export function variableToJSON(
  variable: TSESLintScope.Variable,
  resolver: ReferenceResolver,
): unknown {
  const { name, eslintUsed } = variable;
  const defs = variable.defs.map(d => ({
    type: d.type,
    name: nodeToJSON(d.name),
    node: nodeToJSON(d.node),
    parent: nodeToJSON(d.parent),
  }));
  const identifiers = variable.identifiers.map(nodeToJSON);
  const references = variable.references.map(resolver.ref, resolver);
  const scope = resolver.ref(variable.scope);

  return resolver.resolve(variable, {
    name,
    defs,
    identifiers,
    references,
    scope,
    eslintUsed,
  });
}

/**
 * Convert a given reference object to JSON object.
 * @param reference The eslint-scope's reference object.
 * @param resolver The reference resolver.
 * @returns The object that can be used for JSON.stringify.
 */
export function referenceToJSON(
  reference: TSESLintScope.Reference,
  resolver: ReferenceResolver,
): unknown {
  const kind = `${reference.isRead() ? 'r' : ''}${
    reference.isWrite() ? 'w' : ''
  }`;
  const from = resolver.ref(reference.from);
  const identifier = nodeToJSON(reference.identifier);
  const writeExpr = nodeToJSON(reference.writeExpr);
  const resolved = resolver.ref(reference.resolved);

  return resolver.resolve(reference, {
    kind,
    from,
    identifier,
    writeExpr,
    resolved,
  });
}

/**
 * Convert a given scope object to JSON object.
 * @param scope The eslint-scope's scope object.
 * @param resolver The reference resolver.
 * @returns {Object} The object that can be used for JSON.stringify.
 */
export function scopeToJSON(
  scope: TSESLintScope.Scope,
  resolver = new ReferenceResolver(),
): unknown {
  const { type, functionExpressionScope, isStrict } = scope;
  const block = nodeToJSON(scope.block);
  const variables = scope.variables.map(v => variableToJSON(v, resolver));
  const references = scope.references.map(r => referenceToJSON(r, resolver));
  const variableMap = Array.from(scope.set.entries()).reduce<
    Record<string, unknown>
  >((map, [name, variable]) => {
    map[name] = resolver.ref(variable);
    return map;
  }, {});
  const throughReferences = scope.through.map(resolver.ref, resolver);
  const variableScope = resolver.ref(scope.variableScope);
  const upperScope = resolver.ref(scope.upper);
  const childScopes = scope.childScopes.map(c => scopeToJSON(c, resolver));

  return resolver.resolve(scope, {
    type,
    functionExpressionScope,
    isStrict,
    block,
    variables,
    references,
    variableMap,
    throughReferences,
    variableScope,
    upperScope,
    childScopes,
  });
}

export function getScopeTree(scopeManager: ScopeManager): unknown {
  const { globalScope } = scopeManager;

  // Do the postprocess to test.
  // https://github.com/eslint/eslint/blob/84ce72fdeba082b7b132e4ac6b714fb1a93831b7/lib/linter.js#L112-L129
  globalScope.through = globalScope.through.filter(reference => {
    const name = reference.identifier.name;
    const variable = globalScope.set.get(name);
    if (variable) {
      reference.resolved = variable;
      variable.references.push(reference);
      return false;
    }
    return true;
  });

  return scopeToJSON(globalScope);
}
