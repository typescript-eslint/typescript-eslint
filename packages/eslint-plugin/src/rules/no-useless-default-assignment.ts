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

    function isCallbackFunction(
      functionNode:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionExpression,
    ): boolean {
      const parentType = functionNode.parent.type;
      return (
        parentType !== AST_NODE_TYPES.MethodDefinition &&
        parentType !== AST_NODE_TYPES.VariableDeclarator &&
        parentType !== AST_NODE_TYPES.Property &&
        parentType !== AST_NODE_TYPES.ExpressionStatement &&
        parentType !== AST_NODE_TYPES.ReturnStatement
      );
    }

    function checkAssignmentPattern(node: TSESTree.AssignmentPattern): void {
      const parent = node.parent;

      // Handle callback parameters (like array.map((a = 42) => ...))
      if (
        parent.type === AST_NODE_TYPES.ArrowFunctionExpression ||
        parent.type === AST_NODE_TYPES.FunctionExpression
      ) {
        const paramIndex = parent.params.indexOf(node);
        if (paramIndex !== -1) {
          // Only check if this is actually a callback, not a regular function
          if (!isCallbackFunction(parent)) {
            return;
          }

          const tsFunc = services.esTreeNodeToTSNodeMap.get(parent);
          if (ts.isFunctionLike(tsFunc)) {
            const signature = checker.getSignatureFromDeclaration(tsFunc);
            if (signature) {
              const params = signature.getParameters();
              if (paramIndex < params.length) {
                const paramType = checker.getTypeOfSymbol(params[paramIndex]);
                if (!canBeUndefined(paramType)) {
                  reportUselessDefault(node, 'parameter');
                }
              }
            }
          }
        }
        return;
      }

      // Handle destructuring patterns
      if (parent.type === AST_NODE_TYPES.Property) {
        // This is a property in an object destructuring pattern
        const objectPattern = parent.parent as TSESTree.ObjectPattern;

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
        const tsFunc = services.esTreeNodeToTSNodeMap.get(parent);
        const signature = checker.getSignatureFromDeclaration(tsFunc);
        if (!signature) {
          return null;
        }
        const params = signature.getParameters();
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
              // Remove from before the = to the end of the default value
              // Find the start position (including whitespace before =)
              const start = node.left.range[1];
              const end = node.range[1];
              return fixer.removeRange([start, end]);
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
