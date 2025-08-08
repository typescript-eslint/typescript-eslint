// This rule was feature-frozen before we enabled no-property-in-node.
/* eslint-disable eslint-plugin/no-property-in-node */

import type { TSESTree } from '@typescript-eslint/utils';
import type { ScriptTarget } from 'typescript';

import { PatternVisitor } from '@typescript-eslint/scope-manager';
import { AST_NODE_TYPES, TSESLint } from '@typescript-eslint/utils';

import type {
  Context,
  Selector,
  ValidatorFunction,
} from './naming-convention-utils';

import {
  requiresQuoting as _requiresQuoting,
  collectVariables,
  createRule,
  getParserServices,
} from '../util';
import { Modifiers, parseOptions, SCHEMA } from './naming-convention-utils';

export type MessageIds =
  | 'doesNotMatchFormat'
  | 'doesNotMatchFormatTrimmed'
  | 'missingAffix'
  | 'missingUnderscore'
  | 'satisfyCustom'
  | 'unexpectedUnderscore';

// Note that this intentionally does not strictly type the modifiers/types properties.
// This is because doing so creates a huge headache, as the rule's code doesn't need to care.
// The JSON Schema strictly types these properties, so we know the user won't input invalid config.
export type Options = Selector[];

// This essentially mirrors ESLint's `camelcase` rule
// note that that rule ignores leading and trailing underscores and only checks those in the middle of a variable name
const defaultCamelCaseAllTheThingsConfig: Options = [
  {
    format: ['camelCase'],
    leadingUnderscore: 'allow',
    selector: 'default',
    trailingUnderscore: 'allow',
  },

  {
    format: ['camelCase', 'PascalCase'],
    selector: 'import',
  },

  {
    format: ['camelCase', 'UPPER_CASE'],
    leadingUnderscore: 'allow',
    selector: 'variable',
    trailingUnderscore: 'allow',
  },

  {
    format: ['PascalCase'],
    selector: 'typeLike',
  },
];

