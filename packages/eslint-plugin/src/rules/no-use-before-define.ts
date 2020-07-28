import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

const SENTINEL_TYPE = /^(?:(?:Function|Class)(?:Declaration|Expression)|ArrowFunctionExpression|CatchClause|ImportDeclaration|ExportNamedDeclaration)$/;

/**
 * Parses a given value as options.
 */
function parseOptions(options: string | Config | null): Required<Config> {
  let functions = true;
  let classes = true;
  let enums = true;
  let variables = true;
  let typedefs = true;
  let ignoreTypeReferences = true;

  if (typeof options === 'string') {
    functions = options !== 'nofunc';
  } else if (typeof options === 'object' && options !== null) {
    functions = options.functions !== false;
    classes = options.classes !== false;
    enums = options.enums !== false;
    variables = options.variables !== false;
    typedefs = options.typedefs !== false;
    ignoreTypeReferences = options.ignoreTypeReferences !== false;
  }

  return {
    functions,
    classes,
    enums,
    variables,
    typedefs,
    ignoreTypeReferences,
  };
}

/**
 * Checks whether or not a given variable is a function declaration.
 */
function isFunction(variable: TSESLint.Scope.Variable): boolean {
  return variable.defs[0].type === 'FunctionName';
}

/**
 * Checks whether or not a given variable is a type declaration.
 */
function isTypedef(variable: TSESLint.Scope.Variable): boolean {
  return variable.defs[0].type === 'Type';
}

/**
 * Checks whether or not a given variable is a enum declaration.
 */
function isOuterEnum(
  variable: TSESLint.Scope.Variable,
  reference: TSESLint.Scope.Reference,
): boolean {
  return (
    variable.defs[0].type == 'TSEnumName' &&
    variable.scope.variableScope !== reference.from.variableScope
  );
}

/**
 * Checks whether or not a given variable is a class declaration in an upper function scope.
 */
function isOuterClass(
  variable: TSESLint.Scope.Variable,
  reference: TSESLint.Scope.Reference,
): boolean {
  return (
    variable.defs[0].type === 'ClassName' &&
    variable.scope.variableScope !== reference.from.variableScope
  );
}

/**
 * Checks whether or not a given variable is a variable declaration in an upper function scope.
 */
function isOuterVariable(
  variable: TSESLint.Scope.Variable,
  reference: TSESLint.Scope.Reference,
): boolean {
  return (
    variable.defs[0].type === 'Variable' &&
    variable.scope.variableScope !== reference.from.variableScope
  );
}

/**
 * Checks whether or not a given location is inside of the range of a given node.
 */
function isInRange(
  node: TSESTree.Expression | null | undefined,
  location: number,
): boolean {
  return !!node && node.range[0] <= location && location <= node.range[1];
}

/**
 * Checks whether or not a given reference is inside of the initializers of a given variable.
 *
 * @returns `true` in the following cases:
 * - var a = a
 * - var [a = a] = list
 * - var {a = a} = obj
 * - for (var a in a) {}
 * - for (var a of a) {}
 */
function isInInitializer(
  variable: TSESLint.Scope.Variable,
  reference: TSESLint.Scope.Reference,
): boolean {
  if (variable.scope !== reference.from) {
    return false;
  }

  let node = variable.identifiers[0].parent;
  const location = reference.identifier.range[1];

  while (node) {
    if (node.type === AST_NODE_TYPES.VariableDeclarator) {
      if (isInRange(node.init, location)) {
        return true;
      }
      if (
        node.parent?.parent &&
        (node.parent.parent.type === AST_NODE_TYPES.ForInStatement ||
          node.parent.parent.type === AST_NODE_TYPES.ForOfStatement) &&
        isInRange(node.parent.parent.right, location)
      ) {
        return true;
      }
      break;
    } else if (node.type === AST_NODE_TYPES.AssignmentPattern) {
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

interface Config {
  functions?: boolean;
  classes?: boolean;
  enums?: boolean;
  variables?: boolean;
  typedefs?: boolean;
  ignoreTypeReferences?: boolean;
}
type Options = ['nofunc' | Config];
type MessageIds = 'noUseBeforeDefine';

export default util.createRule<Options, MessageIds>({
  name: 'no-use-before-define',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow the use of variables before they are defined',
      category: 'Variables',
      recommended: false,
      extendsBaseRule: true,
    },
    messages: {
      noUseBeforeDefine: "'{{name}}' was used before it was defined.",
    },
    schema: [
      {
        oneOf: [
          {
            enum: ['nofunc'],
          },
          {
            type: 'object',
            properties: {
              functions: { type: 'boolean' },
              classes: { type: 'boolean' },
              enums: { type: 'boolean' },
              variables: { type: 'boolean' },
              typedefs: { type: 'boolean' },
              ignoreTypeReferences: { type: 'boolean' },
            },
            additionalProperties: false,
          },
        ],
      },
    ],
  },
  defaultOptions: [
    {
      functions: true,
      classes: true,
      enums: true,
      variables: true,
      typedefs: true,
      ignoreTypeReferences: true,
    },
  ],
  create(context, optionsWithDefault) {
    const options = parseOptions(optionsWithDefault[0]);

    /**
     * Determines whether a given use-before-define case should be reported according to the options.
     * @param variable The variable that gets used before being defined
     * @param reference The reference to the variable
     */
    function isForbidden(
      variable: TSESLint.Scope.Variable,
      reference: TSESLint.Scope.Reference,
    ): boolean {
      if (reference.isTypeReference && options.ignoreTypeReferences) {
        return false;
      }
      if (isFunction(variable)) {
        return options.functions;
      }
      if (isOuterClass(variable, reference)) {
        return options.classes;
      }
      if (isOuterVariable(variable, reference)) {
        return options.variables;
      }
      if (isOuterEnum(variable, reference)) {
        return options.enums;
      }
      if (isTypedef(variable)) {
        return options.typedefs;
      }

      return true;
    }

    /**
     * Finds and validates all variables in a given scope.
     */
    function findVariablesInScope(scope: TSESLint.Scope.Scope): void {
      scope.references.forEach(reference => {
        const variable = reference.resolved;

        // Skips when the reference is:
        // - initializations.
        // - referring to an undefined variable.
        // - referring to a global environment variable (there're no identifiers).
        // - located preceded by the variable (except in initializers).
        // - allowed by options.
        if (
          reference.init ||
          !variable ||
          variable.identifiers.length === 0 ||
          (variable.identifiers[0].range[1] < reference.identifier.range[1] &&
            !isInInitializer(variable, reference)) ||
          !isForbidden(variable, reference)
        ) {
          return;
        }

        // Reports.
        context.report({
          node: reference.identifier,
          messageId: 'noUseBeforeDefine',
          data: {
            name: reference.identifier.name,
          },
        });
      });

      scope.childScopes.forEach(findVariablesInScope);
    }

    return {
      Program(): void {
        findVariablesInScope(context.getScope());
      },
    };
  },
});
