/**
 * @fileoverview Rule to flag use of variables before they are defined
 * @copyright ESLint
 * @see https://github.com/eslint/eslint/blob/a113cd3/lib/rules/no-use-before-define.js
 * @author Ilya Volodin
 * @author Jed Fox
 */

import { Rule, Scope } from 'eslint';
import * as util from '../util';

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const SENTINEL_TYPE = /^(?:(?:Function|Class)(?:Declaration|Expression)|ArrowFunctionExpression|CatchClause|ImportDeclaration|ExportNamedDeclaration)$/;
const FOR_IN_OF_TYPE = /^For(?:In|Of)Statement$/;

interface Options {
  functions?: boolean;
  classes?: boolean;
  variables?: boolean;
  typedefs?: boolean;
}

/**
 * Parses a given value as options.
 *
 * @param {any} options - A value to parse.
 */
function parseOptions(options: string | Options | null): Options {
  let functions = true;
  let classes = true;
  let variables = true;
  let typedefs = true;

  if (typeof options === 'string') {
    functions = options !== 'nofunc';
  } else if (typeof options === 'object' && options !== null) {
    functions = options.functions !== false;
    classes = options.classes !== false;
    variables = options.variables !== false;
    typedefs = options.typedefs !== false;
  }

  return { functions, classes, variables, typedefs };
}

/**
 * Checks whether or not a given scope is a top level scope.
 * @param scope - a scope to check
 */
function isTopLevelScope(scope: Scope.Scope): boolean {
  return scope.type === 'module' || scope.type === 'global';
}

/**
 * Checks whether or not a given variable is a function declaration.
 * @param variable - A variable to check.
 */
function isFunction(variable: Scope.Variable): boolean {
  return variable.defs[0].type === 'FunctionName';
}

/**
 * Checks whether or not a given variable is a class declaration in an upper function scope.
 * @param variable - A variable to check.
 * @param reference - A reference to check.
 */
function isOuterClass(
  variable: Scope.Variable,
  reference: Scope.Reference
): boolean {
  if (variable.defs[0].type !== 'ClassName') {
    return false;
  }

  if (variable.scope.variableScope === reference.from.variableScope) {
    // allow the same scope only if it's the top level global/module scope
    if (!isTopLevelScope(variable.scope.variableScope)) {
      return false;
    }
  }

  return true;
}

/**
 * Checks whether or not a given variable is a variable declaration in an upper function scope.
 * @param variable - A variable to check.
 * @param reference - A reference to check.
 */
function isOuterVariable(
  variable: Scope.Variable,
  reference: Scope.Reference
): boolean {
  if (variable.defs[0].type !== 'Variable') {
    return false;
  }

  if (variable.scope.variableScope === reference.from.variableScope) {
    // allow the same scope only if it's the top level global/module scope
    if (!isTopLevelScope(variable.scope.variableScope)) {
      return false;
    }
  }

  return true;
}

/**
 * Checks whether or not a given variable is a type declaration.
 * @param variable - A type to check.
 */
function isType(variable: Scope.Variable): boolean {
  const def = variable.defs[0];
  return !!(
    def.type === 'Variable' &&
    def.parent &&
    def.parent.kind === 'type'
  );
}

/**
 * Checks whether or not a given location is inside of the range of a given node.
 *
 * @param {ASTNode} node - An node to check.
 * @param location - A location to check.
 */
function isInRange(node, location: number): boolean {
  return node && node.range[0] <= location && location <= node.range[1];
}

/**
 * Checks whether or not a given reference is inside of the initializers of a given variable.
 *
 * This returns `true` in the following cases:
 *
 *     var a = a
 *     var [a = a] = list
 *     var {a = a} = obj
 *     for (var a in a) {}
 *     for (var a of a) {}
 *
 * @param variable - A variable to check.
 * @param reference - A reference to check.
 */
function isInInitializer(
  variable: Scope.Variable,
  reference: Scope.Reference
): boolean {
  if (variable.scope !== reference.from) {
    return false;
  }

  let node = variable.identifiers[0].parent;
  const location = reference.identifier.range[1];

  while (node) {
    if (node.type === 'VariableDeclarator') {
      if (isInRange(node.init, location)) {
        return true;
      }
      if (
        FOR_IN_OF_TYPE.test(node.parent.parent.type) &&
        isInRange(node.parent.parent.right, location)
      ) {
        return true;
      }
      break;
    } else if (node.type === 'AssignmentPattern') {
      if (isInRange(node.right, location)) {
        return true;
      }
    } else if (SENTINEL_TYPE.test(node.type)) {
      break;
    }

    node = node.parent;
  }

  return false;
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const defaultOptions = [
  {
    functions: true,
    classes: true,
    variables: true,
    typedefs: true
  }
];

const rule: RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow the use of variables before they are defined',
      category: 'Variables',
      url: util.metaDocsUrl('no-use-before-define'),
      recommended: 'error'
    },
    schema: [
      {
        oneOf: [
          {
            enum: ['nofunc']
          },
          {
            type: 'object',
            properties: {
              functions: { type: 'boolean' },
              classes: { type: 'boolean' },
              variables: { type: 'boolean' },
              typedefs: { type: 'boolean' }
            },
            additionalProperties: false
          }
        ]
      }
    ]
  },

  create(context) {
    const options = parseOptions(
      util.applyDefault(defaultOptions, context.options)[0]
    );

    /**
     * Determines whether a given use-before-define case should be reported according to the options.
     * @param variable The variable that gets used before being defined
     * @param reference The reference to the variable
     */
    function isForbidden(
      variable: Scope.Variable,
      reference: Scope.Reference
    ): boolean {
      if (isFunction(variable)) {
        return !!options.functions;
      }
      if (isOuterClass(variable, reference)) {
        return !!options.classes;
      }
      if (isType(variable) && !options.typedefs) {
        return false;
      }
      if (isOuterVariable(variable, reference)) {
        return !!options.variables;
      }
      return true;
    }

    /**
     * Finds and validates all variables in a given scope.
     * @param {Scope} scope The scope object.
     */
    function findVariablesInScope(scope: Scope.Scope): void {
      scope.references.forEach(reference => {
        const variable = reference.resolved;

        // Skips when the reference is:
        // - initialization's.
        // - referring to an undefined variable.
        // - referring to a global environment variable (there're no identifiers).
        // - located preceded by the variable (except in initializers).
        // - allowed by options.
        if (
          reference.init ||
          !variable ||
          variable.identifiers.length === 0 ||
          (variable.identifiers[0].range![1] < reference.identifier.range![1] &&
            !isInInitializer(variable, reference)) ||
          !isForbidden(variable, reference)
        ) {
          return;
        }

        // Reports.
        context.report({
          node: reference.identifier,
          message: "'{{name}}' was used before it was defined.",
          data: reference.identifier
        });
      });

      scope.childScopes.forEach(findVariablesInScope);
    }

    return {
      Program() {
        findVariablesInScope(context.getScope());
      }
    };
  }
};
export default rule;
