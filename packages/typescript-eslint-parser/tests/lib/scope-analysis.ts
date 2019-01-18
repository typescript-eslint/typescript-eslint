import fs from 'fs';
import path from 'path';
import * as parser from '../../src/parser';

/** Reference resolver. */
class ReferenceResolver {
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
      }
    };
  }
}

/**
 * Convert a given node object to JSON object.
 * This saves only type and range to know what the node is.
 * @param {ASTNode} node The AST node object.
 * @returns {Object} The object that can be used for JSON.stringify.
 */
function nodeToJSON(node: any) {
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
function variableToJSON(variable: any, resolver: any) {
  const { name, eslintUsed } = variable;
  const defs = variable.defs.map((d: any) => ({
    type: d.type,
    name: nodeToJSON(d.name),
    node: nodeToJSON(d.node),
    parent: nodeToJSON(d.parent)
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
    eslintUsed
  });
}

/**
 * Convert a given reference object to JSON object.
 * @param {Reference} reference The eslint-scope's reference object.
 * @param {ReferenceResolver} resolver The reference resolver.
 * @returns {Object} The object that can be used for JSON.stringify.
 */
function referenceToJSON(reference: any, resolver: any) {
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
    resolved
  });
}

/**
 * Convert a given scope object to JSON object.
 * @param {Scope} scope The eslint-scope's scope object.
 * @param {ReferenceResolver} resolver The reference resolver.
 * @returns {Object} The object that can be used for JSON.stringify.
 */
function scopeToJSON(scope: any, resolver = new ReferenceResolver()) {
  const { type, functionExpressionScope, isStrict } = scope;
  const block = nodeToJSON(scope.block);
  const variables = scope.variables.map((v: any) =>
    variableToJSON(v, resolver)
  );
  const references = scope.references.map((r: any) =>
    referenceToJSON(r, resolver)
  );
  const variableMap = Array.from(scope.set.entries()).reduce(
    (map: any, [name, variable]: any) => {
      map[name] = resolver.ref(variable);
      return map;
    },
    {}
  );
  const throughReferences = scope.through.map(resolver.ref, resolver);
  const variableScope = resolver.ref(scope.variableScope);
  const upperScope = resolver.ref(scope.upper);
  const childScopes = scope.childScopes.map((c: any) =>
    scopeToJSON(c, resolver)
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
    childScopes
  });
}

describe('TypeScript scope analysis', () => {
  const root = 'tests/fixtures/scope-analysis';
  const files = fs
    .readdirSync(root)
    .map(filename => path.join(root, filename).replace(/\\/g, '/'));

  describe('sourceType: module', () => {
    for (const filePath of files) {
      it(filePath, () => {
        const code = fs.readFileSync(filePath, 'utf8');
        const { scopeManager } = parser.parseForESLint(code, {
          loc: true,
          range: true,
          tokens: true,
          sourceType: 'module',
          ecmaFeatures: {}
        });
        const { globalScope } = scopeManager;

        // Do the postprocess to test.
        // https://github.com/eslint/eslint/blob/4fe328787dd02d7a1f6fc21167f6175c860825e3/lib/linter.js#L222
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

        const scopeTree = scopeToJSON(globalScope);
        expect(scopeTree).toMatchSnapshot();
      });
    }
  });

  describe('sourceType: script', () => {
    for (const filePath of files) {
      it(filePath, () => {
        const code = fs.readFileSync(filePath, 'utf8');
        const { scopeManager } = parser.parseForESLint(code, {
          loc: true,
          range: true,
          tokens: true,
          sourceType: 'script',
          ecmaFeatures: {}
        });
        const { globalScope } = scopeManager;

        // Do the postprocess to test.
        // https://github.com/eslint/eslint/blob/4fe328787dd02d7a1f6fc21167f6175c860825e3/lib/linter.js#L222
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

        const scopeTree = scopeToJSON(globalScope);
        expect(scopeTree).toMatchSnapshot();
      });
    }
  });
});
