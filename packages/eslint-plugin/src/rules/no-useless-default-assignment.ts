import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getParserServices,
  isTypeAnyType,
  isTypeFlagSet,
  isTypeUnknownType,
} from '../util';

type Options = [
  {
    allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing?: boolean;
  },
];

type MessageId =
  | 'noStrictNullCheck'
  | 'suggestRemoveDefault'
  | 'uselessDefaultAssignment';

export default createRule<Options, MessageId>({
  name: 'no-useless-default-assignment',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow default values that will never be used',
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    messages: {
      noStrictNullCheck:
        'This rule requires the `strictNullChecks` compiler option to be turned on to function correctly.',
      suggestRemoveDefault: 'Remove useless default value',
      uselessDefaultAssignment:
        'Default value is useless because the {{ type }} is not optional.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: {
            type: 'boolean',
            description:
              'Unless this is set to `true`, the rule will error on every file whose `tsconfig.json` does _not_ have the `strictNullChecks` compiler option (or `strict`) set to `true`.',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
    },
  ],
  create(context, [options]) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    const compilerOptions = services.program.getCompilerOptions();

    const isStrictNullChecks = tsutils.isStrictCompilerOptionEnabled(
      compilerOptions,
      'strictNullChecks',
    );

    if (
      !isStrictNullChecks &&
      options.allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing !== true
    ) {
      context.report({
        loc: {
          start: { column: 0, line: 0 },
          end: { column: 0, line: 0 },
        },
        messageId: 'noStrictNullCheck',
      });
    }

    function canBeUndefined(type: ts.Type): boolean {
      // any and unknown can be undefined
      if (isTypeAnyType(type) || isTypeUnknownType(type)) {
        return true;
      }
      // Check if any part of the union includes undefined
      return tsutils
        .unionConstituents(type)
        .some(part => isTypeFlagSet(part, ts.TypeFlags.Undefined));
    }

    function getPropertyType(
      objectType: ts.Type,
      propertyName: string,
    ): ts.Type | null {
      const symbol = objectType.getProperty(propertyName);
      if (!symbol) {
        return null;
      }
      return checker.getTypeOfSymbol(symbol);
    }

    function shouldSkipParameterCheck(
      node: TSESTree.AssignmentPattern,
      functionNode:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression,
    ): boolean {
      // If the parameter has an explicit type annotation, don't skip
      if (
        node.left.type !== AST_NODE_TYPES.Identifier ||
        node.left.typeAnnotation
      ) {
        return false;
      }

      // Only skip the check for function declarations and named function expressions
      // that are not callbacks (i.e., they are statements or variable initializers).
      // For callbacks, TypeScript infers the type from context, so we should still
      // check if the default is useless.
      return (
        functionNode.type === AST_NODE_TYPES.FunctionDeclaration ||
        (functionNode.type === AST_NODE_TYPES.FunctionExpression &&
          functionNode.parent.type === AST_NODE_TYPES.VariableDeclarator)
      );
    }

    function checkAssignmentPattern(node: TSESTree.AssignmentPattern): void {
      let current: TSESTree.Node | undefined = node.parent;

      // For function parameters, the AssignmentPattern might be directly in the params array
      // So we need to check if any ancestor is a function
      while (current != null) {
        if (
          current.type === AST_NODE_TYPES.FunctionExpression ||
          current.type === AST_NODE_TYPES.ArrowFunctionExpression ||
          current.type === AST_NODE_TYPES.FunctionDeclaration
        ) {
          // Check if this AssignmentPattern is a direct parameter (not in a destructuring)
          const isDirectParameter = current.params.some(
            param => param === node,
          );

          if (isDirectParameter) {
            if (!shouldSkipParameterCheck(node, current)) {
              const tsNode = services.esTreeNodeToTSNodeMap.get(node.left);
              const type = checker.getTypeAtLocation(tsNode);
              if (!canBeUndefined(type)) {
                reportUselessDefault(node, 'parameter');
              }
            }
            return;
          }
          break;
        }
        current = current.parent;
      }

      const parent = node.parent;

      // Handle destructuring patterns
      if (parent.type === AST_NODE_TYPES.Property) {
        // This is a property in an object destructuring pattern
        const objectPattern = parent.parent as TSESTree.ObjectPattern | null;
        if (!objectPattern) {
          return;
        }

        // Get the source type being destructured
        const sourceType = getSourceTypeForPattern(objectPattern);
        if (!sourceType) {
          return;
        }

        // Get the property name
        const propertyName = getPropertyName(parent.key);
        if (!propertyName) {
          return;
        }

        // Get the type of this specific property
        const propertyType = getPropertyType(sourceType, propertyName);
        if (!propertyType) {
          return;
        }

        if (!canBeUndefined(propertyType)) {
          reportUselessDefault(node, 'property');
        }
      }
    }

    function getSourceTypeForPattern(
      pattern: TSESTree.ArrayPattern | TSESTree.ObjectPattern,
    ): ts.Type | null {
      let currentNode: TSESTree.Node = pattern;

      // Walk up through nested patterns
      while (
        currentNode.parent.type === AST_NODE_TYPES.AssignmentPattern ||
        currentNode.parent.type === AST_NODE_TYPES.Property ||
        currentNode.parent.type === AST_NODE_TYPES.ObjectPattern ||
        currentNode.parent.type === AST_NODE_TYPES.ArrayPattern
      ) {
        currentNode = currentNode.parent;
      }

      const parent = currentNode.parent;

      // Handle variable declarator
      if (parent.type === AST_NODE_TYPES.VariableDeclarator && parent.init) {
        const tsNode = services.esTreeNodeToTSNodeMap.get(parent.init);
        return checker.getTypeAtLocation(tsNode);
      }

      // Handle function parameter
      if (
        parent.type === AST_NODE_TYPES.FunctionExpression ||
        parent.type === AST_NODE_TYPES.ArrowFunctionExpression ||
        parent.type === AST_NODE_TYPES.FunctionDeclaration
      ) {
        const paramIndex = parent.params.indexOf(
          currentNode as TSESTree.Parameter,
        );
        if (paramIndex === -1) {
          return null;
        }

        const tsFunc = services.esTreeNodeToTSNodeMap.get(parent);
        if (!ts.isFunctionLike(tsFunc)) {
          return null;
        }

        const signature = checker.getSignatureFromDeclaration(tsFunc);
        if (!signature) {
          return null;
        }

        const params = signature.getParameters();
        if (paramIndex >= params.length) {
          return null;
        }

        return checker.getTypeOfSymbol(params[paramIndex]);
      }

      return null;
    }

    function getPropertyName(
      key: TSESTree.Expression | TSESTree.PrivateIdentifier,
    ): string | null {
      switch (key.type) {
        case AST_NODE_TYPES.Identifier:
          return key.name;
        case AST_NODE_TYPES.Literal:
          return String(key.value);
        default:
          return null;
      }
    }

    function reportUselessDefault(
      node: TSESTree.AssignmentPattern,
      type: 'parameter' | 'property',
    ): void {
      context.report({
        node: node.right,
        messageId: 'uselessDefaultAssignment',
        data: { type },
        suggest: [
          {
            messageId: 'suggestRemoveDefault',
            fix(fixer) {
              // Remove the ` = default_value` part
              const leftNode = node.left;
              const tokenBefore = context.sourceCode.getTokenBefore(node.right);
              if (!tokenBefore?.value || tokenBefore.value !== '=') {
                return null;
              }
              // Remove from before the = to the end of the default value
              // Find the start position (including whitespace before =)
              const leftEnd = leftNode.range[1];
              return fixer.removeRange([leftEnd, node.range[1]]);
            },
          },
        ],
      });
    }

    return {
      AssignmentPattern: checkAssignmentPattern,
    };
  },
});
