import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { PatternVisitor } from '@typescript-eslint/scope-manager';
import type { ScriptTarget } from 'typescript';
import * as util from '../util';
import {
  Context,
  Modifiers,
  parseOptions,
  SCHEMA,
  Selector,
  ValidatorFunction,
} from './naming-convention-utils';

type MessageIds =
  | 'unexpectedUnderscore'
  | 'missingUnderscore'
  | 'missingAffix'
  | 'satisfyCustom'
  | 'doesNotMatchFormat'
  | 'doesNotMatchFormatTrimmed';

// Note that this intentionally does not strictly type the modifiers/types properties.
// This is because doing so creates a huge headache, as the rule's code doesn't need to care.
// The JSON Schema strictly types these properties, so we know the user won't input invalid config.
type Options = Selector[];

// This essentially mirrors ESLint's `camelcase` rule
// note that that rule ignores leading and trailing underscores and only checks those in the middle of a variable name
const defaultCamelCaseAllTheThingsConfig: Options = [
  {
    selector: 'default',
    format: ['camelCase'],
    leadingUnderscore: 'allow',
    trailingUnderscore: 'allow',
  },

  {
    selector: 'variable',
    format: ['camelCase', 'UPPER_CASE'],
    leadingUnderscore: 'allow',
    trailingUnderscore: 'allow',
  },

  {
    selector: 'typeLike',
    format: ['PascalCase'],
  },
];

