import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';

// intentionally mirroring the options
type MessageIds =
  | 'as'
  | 'angle-bracket'
  | 'never'
  | 'unexpectedObjectTypeAssertion'
  | 'unexpectedArrayTypeAssertion'
  | 'replaceObjectTypeAssertionWithAnnotation'
  | 'replaceObjectTypeAssertionWithSatisfies'
  | 'replaceArrayTypeAssertionWithAnnotation'
  | 'replaceArrayTypeAssertionWithSatisfies';
type OptUnion =
  | {
      assertionStyle: 'as' | 'angle-bracket';
      objectLiteralTypeAssertions?: 'allow' | 'allow-as-parameter' | 'never';
      arrayLiteralTypeAssertions?: 'allow' | 'never';
    }
  | {
      assertionStyle: 'never';
    };
type Options = [OptUnion];

export default util.createRule<Options, MessageIds>({
  name: 'consistent-type-assertions',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    hasSuggestions: true,
    docs: {
      description: 'Enforce consistent usage of type assertions',
      recommended: 'strict',
    },
    messages: {
      as: "Use 'as {{cast}}' instead of '<{{cast}}>'.",
      'angle-bracket': "Use '<{{cast}}>' instead of 'as {{cast}}'.",
      never: 'Do not use any type assertions.',
      unexpectedObjectTypeAssertion: 'Always prefer const x: T = { ... }.',
      unexpectedArrayTypeAssertion: 'Always prefer const x: T[] = [ ... ].',
      replaceObjectTypeAssertionWithAnnotation:
        'Use const x: {{cast}} = { ... } instead.',
      replaceObjectTypeAssertionWithSatisfies:
        'Use const x = { ... } satisfies {{cast}} instead.',
      replaceArrayTypeAssertionWithAnnotation:
        'Use const x: [{cast}] = [ ... ] instead.',
      replaceArrayTypeAssertionWithSatisfies:
        'Use const x = [ ... ] satisfies [{cast}] instead.',
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
              arrayLiteralTypeAssertions: {
                enum: ['allow', 'never'],
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
      arrayLiteralTypeAssertions: 'allow',
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

    function getTextWithParentheses(node: TSESTree.Node): string {
      // Capture parentheses before and after the node
      let beforeCount = 0;
      let afterCount = 0;

      if (util.isParenthesized(node, sourceCode)) {
        const bodyOpeningParen = sourceCode.getTokenBefore(
          node,
          util.isOpeningParenToken,
        )!;
        const bodyClosingParen = sourceCode.getTokenAfter(
          node,
          util.isClosingParenToken,
        )!;

        beforeCount = node.range[0] - bodyOpeningParen.range[0];
        afterCount = bodyClosingParen.range[1] - node.range[1];
      }

      return sourceCode.getText(node, beforeCount, afterCount);
    }

    function reportIncorrectAssertionType(
      node: TSESTree.TSTypeAssertion | TSESTree.TSAsExpression,
    ): void {
      const messageId = options.assertionStyle;

      // If this node is `as const`, then don't report an error.
      if (isConst(node.typeAnnotation) && messageId === 'never') {
        return;
      }

      context.report({
        node,
        messageId,
        data:
          messageId !== 'never'
            ? { cast: sourceCode.getText(node.typeAnnotation) }
            : {},
        fix:
          messageId === 'as'
            ? (fixer): TSESLint.RuleFix[] => [
                fixer.replaceText(
                  node,
                  getTextWithParentheses(node.expression),
                ),
                fixer.insertTextAfter(
                  node,
                  ` as ${getTextWithParentheses(node.typeAnnotation)}`,
                ),
              ]
            : undefined,
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

    function checkExpressionForObjectAssertion(
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
          node.parent.type === AST_NODE_TYPES.AssignmentPattern ||
          node.parent.type === AST_NODE_TYPES.JSXExpressionContainer)
      ) {
        return;
      }

      if (
        checkType(node.typeAnnotation) &&
        node.expression.type === AST_NODE_TYPES.ObjectExpression
      ) {
        const suggest: TSESLint.ReportSuggestionArray<MessageIds> = [];
        if (
          node.parent?.type === AST_NODE_TYPES.VariableDeclarator &&
          !node.parent.id.typeAnnotation
        ) {
          const { parent } = node;
          suggest.push({
            messageId: 'replaceObjectTypeAssertionWithAnnotation',
            data: { cast: sourceCode.getText(node.typeAnnotation) },
            fix: fixer => [
              fixer.insertTextAfter(
                parent.id,
                `: ${sourceCode.getText(node.typeAnnotation)}`,
              ),
              fixer.replaceText(node, getTextWithParentheses(node.expression)),
            ],
          });
        }
        suggest.push({
          messageId: 'replaceObjectTypeAssertionWithSatisfies',
          data: { cast: sourceCode.getText(node.typeAnnotation) },
          fix: fixer => [
            fixer.replaceText(node, getTextWithParentheses(node.expression)),
            fixer.insertTextAfter(
              node,
              ` satisfies ${context
                .getSourceCode()
                .getText(node.typeAnnotation)}`,
            ),
          ],
        });

        context.report({
          node,
          messageId: 'unexpectedObjectTypeAssertion',
          suggest,
        });
      }
    }

    function checkExpressionForArrayAssertion(
      node: TSESTree.TSTypeAssertion | TSESTree.TSAsExpression,
    ): void {
      if (
        options.assertionStyle === 'never' ||
        options.arrayLiteralTypeAssertions === 'allow' ||
        node.expression.type !== AST_NODE_TYPES.ArrayExpression
      ) {
        return;
      }

      if (
        checkType(node.typeAnnotation) &&
        node.expression.type === AST_NODE_TYPES.ArrayExpression
      ) {
        const suggest: TSESLint.ReportSuggestionArray<MessageIds> = [];
        if (
          node.parent?.type === AST_NODE_TYPES.VariableDeclarator &&
          !node.parent.id.typeAnnotation
        ) {
          const { parent } = node;
          suggest.push({
            messageId: 'replaceArrayTypeAssertionWithAnnotation',
            data: { cast: sourceCode.getText(node.typeAnnotation) },
            fix: fixer => [
              fixer.insertTextAfter(
                parent.id,
                `: ${sourceCode.getText(node.typeAnnotation)}`,
              ),
              fixer.replaceText(node, getTextWithParentheses(node.expression)),
            ],
          });
        }
        suggest.push({
          messageId: 'replaceArrayTypeAssertionWithAnnotation',
          data: { cast: sourceCode.getText(node.typeAnnotation) },
          fix: fixer => [
            fixer.replaceText(node, getTextWithParentheses(node.expression)),
            fixer.insertTextAfter(
              node,
              ` satisfies ${context
                .getSourceCode()
                .getText(node.typeAnnotation)}`,
            ),
          ],
        });

        context.report({
          node,
          messageId: 'unexpectedArrayTypeAssertion',
          suggest,
        });
      }
    }

    return {
      TSTypeAssertion(node): void {
        if (options.assertionStyle !== 'angle-bracket') {
          reportIncorrectAssertionType(node);
          return;
        }

        checkExpressionForObjectAssertion(node);
        checkExpressionForArrayAssertion(node);
      },
      TSAsExpression(node): void {
        if (options.assertionStyle !== 'as') {
          reportIncorrectAssertionType(node);
          return;
        }

        checkExpressionForObjectAssertion(node);
        checkExpressionForArrayAssertion(node);
      },
    };
  },
});
