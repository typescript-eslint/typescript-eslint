import {
  TSESTree,
  AST_NODE_TYPES,
  TSESLint,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';
import {
  checkFunctionExpressionReturnType,
  checkFunctionReturnType,
  isTypedFunctionExpression,
} from '../util/explicitReturnTypeUtils';

type Options = [
  {
    allowTypedFunctionExpressions?: boolean;
    allowHigherOrderFunctions?: boolean;
    allowDirectConstAssertionInArrowFunctions?: boolean;
    allowedNames?: string[];
    shouldTrackReferences?: boolean;
  },
];
type MessageIds = 'missingReturnType' | 'missingArgType';

export default util.createRule<Options, MessageIds>({
  name: 'explicit-module-boundary-types',
  meta: {
    type: 'problem',
    docs: {
      description:
        "Require explicit return and argument types on exported functions' and classes' public class methods",
      category: 'Stylistic Issues',
      recommended: false,
    },
    messages: {
      missingReturnType: 'Missing return type on function.',
      missingArgType: "Argument '{{name}}' should be typed.",
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowTypedFunctionExpressions: {
            type: 'boolean',
          },
          allowHigherOrderFunctions: {
            type: 'boolean',
          },
          allowDirectConstAssertionInArrowFunctions: {
            type: 'boolean',
          },
          allowedNames: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          shouldTrackReferences: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      allowTypedFunctionExpressions: true,
      allowHigherOrderFunctions: true,
      allowDirectConstAssertionInArrowFunctions: true,
      allowedNames: [],
      shouldTrackReferences: false,
    },
  ],
  create(context, [options]) {
    const sourceCode = context.getSourceCode();

    function isUnexported(node: TSESTree.Node | undefined): boolean {
      let isReturnedValue = false;
      while (node) {
        if (
          node.type === AST_NODE_TYPES.ExportDefaultDeclaration ||
          node.type === AST_NODE_TYPES.ExportNamedDeclaration ||
          node.type === AST_NODE_TYPES.ExportSpecifier
        ) {
          return false;
        }

        if (node.type === AST_NODE_TYPES.JSXExpressionContainer) {
          return true;
        }

        if (node.type === AST_NODE_TYPES.ReturnStatement) {
          isReturnedValue = true;
        }

        if (
          node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
          node.type === AST_NODE_TYPES.FunctionDeclaration ||
          node.type === AST_NODE_TYPES.FunctionExpression
        ) {
          isReturnedValue = false;
        }

        if (node.type === AST_NODE_TYPES.BlockStatement && !isReturnedValue) {
          return true;
        }

        node = node.parent;
      }

      return true;
    }

    function isArgumentUntyped(node: TSESTree.Identifier): boolean {
      return (
        !node.typeAnnotation ||
        node.typeAnnotation.typeAnnotation.type === AST_NODE_TYPES.TSAnyKeyword
      );
    }

    /**
     * Checks if a function declaration/expression has a return type.
     */
    function checkArguments(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression,
    ): void {
      const paramIdentifiers = node.params.filter(util.isIdentifier);
      const untypedArgs = paramIdentifiers.filter(isArgumentUntyped);
      untypedArgs.forEach(untypedArg =>
        context.report({
          node,
          messageId: 'missingArgType',
          data: {
            name: untypedArg.name,
          },
        }),
      );
    }

    /**
     * Checks if a function name is allowed and should not be checked.
     */
    function isAllowedName(node: TSESTree.Node | undefined): boolean {
      if (!node || !options.allowedNames || !options.allowedNames.length) {
        return false;
      }

      if (node.type === AST_NODE_TYPES.VariableDeclarator) {
        return (
          node.id.type === AST_NODE_TYPES.Identifier &&
          options.allowedNames.includes(node.id.name)
        );
      } else if (
        node.type === AST_NODE_TYPES.MethodDefinition ||
        node.type === AST_NODE_TYPES.TSAbstractMethodDefinition
      ) {
        if (
          node.key.type === AST_NODE_TYPES.Literal &&
          typeof node.key.value === 'string'
        ) {
          return options.allowedNames.includes(node.key.value);
        }
        if (
          node.key.type === AST_NODE_TYPES.TemplateLiteral &&
          node.key.expressions.length === 0
        ) {
          return options.allowedNames.includes(node.key.quasis[0].value.raw);
        }
        if (!node.computed && node.key.type === AST_NODE_TYPES.Identifier) {
          return options.allowedNames.includes(node.key.name);
        }
      }

      return false;
    }

    /**
     * Finds an array of a function expression node referred by a variable passed from parameters
     */
    function findFunctionExpressionsInScope(
      variable: TSESLint.Scope.Variable,
    ):
      | (TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression)[]
      | undefined {
      const writeExprs = variable.references
        .map(ref => ref.writeExpr)
        .filter(
          (
            expr,
          ): expr is
            | TSESTree.ArrowFunctionExpression
            | TSESTree.FunctionExpression =>
            expr?.type === AST_NODE_TYPES.FunctionExpression ||
            expr?.type === AST_NODE_TYPES.ArrowFunctionExpression,
        );

      return writeExprs;
    }

    /**
     * Finds a function node referred by a variable passed from parameters
     */
    function findFunctionInScope(
      varibale: TSESLint.Scope.Variable,
    ): TSESTree.FunctionDeclaration | undefined {
      if (varibale.defs[0].type !== 'FunctionName') {
        return;
      }

      const functionNode = varibale.defs[0].node;

      if (
        functionNode &&
        functionNode.type !== AST_NODE_TYPES.FunctionDeclaration
      ) {
        return;
      }

      return functionNode;
    }

    /**
     * Checks if a function referred by the identifier passed from parameters follow the rule
     */
    function checkWithTrackingReferences(node: TSESTree.Identifier): void {
      if (!options.shouldTrackReferences) {
        return;
      }

      const scope = context.getScope();
      const variable = scope.set.get(node.name);

      if (!variable) {
        return;
      }

      if (variable.defs[0].type === 'ClassName') {
        const classNode = variable.defs[0].node;
        for (const classElement of classNode.body.body) {
          if (
            classElement.type === AST_NODE_TYPES.MethodDefinition &&
            classElement.value.type === AST_NODE_TYPES.FunctionExpression
          ) {
            checkFunctionExpression(classElement.value);
          }

          if (
            classElement.type === AST_NODE_TYPES.ClassProperty &&
            (classElement.value?.type === AST_NODE_TYPES.FunctionExpression ||
              classElement.value?.type ===
                AST_NODE_TYPES.ArrowFunctionExpression)
          ) {
            checkFunctionExpression(classElement.value);
          }
        }
      }

      const functionNode = findFunctionInScope(variable);
      if (functionNode) {
        checkFunction(functionNode);
      }

      const functionExpressions = findFunctionExpressionsInScope(variable);
      if (functionExpressions && functionExpressions.length > 0) {
        for (const functionExpression of functionExpressions) {
          checkFunctionExpression(functionExpression);
        }
      }
    }

    /**
     * Checks if a function expression follow the rule
     */
    function checkFunctionExpression(
      node: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
    ): void {
      if (
        node.parent?.type === AST_NODE_TYPES.MethodDefinition &&
        node.parent.accessibility === 'private'
      ) {
        // don't check private methods as they aren't part of the public signature
        return;
      }

      if (
        isAllowedName(node.parent) ||
        isTypedFunctionExpression(node, options)
      ) {
        return;
      }

      checkFunctionExpressionReturnType(node, options, sourceCode, loc =>
        context.report({
          node,
          loc,
          messageId: 'missingReturnType',
        }),
      );

      checkArguments(node);
    }

    /**
     * Checks if a function follow the rule
     */
    function checkFunction(node: TSESTree.FunctionDeclaration): void {
      if (isAllowedName(node.parent)) {
        return;
      }

      checkFunctionReturnType(node, options, sourceCode, loc =>
        context.report({
          node,
          loc,
          messageId: 'missingReturnType',
        }),
      );

      checkArguments(node);
    }

    return {
      'ArrowFunctionExpression, FunctionExpression'(
        node: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
      ): void {
        if (isUnexported(node)) {
          return;
        }

        checkFunctionExpression(node);
      },
      FunctionDeclaration(node): void {
        if (isUnexported(node)) {
          return;
        }

        checkFunction(node);
      },
      'ExportDefaultDeclaration, TSExportAssignment'(
        node: TSESTree.ExportDefaultDeclaration | TSESTree.TSExportAssignment,
      ): void {
        let exported: TSESTree.Node;

        if (node.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
          exported = node.declaration;
        } else {
          exported = node.expression;
        }

        switch (exported.type) {
          case AST_NODE_TYPES.Identifier: {
            checkWithTrackingReferences(exported);
            break;
          }
          case AST_NODE_TYPES.ArrayExpression: {
            for (const element of exported.elements) {
              if (element.type === AST_NODE_TYPES.Identifier) {
                checkWithTrackingReferences(element);
              }
            }
            break;
          }
          case AST_NODE_TYPES.ObjectExpression: {
            for (const property of exported.properties) {
              if (
                property.type === AST_NODE_TYPES.Property &&
                property.value.type === AST_NODE_TYPES.Identifier
              ) {
                checkWithTrackingReferences(property.value);
              }
            }
            break;
          }
        }
      },
    };
  },
});
