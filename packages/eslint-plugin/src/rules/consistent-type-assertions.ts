import * as util from '../util';
import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';

// intentionally mirroring the options
type MessageIds =
  | 'as'
  | 'angle-bracket'
  | 'never'
  | 'unexpectedObjectTypeAssertion';
type OptUnion =
  | {
      assertionStyle: 'as' | 'angle-bracket';
      objectLiteralTypeAssertions?: 'allow' | 'allow-as-parameter' | 'never';
    }
  | {
      assertionStyle: 'never';
    };
type Options = [OptUnion];

export default util.createRule<Options, MessageIds>({
  name: 'consistent-type-assertions',
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Best Practices',
      description: 'Enforces consistent usage of type assertions',
      recommended: false,
    },
    messages: {
      as: "Use 'as {{cast}}' instead of '<{{cast}}>'.",
      'angle-bracket': "Use '<{{cast}}>' instead of 'as {{cast}}'.",
      never: 'Do not use any type assertions.',
      unexpectedObjectTypeAssertion: 'Always prefer const x: T = { ... }.',
    },
    schema: [
      {
        oneOf: [
          {
            type: 'object',
            properties: {
              assertionStyle: {
                enum: ['never'],
              },
            },
            additionalProperties: false,
            required: ['assertionStyle'],
          },
          {
            type: 'object',
            properties: {
              assertionStyle: {
                enum: ['as', 'angle-bracket'],
              },
              objectLiteralTypeAssertions: {
                enum: ['allow', 'allow-as-parameter', 'never'],
              },
            },
            additionalProperties: false,
            required: ['assertionStyle'],
          },
        ],
      },
    ],
  },
  defaultOptions: [
    {
      assertionStyle: 'as',
      objectLiteralTypeAssertions: 'allow',
    },
  ],
  create(context, [options]) {
    const sourceCode = context.getSourceCode();

    function isConst(node: TSESTree.TypeNode): boolean {
      if (node.type !== AST_NODE_TYPES.TSTypeReference) {
        return false;
      }

      return (
        node.typeName.type === AST_NODE_TYPES.Identifier &&
        node.typeName.name === 'const'
      );
    }

    function reportIncorrectAssertionType(
      node: TSESTree.TSTypeAssertion | TSESTree.TSAsExpression,
    ): void {
      // If this node is `as const`, then don't report an error.
      if (isConst(node.typeAnnotation)) {
        return;
      }

      const messageId = options.assertionStyle;

      context.report({
        node,
        messageId,
        data:
          messageId !== 'never'
            ? { cast: sourceCode.getText(node.typeAnnotation) }
            : {},
      });
    }

    function checkType(node: TSESTree.TypeNode): boolean {
      switch (node.type) {
        case AST_NODE_TYPES.TSAnyKeyword:
        case AST_NODE_TYPES.TSUnknownKeyword:
          return false;
        case AST_NODE_TYPES.TSTypeReference:
          return (
            // Ignore `as const` and `<const>`
            !isConst(node) ||
            // Allow qualified names which have dots between identifiers, `Foo.Bar`
            node.typeName.type === AST_NODE_TYPES.TSQualifiedName
          );

        default:
          return true;
      }
    }

    function checkExpression(
      node: TSESTree.TSTypeAssertion | TSESTree.TSAsExpression,
    ): void {
      if (
        options.assertionStyle === 'never' ||
        options.objectLiteralTypeAssertions === 'allow' ||
        node.expression.type !== AST_NODE_TYPES.ObjectExpression
      ) {
        return;
      }

      if (
        options.objectLiteralTypeAssertions === 'allow-as-parameter' &&
        node.parent &&
        (node.parent.type === AST_NODE_TYPES.NewExpression ||
          node.parent.type === AST_NODE_TYPES.CallExpression ||
          node.parent.type === AST_NODE_TYPES.ThrowStatement ||
          node.parent.type === AST_NODE_TYPES.AssignmentPattern)
      ) {
        return;
      }

      if (
        checkType(node.typeAnnotation) &&
        node.expression.type === AST_NODE_TYPES.ObjectExpression
      ) {
        context.report({
          node,
          messageId: 'unexpectedObjectTypeAssertion',
        });
      }
    }

    return {
      TSTypeAssertion(node): void {
        if (options.assertionStyle !== 'angle-bracket') {
          reportIncorrectAssertionType(node);
          return;
        }

        checkExpression(node);
      },
      TSAsExpression(node): void {
        if (options.assertionStyle !== 'as') {
          reportIncorrectAssertionType(node);
          return;
        }

        checkExpression(node);
      },
    };
  },
});
