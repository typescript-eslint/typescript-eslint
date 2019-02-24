/** Reference resolver. */
export class ReferenceResolver {
  map: Map<any, any>;

  constructor() {
    this.map = new Map();
  }

  resolve(obj: any, properties: any) {
    const resolved = Object.assign({ $id: this.map.size }, properties);
    this.map.set(obj, resolved);
    return resolved;
  }

  ref(obj: any) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const { map } = this;
    return {
      get $ref() {
        return map.get(obj).$id;
      },
    };
  }
}

/**
 * Convert a given node object to JSON object.
 * This saves only type and range to know what the node is.
 * @param {ASTNode} node The AST node object.
 * @returns {Object} The object that can be used for JSON.stringify.
 */
export function nodeToJSON(node: any) {
  if (!node) {
    return node;
  }

  const { type, name, range } = node;
  if (node.type === 'Identifier') {
    return { type, name, range };
  }
  return { type, range };
}

/**
 * Convert a given variable object to JSON object.
 * @param {Variable} variable The eslint-scope's variable object.
 * @param {ReferenceResolver} resolver The reference resolver.
 * @returns {Object} The object that can be used for JSON.stringify.
 */
export function variableToJSON(variable: any, resolver: any) {
  const { name, eslintUsed } = variable;
  const defs = variable.defs.map((d: any) => ({
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
 * @param {Reference} reference The eslint-scope's reference object.
 * @param {ReferenceResolver} resolver The reference resolver.
 * @returns {Object} The object that can be used for JSON.stringify.
 */
export function referenceToJSON(reference: any, resolver: any) {
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
 * @param {Scope} scope The eslint-scope's scope object.
 * @param {ReferenceResolver} resolver The reference resolver.
 * @returns {Object} The object that can be used for JSON.stringify.
 */
export function scopeToJSON(scope: any, resolver = new ReferenceResolver()) {
  const { type, functionExpressionScope, isStrict } = scope;
  const block = nodeToJSON(scope.block);
  const variables = scope.variables.map((v: any) =>
    variableToJSON(v, resolver),
  );
  const references = scope.references.map((r: any) =>
    referenceToJSON(r, resolver),
  );
  const variableMap = Array.from(scope.set.entries()).reduce(
    (map: any, [name, variable]: any) => {
      map[name] = resolver.ref(variable);
      return map;
    },
    {},
  );
  const throughReferences = scope.through.map(resolver.ref, resolver);
  const variableScope = resolver.ref(scope.variableScope);
  const upperScope = resolver.ref(scope.upper);
  const childScopes = scope.childScopes.map((c: any) =>
    scopeToJSON(c, resolver),
  );

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

export function getScopeTree(scopeManager: any) {
  const { globalScope } = scopeManager;

  // Do the postprocess to test.
  // https://github.com/eslint/eslint/blob/84ce72fdeba082b7b132e4ac6b714fb1a93831b7/lib/linter.js#L112-L129
  globalScope.through = globalScope.through.filter((reference: any) => {
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