export default createRule<Options, MessageIds>({
  name: 'naming-convention',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce naming conventions for everything across a codebase',
      // technically only requires type checking if the user uses "type" modifiers
      requiresTypeChecking: true,
      frozen: true,
    },
    messages: {
      doesNotMatchFormat:
        '{{type}} name `{{name}}` must match one of the following formats: {{formats}}',
      doesNotMatchFormatTrimmed:
        '{{type}} name `{{name}}` trimmed as `{{processedName}}` must match one of the following formats: {{formats}}',
      missingAffix:
        '{{type}} name `{{name}}` must have one of the following {{position}}es: {{affixes}}',
      missingUnderscore:
        '{{type}} name `{{name}}` must have {{count}} {{position}} underscore(s).',
      satisfyCustom:
        '{{type}} name `{{name}}` must {{regexMatch}} the RegExp: {{regex}}',
      unexpectedUnderscore:
        '{{type}} name `{{name}}` must not have a {{position}} underscore.',
    },
    schema: SCHEMA,
  },
  defaultOptions: defaultCamelCaseAllTheThingsConfig,
  create(contextWithoutDefaults) {
    const context =
      contextWithoutDefaults.options.length > 0
        ? contextWithoutDefaults
        : // only apply the defaults when the user provides no config
          (Object.setPrototypeOf(
            {
              options: defaultCamelCaseAllTheThingsConfig,
            },
            contextWithoutDefaults,
          ) as Context);

    const validators = parseOptions(context);

    const compilerOptions =
      getParserServices(context, true).program?.getCompilerOptions() ?? {};
    function handleMember(
      validator: ValidatorFunction,
      node:
        | TSESTree.AccessorPropertyNonComputedName
        | TSESTree.MethodDefinitionNonComputedName
        | TSESTree.PropertyDefinitionNonComputedName
        | TSESTree.PropertyNonComputedName
        | TSESTree.TSAbstractMethodDefinitionNonComputedName
        | TSESTree.TSAbstractPropertyDefinitionNonComputedName
        | TSESTree.TSMethodSignatureNonComputedName
        | TSESTree.TSPropertySignatureNonComputedName,
      modifiers: Set<Modifiers>,
    ): void {
      const key = node.key;
      if (requiresQuoting(key, compilerOptions.target)) {
        modifiers.add(Modifiers.requiresQuotes);
      }

      validator(key, modifiers);
    }

    function getMemberModifiers(
      node:
        | TSESTree.AccessorProperty
        | TSESTree.MethodDefinition
        | TSESTree.PropertyDefinition
        | TSESTree.TSAbstractAccessorProperty
        | TSESTree.TSAbstractMethodDefinition
        | TSESTree.TSAbstractPropertyDefinition
        | TSESTree.TSParameterProperty,
    ): Set<Modifiers> {
      const modifiers = new Set<Modifiers>();
      if ('key' in node && node.key.type === AST_NODE_TYPES.PrivateIdentifier) {
        modifiers.add(Modifiers['#private']);
      } else if (node.accessibility) {
        modifiers.add(Modifiers[node.accessibility]);
      } else {
        modifiers.add(Modifiers.public);
      }
      if (node.static) {
        modifiers.add(Modifiers.static);
      }
      if ('readonly' in node && node.readonly) {
        modifiers.add(Modifiers.readonly);
      }
      if ('override' in node && node.override) {
        modifiers.add(Modifiers.override);
      }
      if (
        node.type === AST_NODE_TYPES.TSAbstractPropertyDefinition ||
        node.type === AST_NODE_TYPES.TSAbstractMethodDefinition ||
        node.type === AST_NODE_TYPES.TSAbstractAccessorProperty
      ) {
        modifiers.add(Modifiers.abstract);
      }

      return modifiers;
    }

    const { unusedVariables } = collectVariables(context);
    function isUnused(
      name: string,
      initialScope: TSESLint.Scope.Scope | null,
    ): boolean {
      let variable: TSESLint.Scope.Variable | null = null;
      let scope: TSESLint.Scope.Scope | null = initialScope;
      while (scope) {
        variable = scope.set.get(name) ?? null;
        if (variable) {
          break;
        }
        scope = scope.upper;
      }
      if (!variable) {
        return false;
      }

      return unusedVariables.has(variable);
    }

    function isDestructured(id: TSESTree.Identifier): boolean {
      return (
        // `const { x }`
        // does not match `const { x: y }`
        (id.parent.type === AST_NODE_TYPES.Property && id.parent.shorthand) ||
        // `const { x = 2 }`
        // does not match const `{ x: y = 2 }`
        (id.parent.type === AST_NODE_TYPES.AssignmentPattern &&
          id.parent.parent.type === AST_NODE_TYPES.Property &&
          id.parent.parent.shorthand)
      );
    }

    function isAsyncMemberOrProperty(
      propertyOrMemberNode:
        | TSESTree.MethodDefinitionNonComputedName
        | TSESTree.PropertyDefinitionNonComputedName
        | TSESTree.PropertyNonComputedName
        | TSESTree.TSAbstractMethodDefinitionNonComputedName
        | TSESTree.TSAbstractPropertyDefinitionNonComputedName
        | TSESTree.TSMethodSignatureNonComputedName,
    ): boolean {
      return Boolean(
        'value' in propertyOrMemberNode &&
          propertyOrMemberNode.value &&
          'async' in propertyOrMemberNode.value &&
          propertyOrMemberNode.value.async,
      );
    }

    function isAsyncVariableIdentifier(id: TSESTree.Identifier): boolean {
      return Boolean(
        ('async' in id.parent && id.parent.async) ||
          ('init' in id.parent &&
            id.parent.init &&
            'async' in id.parent.init &&
            id.parent.init.async),
      );
    }

    const selectors: {
      readonly [k in keyof TSESLint.RuleListener]: Readonly<{
        handler: (
          node: Parameters<NonNullable<TSESLint.RuleListener[k]>>[0],
          validator: ValidatorFunction,
        ) => void;
        validator: ValidatorFunction;
      }>;
    } = {
      // #region import

      'FunctionDeclaration, TSDeclareFunction, FunctionExpression': {
        handler: (
          node:
            | TSESTree.FunctionDeclaration
            | TSESTree.FunctionExpression
            | TSESTree.TSDeclareFunction,
          validator,
        ): void => {
          if (node.id == null) {
            return;
          }

          const modifiers = new Set<Modifiers>();
          // functions create their own nested scope
          const scope = context.sourceCode.getScope(node).upper;

          if (isGlobal(scope)) {
            modifiers.add(Modifiers.global);
          }

          if (isExported(node, node.id.name, scope)) {
            modifiers.add(Modifiers.exported);
          }

          if (isUnused(node.id.name, scope)) {
            modifiers.add(Modifiers.unused);
          }

          if (node.async) {
            modifiers.add(Modifiers.async);
          }

          validator(node.id, modifiers);
        },
        validator: validators.function,
      },

      // #endregion

      // #region variable

      'ImportDefaultSpecifier, ImportNamespaceSpecifier, ImportSpecifier': {
        handler: (
          node:
            | TSESTree.ImportDefaultSpecifier
            | TSESTree.ImportNamespaceSpecifier
            | TSESTree.ImportSpecifier,
          validator,
        ): void => {
          const modifiers = new Set<Modifiers>();

          switch (node.type) {
            case AST_NODE_TYPES.ImportDefaultSpecifier:
              modifiers.add(Modifiers.default);
              break;
            case AST_NODE_TYPES.ImportNamespaceSpecifier:
              modifiers.add(Modifiers.namespace);
              break;
            case AST_NODE_TYPES.ImportSpecifier:
              // Handle `import { default as Foo }`
              if (
                node.imported.type === AST_NODE_TYPES.Identifier &&
                node.imported.name !== 'default'
              ) {
                return;
              }
              modifiers.add(Modifiers.default);
              break;
          }

          validator(node.local, modifiers);
        },
        validator: validators.import,
      },

      // #endregion

      // #region function

      VariableDeclarator: {
        handler: (node, validator): void => {
          const identifiers = getIdentifiersFromPattern(node.id);

          const baseModifiers = new Set<Modifiers>();
          const parent = node.parent;
          if (parent.kind === 'const') {
            baseModifiers.add(Modifiers.const);
          }

          if (isGlobal(context.sourceCode.getScope(node))) {
            baseModifiers.add(Modifiers.global);
          }

          identifiers.forEach(id => {
            const modifiers = new Set(baseModifiers);

            if (isDestructured(id)) {
              modifiers.add(Modifiers.destructured);
            }

            const scope = context.sourceCode.getScope(id);
            if (isExported(parent, id.name, scope)) {
              modifiers.add(Modifiers.exported);
            }

            if (isUnused(id.name, scope)) {
              modifiers.add(Modifiers.unused);
            }

            if (isAsyncVariableIdentifier(id)) {
              modifiers.add(Modifiers.async);
            }

            validator(id, modifiers);
          });
        },
        validator: validators.variable,
      },

      // #endregion function

      // #region parameter
      ':matches(PropertyDefinition, TSAbstractPropertyDefinition)[computed = false][value.type != "ArrowFunctionExpression"][value.type != "FunctionExpression"][value.type != "TSEmptyBodyFunctionExpression"]':
        {
          handler: (
            node:
              | TSESTree.PropertyDefinitionNonComputedName
              | TSESTree.TSAbstractPropertyDefinitionNonComputedName,
            validator,
          ): void => {
            const modifiers = getMemberModifiers(node);
            handleMember(validator, node, modifiers);
          },
          validator: validators.classProperty,
        },

      // #endregion parameter

      // #region parameterProperty

      ':not(ObjectPattern) > Property[computed = false][kind = "init"][value.type != "ArrowFunctionExpression"][value.type != "FunctionExpression"][value.type != "TSEmptyBodyFunctionExpression"]':
        {
          handler: (
            node: TSESTree.PropertyNonComputedName,
            validator,
          ): void => {
            const modifiers = new Set<Modifiers>([Modifiers.public]);
            handleMember(validator, node, modifiers);
          },
          validator: validators.objectLiteralProperty,
        },

      // #endregion parameterProperty

      // #region property

      [[
        ':matches(PropertyDefinition, TSAbstractPropertyDefinition)[computed = false][value.type = "ArrowFunctionExpression"]',
        ':matches(PropertyDefinition, TSAbstractPropertyDefinition)[computed = false][value.type = "FunctionExpression"]',
        ':matches(PropertyDefinition, TSAbstractPropertyDefinition)[computed = false][value.type = "TSEmptyBodyFunctionExpression"]',
        ':matches(MethodDefinition, TSAbstractMethodDefinition)[computed = false][kind = "method"]',
      ].join(', ')]: {
        handler: (
          node:
            | TSESTree.MethodDefinitionNonComputedName
            | TSESTree.PropertyDefinitionNonComputedName
            | TSESTree.TSAbstractMethodDefinitionNonComputedName
            | TSESTree.TSAbstractPropertyDefinitionNonComputedName,
          validator,
        ): void => {
          const modifiers = getMemberModifiers(node);

          if (isAsyncMemberOrProperty(node)) {
            modifiers.add(Modifiers.async);
          }

          handleMember(validator, node, modifiers);
        },
        validator: validators.classMethod,
      },

      [[
        'MethodDefinition[computed = false]:matches([kind = "get"], [kind = "set"])',
        'TSAbstractMethodDefinition[computed = false]:matches([kind="get"], [kind="set"])',
      ].join(', ')]: {
        handler: (
          node: TSESTree.MethodDefinitionNonComputedName,
          validator,
        ): void => {
          const modifiers = getMemberModifiers(node);
          handleMember(validator, node, modifiers);
        },
        validator: validators.classicAccessor,
      },

      [[
        'Property[computed = false][kind = "init"][value.type = "ArrowFunctionExpression"]',
        'Property[computed = false][kind = "init"][value.type = "FunctionExpression"]',
        'Property[computed = false][kind = "init"][value.type = "TSEmptyBodyFunctionExpression"]',
      ].join(', ')]: {
        handler: (
          node:
            | TSESTree.PropertyNonComputedName
            | TSESTree.TSMethodSignatureNonComputedName,
          validator,
        ): void => {
          const modifiers = new Set<Modifiers>([Modifiers.public]);

          if (isAsyncMemberOrProperty(node)) {
            modifiers.add(Modifiers.async);
          }

          handleMember(validator, node, modifiers);
        },
        validator: validators.objectLiteralMethod,
      },

      // #endregion property

      // #region method

      [[
        'TSMethodSignature[computed = false]',
        'TSPropertySignature[computed = false][typeAnnotation.typeAnnotation.type = "TSFunctionType"]',
      ].join(', ')]: {
        handler: (
          node:
            | TSESTree.TSMethodSignatureNonComputedName
            | TSESTree.TSPropertySignatureNonComputedName,
          validator,
        ): void => {
          const modifiers = new Set<Modifiers>([Modifiers.public]);
          handleMember(validator, node, modifiers);
        },
        validator: validators.typeMethod,
      },

      [[
        AST_NODE_TYPES.AccessorProperty,
        AST_NODE_TYPES.TSAbstractAccessorProperty,
      ].join(', ')]: {
        handler: (
          node: TSESTree.AccessorPropertyNonComputedName,
          validator,
        ): void => {
          const modifiers = getMemberModifiers(node);
          handleMember(validator, node, modifiers);
        },
        validator: validators.autoAccessor,
      },

      'FunctionDeclaration, TSDeclareFunction, TSEmptyBodyFunctionExpression, FunctionExpression, ArrowFunctionExpression':
        {
          handler: (
            node:
              | TSESTree.ArrowFunctionExpression
              | TSESTree.FunctionDeclaration
              | TSESTree.FunctionExpression
              | TSESTree.TSDeclareFunction
              | TSESTree.TSEmptyBodyFunctionExpression,
            validator,
          ): void => {
            node.params.forEach(param => {
              if (param.type === AST_NODE_TYPES.TSParameterProperty) {
                return;
              }

              const identifiers = getIdentifiersFromPattern(param);

              identifiers.forEach(i => {
                const modifiers = new Set<Modifiers>();

                if (isDestructured(i)) {
                  modifiers.add(Modifiers.destructured);
                }

                if (isUnused(i.name, context.sourceCode.getScope(i))) {
                  modifiers.add(Modifiers.unused);
                }

                validator(i, modifiers);
              });
            });
          },
          validator: validators.parameter,
        },

      // #endregion method

      // #region accessor

      'Property[computed = false]:matches([kind = "get"], [kind = "set"])': {
        handler: (node: TSESTree.PropertyNonComputedName, validator): void => {
          const modifiers = new Set<Modifiers>([Modifiers.public]);
          handleMember(validator, node, modifiers);
        },
        validator: validators.classicAccessor,
      },

      TSParameterProperty: {
        handler: (node, validator): void => {
          const modifiers = getMemberModifiers(node);

          const identifiers = getIdentifiersFromPattern(node.parameter);

          identifiers.forEach(i => {
            validator(i, modifiers);
          });
        },
        validator: validators.parameterProperty,
      },

      // #endregion accessor

      // #region autoAccessor

      'TSPropertySignature[computed = false][typeAnnotation.typeAnnotation.type != "TSFunctionType"]':
        {
          handler: (
            node: TSESTree.TSPropertySignatureNonComputedName,
            validator,
          ): void => {
            const modifiers = new Set<Modifiers>([Modifiers.public]);
            if (node.readonly) {
              modifiers.add(Modifiers.readonly);
            }

            handleMember(validator, node, modifiers);
          },
          validator: validators.typeProperty,
        },

      // #endregion autoAccessor

      // #region enumMember

      // computed is optional, so can't do [computed = false]
      'ClassDeclaration, ClassExpression': {
        handler: (
          node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
          validator,
        ): void => {
          const id = node.id;
          if (id == null) {
            return;
          }

          const modifiers = new Set<Modifiers>();
          // classes create their own nested scope
          const scope = context.sourceCode.getScope(node).upper;

          if (node.abstract) {
            modifiers.add(Modifiers.abstract);
          }

          if (isExported(node, id.name, scope)) {
            modifiers.add(Modifiers.exported);
          }

          if (isUnused(id.name, scope)) {
            modifiers.add(Modifiers.unused);
          }

          validator(id, modifiers);
        },
        validator: validators.class,
      },

      // #endregion enumMember

      // #region class

      TSEnumDeclaration: {
        handler: (node, validator): void => {
          const modifiers = new Set<Modifiers>();
          // enums create their own nested scope
          const scope = context.sourceCode.getScope(node).upper;

          if (isExported(node, node.id.name, scope)) {
            modifiers.add(Modifiers.exported);
          }

          if (isUnused(node.id.name, scope)) {
            modifiers.add(Modifiers.unused);
          }

          validator(node.id, modifiers);
        },
        validator: validators.enum,
      },

      // #endregion class

      // #region interface

      'TSEnumMember[computed != true]': {
        handler: (
          node: TSESTree.TSEnumMemberNonComputedName,
          validator,
        ): void => {
          const id = node.id;
          const modifiers = new Set<Modifiers>();

          if (requiresQuoting(id, compilerOptions.target)) {
            modifiers.add(Modifiers.requiresQuotes);
          }

          validator(id, modifiers);
        },
        validator: validators.enumMember,
      },

      // #endregion interface

      // #region typeAlias

      TSInterfaceDeclaration: {
        handler: (node, validator): void => {
          const modifiers = new Set<Modifiers>();
          const scope = context.sourceCode.getScope(node);

          if (isExported(node, node.id.name, scope)) {
            modifiers.add(Modifiers.exported);
          }

          if (isUnused(node.id.name, scope)) {
            modifiers.add(Modifiers.unused);
          }

          validator(node.id, modifiers);
        },
        validator: validators.interface,
      },

      // #endregion typeAlias

      // #region enum

      TSTypeAliasDeclaration: {
        handler: (node, validator): void => {
          const modifiers = new Set<Modifiers>();
          const scope = context.sourceCode.getScope(node);

          if (isExported(node, node.id.name, scope)) {
            modifiers.add(Modifiers.exported);
          }

          if (isUnused(node.id.name, scope)) {
            modifiers.add(Modifiers.unused);
          }

          validator(node.id, modifiers);
        },
        validator: validators.typeAlias,
      },

      // #endregion enum

      // #region typeParameter

      'TSTypeParameterDeclaration > TSTypeParameter': {
        handler: (node: TSESTree.TSTypeParameter, validator): void => {
          const modifiers = new Set<Modifiers>();
          const scope = context.sourceCode.getScope(node);

          if (isUnused(node.name.name, scope)) {
            modifiers.add(Modifiers.unused);
          }

          validator(node.name, modifiers);
        },
        validator: validators.typeParameter,
      },

      // #endregion typeParameter
    };

    return Object.fromEntries(
      Object.entries(selectors).map(([selector, { handler, validator }]) => {
        return [
          selector,
          (node: Parameters<typeof handler>[0]): void => {
            handler(node, validator);
          },
        ] as const;
      }),
    );
  },
});

