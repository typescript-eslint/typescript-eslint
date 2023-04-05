import { DefinitionType } from '@typescript-eslint/scope-manager';
import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, TSESLint } from '@typescript-eslint/utils';

import * as util from '../util';

const SENTINEL_TYPE =
  /^(?:(?:Function|Class)(?:Declaration|Expression)|ArrowFunctionExpression|CatchClause|ImportDeclaration|ExportNamedDeclaration)$/;

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
  let allowNamedExports = false;

  if (typeof options === 'string') {
    functions = options !== 'nofunc';
  } else if (typeof options === 'object' && options != null) {
    functions = options.functions !== false;
    classes = options.classes !== false;
    enums = options.enums !== false;
    variables = options.variables !== false;
    typedefs = options.typedefs !== false;
    ignoreTypeReferences = options.ignoreTypeReferences !== false;
    allowNamedExports = options.allowNamedExports !== false;
  }

  return {
    functions,
    classes,
    enums,
    variables,
    typedefs,
    ignoreTypeReferences,
    allowNamedExports,
  };
}

/**
 * Checks whether or not a given variable is a function declaration.
 */
function isFunction(variable: TSESLint.Scope.Variable): boolean {
  return variable.defs[0].type === DefinitionType.FunctionName;
}

/**
 * Checks whether or not a given variable is a type declaration.
 */
function isTypedef(variable: TSESLint.Scope.Variable): boolean {
  return variable.defs[0].type === DefinitionType.Type;
}

/**
 * Checks whether or not a given variable is a enum declaration.
 */
function isOuterEnum(
  variable: TSESLint.Scope.Variable,
  reference: TSESLint.Scope.Reference,
): boolean {
  return (
    variable.defs[0].type === DefinitionType.TSEnumName &&
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
    variable.defs[0].type === DefinitionType.ClassName &&
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
    variable.defs[0].type === DefinitionType.Variable &&
    variable.scope.variableScope !== reference.from.variableScope
  );
}

/**
 * Checks whether or not a given reference is a export reference.
 */
function isNamedExports(reference: TSESLint.Scope.Reference): boolean {
  const { identifier } = reference;
  return (
    identifier.parent?.type === AST_NODE_TYPES.ExportSpecifier &&
    identifier.parent.local === identifier
  );
}

/**
 * Recursively checks whether or not a given reference has a type query declaration among it's parents
 */
function referenceContainsTypeQuery(node: TSESTree.Node): boolean {
  switch (node.type) {
    case AST_NODE_TYPES.TSTypeQuery:
      return true;

    case AST_NODE_TYPES.TSQualifiedName:
    case AST_NODE_TYPES.Identifier:
      return referenceContainsTypeQuery(node.parent);

    default:
      // if we find a different node, there's no chance that we're in a TSTypeQuery
      return false;
  }
}

/**
 * Checks whether or not a given reference is a type reference.
 */
function isTypeReference(reference: TSESLint.Scope.Reference): boolean {
  return (
    reference.isTypeReference ||
    referenceContainsTypeQuery(reference.identifier)
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
 * Decorators are transpiled such that the decorator is placed after the class declaration
 * So it is considered safe
 */
function isClassRefInClassDecorator(
  variable: TSESLint.Scope.Variable,
  reference: TSESLint.Scope.Reference,
): boolean {
  if (variable.defs[0].type !== DefinitionType.ClassName) {
    return false;
  }

  if (
    !variable.defs[0].node.decorators ||
    variable.defs[0].node.decorators.length === 0
  ) {
    return false;
  }

  for (const deco of variable.defs[0].node.decorators) {
    if (
      reference.identifier.range[0] >= deco.range[0] &&
      reference.identifier.range[1] <= deco.range[1]
    ) {
      return true;
    }
  }

  return false;
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

  let node: TSESTree.Node | undefined = variable.identifiers[0].parent;
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
  allowNamedExports?: boolean;
}
type Options = ['nofunc' | Config];
type MessageIds = 'noUseBeforeDefine';

export default util.createRule<Options, MessageIds>({
  name: 'no-use-before-define',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow the use of variables before they are defined',
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
              allowNamedExports: { type: 'boolean' },
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
      allowNamedExports: false,
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
      if (options.ignoreTypeReferences && isTypeReference(reference)) {
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

    function isDefinedBeforeUse(
      variable: TSESLint.Scope.Variable,
      reference: TSESLint.Scope.Reference,
    ): boolean {
      return (
        variable.identifiers[0].range[1] <= reference.identifier.range[1] &&
        !isInInitializer(variable, reference)
      );
    }

    /**
     * Finds and validates all variables in a given scope.
     */
    function findVariablesInScope(scope: TSESLint.Scope.Scope): void {
      scope.references.forEach(reference => {
        const variable = reference.resolved;

        function report(): void {
          context.report({
            node: reference.identifier,
            messageId: 'noUseBeforeDefine',
            data: {
              name: reference.identifier.name,
            },
          });
        }

        // Skips when the reference is:
        // - initializations.
        // - referring to an undefined variable.
        // - referring to a global environment variable (there're no identifiers).
        // - located preceded by the variable (except in initializers).
        // - allowed by options.
        if (reference.init) {
          return;
        }

        if (!options.allowNamedExports && isNamedExports(reference)) {
          if (!variable || !isDefinedBeforeUse(variable, reference)) {
            report();
          }
          return;
        }

        if (!variable) {
          return;
        }

        if (
          variable.identifiers.length === 0 ||
          isDefinedBeforeUse(variable, reference) ||
          !isForbidden(variable, reference) ||
          isClassRefInClassDecorator(variable, reference) ||
          reference.from.type === TSESLint.Scope.ScopeType.functionType
        ) {
          return;
        }

        // Reports.
        report();
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