export default util.createRule<Options, MessageIds>({
  name: 'naming-convention',
  meta: {
    docs: {
      category: 'Variables',
      description:
        'Enforces naming conventions for everything across a codebase',
      recommended: false,
      // technically only requires type checking if the user uses "type" modifiers
      requiresTypeChecking: true,
    },
    type: 'suggestion',
    messages: {
      unexpectedUnderscore:
        '{{type}} name `{{name}}` must not have a {{position}} underscore.',
      missingUnderscore:
        '{{type}} name `{{name}}` must have {{count}} {{position}} underscore(s).',
      missingAffix:
        '{{type}} name `{{name}}` must have one of the following {{position}}es: {{affixes}}',
      satisfyCustom:
        '{{type}} name `{{name}}` must {{regexMatch}} the RegExp: {{regex}}',
      doesNotMatchFormat:
        '{{type}} name `{{name}}` must match one of the following formats: {{formats}}',
      doesNotMatchFormatTrimmed:
        '{{type}} name `{{name}}` trimmed as `{{processedName}}` must match one of the following formats: {{formats}}',
    },
    schema: SCHEMA,
  },
  defaultOptions: defaultCamelCaseAllTheThingsConfig,
  create(contextWithoutDefaults) {
    const context: Context =
      contextWithoutDefaults.options &&
      contextWithoutDefaults.options.length > 0
        ? contextWithoutDefaults
        : // only apply the defaults when the user provides no config
          Object.setPrototypeOf(
            {
              options: defaultCamelCaseAllTheThingsConfig,
            },
            contextWithoutDefaults,
          );

    const validators = parseOptions(context);

    // getParserServices(context, false) -- dirty hack to work around the docs checker test...
    const compilerOptions = util
      .getParserServices(context, true)
      .program.getCompilerOptions();
    function handleMember(
      validator: ValidatorFunction | null,
      node:
        | TSESTree.PropertyNonComputedName
        | TSESTree.ClassPropertyNonComputedName
        | TSESTree.TSAbstractClassPropertyNonComputedName
        | TSESTree.TSPropertySignatureNonComputedName
        | TSESTree.MethodDefinitionNonComputedName
        | TSESTree.TSAbstractMethodDefinitionNonComputedName
        | TSESTree.TSMethodSignatureNonComputedName,
      modifiers: Set<Modifiers>,
    ): void {
      if (!validator) {
        return;
      }

      const key = node.key;
      if (requiresQuoting(key, compilerOptions.target)) {
        modifiers.add(Modifiers.requiresQuotes);
      }

      validator(key, modifiers);
    }

    function getMemberModifiers(
      node:
        | TSESTree.ClassProperty
        | TSESTree.TSAbstractClassProperty
        | TSESTree.MethodDefinition
        | TSESTree.TSAbstractMethodDefinition
        | TSESTree.TSParameterProperty,
    ): Set<Modifiers> {
      const modifiers = new Set<Modifiers>();
      if (node.accessibility) {
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
      if (
        node.type === AST_NODE_TYPES.TSAbstractClassProperty ||
        node.type === AST_NODE_TYPES.TSAbstractMethodDefinition
      ) {
        modifiers.add(Modifiers.abstract);
      }

      return modifiers;
    }

    const unusedVariables = util.collectUnusedVariables(context);
    function isUnused(
      name: string,
      initialScope: TSESLint.Scope.Scope | null = context.getScope(),
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
        (id.parent?.type === AST_NODE_TYPES.Property && id.parent.shorthand) ||
        // `const { x = 2 }`
        // does not match const `{ x: y = 2 }`
        (id.parent?.type === AST_NODE_TYPES.AssignmentPattern &&
          id.parent.parent?.type === AST_NODE_TYPES.Property &&
          id.parent.parent.shorthand)
      );
    }

    return {
      // #region variable

      VariableDeclarator(node: TSESTree.VariableDeclarator): void {
        const validator = validators.variable;
        if (!validator) {
          return;
        }
        const identifiers = getIdentifiersFromPattern(node.id);

        const baseModifiers = new Set<Modifiers>();
        const parent = node.parent;
        if (parent?.type === AST_NODE_TYPES.VariableDeclaration) {
          if (parent.kind === 'const') {
            baseModifiers.add(Modifiers.const);
          }

          if (isGlobal(context.getScope())) {
            baseModifiers.add(Modifiers.global);
          }
        }

        identifiers.forEach(id => {
          const modifiers = new Set(baseModifiers);

          if (isDestructured(id)) {
            modifiers.add(Modifiers.destructured);
          }

          if (isExported(parent, id.name, context.getScope())) {
            modifiers.add(Modifiers.exported);
          }

          if (isUnused(id.name)) {
            modifiers.add(Modifiers.unused);
          }

          validator(id, modifiers);
        });
      },

      // #endregion

      // #region function

      'FunctionDeclaration, TSDeclareFunction, FunctionExpression'(
        node:
          | TSESTree.FunctionDeclaration
          | TSESTree.TSDeclareFunction
          | TSESTree.FunctionExpression,
      ): void {
        const validator = validators.function;
        if (!validator || node.id === null) {
          return;
        }

        const modifiers = new Set<Modifiers>();
        // functions create their own nested scope
        const scope = context.getScope().upper;

        if (isGlobal(scope)) {
          modifiers.add(Modifiers.global);
        }

        if (isExported(node, node.id.name, scope)) {
          modifiers.add(Modifiers.exported);
        }

        if (isUnused(node.id.name, scope)) {
          modifiers.add(Modifiers.unused);
        }

        validator(node.id, modifiers);
      },

      // #endregion function

      // #region parameter
      'FunctionDeclaration, TSDeclareFunction, TSEmptyBodyFunctionExpression, FunctionExpression, ArrowFunctionExpression'(
        node:
          | TSESTree.FunctionDeclaration
          | TSESTree.TSDeclareFunction
          | TSESTree.TSEmptyBodyFunctionExpression
          | TSESTree.FunctionExpression
          | TSESTree.ArrowFunctionExpression,
      ): void {
        const validator = validators.parameter;
        if (!validator) {
          return;
        }

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

            if (isUnused(i.name)) {
              modifiers.add(Modifiers.unused);
            }

            validator(i, modifiers);
          });
        });
      },

      // #endregion parameter

      // #region parameterProperty

      TSParameterProperty(node): void {
        const validator = validators.parameterProperty;
        if (!validator) {
          return;
        }

        const modifiers = getMemberModifiers(node);

        const identifiers = getIdentifiersFromPattern(node.parameter);

        identifiers.forEach(i => {
          validator(i, modifiers);
        });
      },

      // #endregion parameterProperty

      // #region property

      ':not(ObjectPattern) > Property[computed = false][kind = "init"][value.type != "ArrowFunctionExpression"][value.type != "FunctionExpression"][value.type != "TSEmptyBodyFunctionExpression"]'(
        node: TSESTree.PropertyNonComputedName,
      ): void {
        const modifiers = new Set<Modifiers>([Modifiers.public]);
        handleMember(validators.objectLiteralProperty, node, modifiers);
      },

      ':matches(ClassProperty, TSAbstractClassProperty)[computed = false][value.type != "ArrowFunctionExpression"][value.type != "FunctionExpression"][value.type != "TSEmptyBodyFunctionExpression"]'(
        node:
          | TSESTree.ClassPropertyNonComputedName
          | TSESTree.TSAbstractClassPropertyNonComputedName,
      ): void {
        const modifiers = getMemberModifiers(node);
        handleMember(validators.classProperty, node, modifiers);
      },

      'TSPropertySignature[computed = false]'(
        node: TSESTree.TSPropertySignatureNonComputedName,
      ): void {
        const modifiers = new Set<Modifiers>([Modifiers.public]);
        if (node.readonly) {
          modifiers.add(Modifiers.readonly);
        }

        handleMember(validators.typeProperty, node, modifiers);
      },

      // #endregion property

      // #region method

      [[
        'Property[computed = false][kind = "init"][value.type = "ArrowFunctionExpression"]',
        'Property[computed = false][kind = "init"][value.type = "FunctionExpression"]',
        'Property[computed = false][kind = "init"][value.type = "TSEmptyBodyFunctionExpression"]',
      ].join(', ')](
        node:
          | TSESTree.PropertyNonComputedName
          | TSESTree.TSMethodSignatureNonComputedName,
      ): void {
        const modifiers = new Set<Modifiers>([Modifiers.public]);
        handleMember(validators.objectLiteralMethod, node, modifiers);
      },

      [[
        ':matches(ClassProperty, TSAbstractClassProperty)[computed = false][value.type = "ArrowFunctionExpression"]',
        ':matches(ClassProperty, TSAbstractClassProperty)[computed = false][value.type = "FunctionExpression"]',
        ':matches(ClassProperty, TSAbstractClassProperty)[computed = false][value.type = "TSEmptyBodyFunctionExpression"]',
        ':matches(MethodDefinition, TSAbstractMethodDefinition)[computed = false][kind = "method"]',
      ].join(', ')](
        node:
          | TSESTree.ClassPropertyNonComputedName
          | TSESTree.TSAbstractClassPropertyNonComputedName
          | TSESTree.MethodDefinitionNonComputedName
          | TSESTree.TSAbstractMethodDefinitionNonComputedName,
      ): void {
        const modifiers = getMemberModifiers(node);
        handleMember(validators.classMethod, node, modifiers);
      },

      'TSMethodSignature[computed = false]'(
        node: TSESTree.TSMethodSignatureNonComputedName,
      ): void {
        const modifiers = new Set<Modifiers>([Modifiers.public]);
        handleMember(validators.typeMethod, node, modifiers);
      },

      // #endregion method

      // #region accessor

      'Property[computed = false]:matches([kind = "get"], [kind = "set"])'(
        node: TSESTree.PropertyNonComputedName,
      ): void {
        const modifiers = new Set<Modifiers>([Modifiers.public]);
        handleMember(validators.accessor, node, modifiers);
      },

      'MethodDefinition[computed = false]:matches([kind = "get"], [kind = "set"])'(
        node: TSESTree.MethodDefinitionNonComputedName,
      ): void {
        const modifiers = getMemberModifiers(node);
        handleMember(validators.accessor, node, modifiers);
      },

      // #endregion accessor

      // #region enumMember

      // computed is optional, so can't do [computed = false]
      'TSEnumMember[computed != true]'(
        node: TSESTree.TSEnumMemberNonComputedName,
      ): void {
        const validator = validators.enumMember;
        if (!validator) {
          return;
        }

        const id = node.id;
        const modifiers = new Set<Modifiers>();

        if (requiresQuoting(id, compilerOptions.target)) {
          modifiers.add(Modifiers.requiresQuotes);
        }

        validator(id, modifiers);
      },

      // #endregion enumMember

      // #region class

      'ClassDeclaration, ClassExpression'(
        node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
      ): void {
        const validator = validators.class;
        if (!validator) {
          return;
        }

        const id = node.id;
        if (id === null) {
          return;
        }

        const modifiers = new Set<Modifiers>();
        // classes create their own nested scope
        const scope = context.getScope().upper;

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

      // #endregion class

      // #region interface

      TSInterfaceDeclaration(node): void {
        const validator = validators.interface;
        if (!validator) {
          return;
        }

        const modifiers = new Set<Modifiers>();
        const scope = context.getScope();

        if (isExported(node, node.id.name, scope)) {
          modifiers.add(Modifiers.exported);
        }

        if (isUnused(node.id.name, scope)) {
          modifiers.add(Modifiers.unused);
        }

        validator(node.id, modifiers);
      },

      // #endregion interface

      // #region typeAlias

      TSTypeAliasDeclaration(node): void {
        const validator = validators.typeAlias;
        if (!validator) {
          return;
        }

        const modifiers = new Set<Modifiers>();
        const scope = context.getScope();

        if (isExported(node, node.id.name, scope)) {
          modifiers.add(Modifiers.exported);
        }

        if (isUnused(node.id.name, scope)) {
          modifiers.add(Modifiers.unused);
        }

        validator(node.id, modifiers);
      },

      // #endregion typeAlias

      // #region enum

      TSEnumDeclaration(node): void {
        const validator = validators.enum;
        if (!validator) {
          return;
        }

        const modifiers = new Set<Modifiers>();
        // enums create their own nested scope
        const scope = context.getScope().upper;

        if (isExported(node, node.id.name, scope)) {
          modifiers.add(Modifiers.exported);
        }

        if (isUnused(node.id.name, scope)) {
          modifiers.add(Modifiers.unused);
        }

        validator(node.id, modifiers);
      },

      // #endregion enum

      // #region typeParameter

      'TSTypeParameterDeclaration > TSTypeParameter'(
        node: TSESTree.TSTypeParameter,
      ): void {
        const validator = validators.typeParameter;
        if (!validator) {
          return;
        }

        const modifiers = new Set<Modifiers>();
        const scope = context.getScope();

        if (isUnused(node.name.name, scope)) {
          modifiers.add(Modifiers.unused);
        }

        validator(node.name, modifiers);
      },

      // #endregion typeParameter
    };
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
        refParent?.type === AST_NODE_TYPES.ExportDefaultDeclaration ||
        refParent?.type === AST_NODE_TYPES.ExportSpecifier
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
  node: TSESTree.Identifier | TSESTree.Literal,
  target: ScriptTarget | undefined,
): boolean {
  const name =
    node.type === AST_NODE_TYPES.Identifier ? node.name : `${node.value}`;
  return util.requiresQuoting(name, target);
}

export { MessageIds, Options };