function getIdentifiersFromPattern(
  pattern: TSESTree.DestructuringPattern,
): TSESTree.Identifier[] {
  const identifiers: TSESTree.Identifier[] = [];
  const visitor = new PatternVisitor({}, pattern, id => identifiers.push(id));
  visitor.visit(pattern);
  return identifiers;
}

function isExported(
  node: TSESTree.Node | undefined,
  name: string,
  scope: TSESLint.Scope.Scope | null,
): boolean {
  if (
    node?.parent?.type === AST_NODE_TYPES.ExportDefaultDeclaration ||
    node?.parent?.type === AST_NODE_TYPES.ExportNamedDeclaration
  ) {
    return true;
  }

  if (scope == null) {
    return false;
  }

  const variable = scope.set.get(name);
  if (variable) {
    for (const ref of variable.references) {
      const refParent = ref.identifier.parent;
      if (
        refParent.type === AST_NODE_TYPES.ExportDefaultDeclaration ||
        refParent.type === AST_NODE_TYPES.ExportSpecifier
      ) {
        return true;
      }
    }
  }

  return false;
}

function isGlobal(scope: TSESLint.Scope.Scope | null): boolean {
  if (scope == null) {
    return false;
  }

  return (
    scope.type === TSESLint.Scope.ScopeType.global ||
    scope.type === TSESLint.Scope.ScopeType.module
  );
}

function requiresQuoting(
  node: TSESTree.Identifier | TSESTree.Literal | TSESTree.PrivateIdentifier,
  target: ScriptTarget | undefined,
): boolean {
  const name =
    node.type === AST_NODE_TYPES.Identifier ||
    node.type === AST_NODE_TYPES.PrivateIdentifier
      ? node.name
      : `${node.value}`;
  return _requiresQuoting(name, target);
}
