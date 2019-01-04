import isPlainObject from 'lodash.isplainobject';

/**
 * By default, pretty-format (within Jest matchers) retains the names/types of nodes from the babylon AST,
 * quick and dirty way to avoid that is to JSON.stringify and then JSON.parser the
 * ASTs before comparing them with pretty-format
 *
 * @param {Object} ast raw AST
 * @returns {Object} normalized AST
 */
export function normalizeNodeTypes(ast: any): any {
  return JSON.parse(JSON.stringify(ast));
}

/**
 * Removes the given keys from the given AST object recursively
 * @param root A JavaScript object to remove keys from
 * @param keysToOmit Names and predicate functions use to determine what keys to omit from the final object
 * @param nodes advance ast modifications
 * @returns {Object} formatted object
 */
export function omitDeep(
  root: any,
  keysToOmit: { key: string; predicate: Function }[],
  nodes: Record<string, (node: any, parent: any) => void> = {}
) {
  function shouldOmit(keyName: string, val: any): boolean {
    if (keysToOmit && keysToOmit.length) {
      return keysToOmit.some(
        keyConfig => keyConfig.key === keyName && keyConfig.predicate(val)
      );
    }
    return false;
  }

  function visit(node: any, parent: any) {
    if (!node) {
      return;
    }

    for (const prop in node) {
      if (node.hasOwnProperty(prop)) {
        if (shouldOmit(prop, node[prop])) {
          delete node[prop];
          continue;
        }

        const child = node[prop];

        if (Array.isArray(child)) {
          for (const el of child) {
            visit(el, node);
          }
        } else if (isPlainObject(child)) {
          visit(child, node);
        }
      }
    }

    if (typeof node.type === 'string' && node.type in nodes) {
      nodes[node.type](node, parent);
    }
  }

  visit(root, null);
  return root;
}

/**
 * Common predicates for Babylon AST preprocessing
 */
const always = () => true;
const ifNumber = (val: any) => typeof val === 'number';

/**
 * - Babylon wraps the "Program" node in an extra "File" node, normalize this for simplicity for now...
 * - Remove "start" and "end" values from Babylon nodes to reduce unimportant noise in diffs ("loc" data will still be in
 * each final AST and compared).
 *
 * @param {Object} ast raw babylon AST
 * @returns {Object} processed babylon AST
 */
export function preprocessBabylonAST(ast: any): any {
  return omitDeep(
    ast.program,
    [
      {
        key: 'start',
        // only remove the "start" number (not the "start" object within loc)
        predicate: ifNumber
      },
      {
        key: 'end',
        // only remove the "end" number (not the "end" object within loc)
        predicate: ifNumber
      },
      {
        key: 'identifierName',
        predicate: always
      },
      {
        key: 'extra',
        predicate: always
      },
      {
        key: 'innerComments',
        predicate: always
      },
      {
        key: 'leadingComments',
        predicate: always
      },
      {
        key: 'trailingComments',
        predicate: always
      },
      {
        key: 'guardedHandlers',
        predicate: always
      },
      {
        key: 'interpreter',
        predicate: always
      }
    ],
    {
      /**
       * Not yet supported in Babel https://github.com/babel/babel/issues/9228
       */
      StringLiteral(node: any) {
        node.type = 'Literal';
      },
      /**
       * Not yet supported in Babel https://github.com/babel/babel/issues/9228
       */
      NumericLiteral(node: any) {
        node.type = 'Literal';
      },
      /**
       * Not yet supported in Babel https://github.com/babel/babel/issues/9228
       */
      BooleanLiteral(node: any) {
        node.type = 'Literal';
        node.raw = String(node.value);
      },
      /**
       * Awaiting feedback on Babel issue https://github.com/babel/babel/issues/9231
       */
      TSCallSignatureDeclaration(node: any) {
        if (node.typeAnnotation) {
          node.returnType = node.typeAnnotation;
          delete node.typeAnnotation;
        }
        if (node.parameters) {
          node.params = node.parameters;
          delete node.parameters;
        }
      },
      /**
       * Awaiting feedback on Babel issue https://github.com/babel/babel/issues/9231
       */
      TSConstructSignatureDeclaration(node: any) {
        if (node.typeAnnotation) {
          node.returnType = node.typeAnnotation;
          delete node.typeAnnotation;
        }
        if (node.parameters) {
          node.params = node.parameters;
          delete node.parameters;
        }
      }
    }
  );
}

/**
 * There is currently a really awkward difference in location data for Program nodes
 * between different parsers in the ecosystem. Hack around this by removing the data
 * before comparing the ASTs.
 *
 * See: https://github.com/babel/babel/issues/6681
 *
 * @param {Object} ast the raw AST with a Program node at its top level
 * @param {boolean} ignoreSourceType fix for issues with unambiguous type detection
 * @returns {Object} the ast with the location data removed from the Program node
 */
export function removeLocationDataAndSourceTypeFromProgramNode(
  ast: any,
  ignoreSourceType: boolean
) {
  delete ast.loc;
  delete ast.range;
  if (ignoreSourceType) {
    delete ast.sourceType;
  }
  return ast;
}
