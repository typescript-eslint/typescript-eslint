import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import {
  createRule,
  getOperatorPrecedence,
  getOperatorPrecedenceForNode,
  getParserServices,
  getTextWithParentheses,
  isParenthesized,
} from '../util';
import { getWrappedCode } from '../util/getWrappedCode';

// intentionally mirroring the options
export type MessageIds =
  | 'angle-bracket'
  | 'as'
  | 'never'
  | 'replaceObjectTypeAssertionWithAnnotation'
  | 'replaceObjectTypeAssertionWithSatisfies'
  | 'unexpectedObjectTypeAssertion';
type OptUnion =
  | {
      assertionStyle: 'angle-bracket' | 'as';
      objectLiteralTypeAssertions?: 'allow' | 'allow-as-parameter' | 'never';
    }
  | {
      assertionStyle: 'never';
    };
export type Options = readonly [OptUnion];

export default createRule<Options, MessageIds>({
  create(context, [options]) {
    const parserServices = getParserServices(context, true);

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
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
    ): void {
      const messageId = options.assertionStyle;

      // If this node is `as const`, then don't report an error.
      if (isConst(node.typeAnnotation) && messageId === 'never') {
        return;
      }
      context.report({
        data:
          messageId !== 'never'
            ? { cast: context.sourceCode.getText(node.typeAnnotation) }
            : {},
        fix:
          messageId === 'as'
            ? (fixer): TSESLint.RuleFix => {
                const tsNode = parserServices.esTreeNodeToTSNodeMap.get(
                  node as TSESTree.TSTypeAssertion,
                );

                const expressionCode = context.sourceCode.getText(
                  node.expression,
                );
                const typeAnnotationCode = context.sourceCode.getText(
                  node.typeAnnotation,
                );

                const asPrecedence = getOperatorPrecedence(
                  ts.SyntaxKind.AsExpression,
                  ts.SyntaxKind.Unknown,
                );
                const parentPrecedence = getOperatorPrecedence(
                  tsNode.parent.kind,
                  ts.isBinaryExpression(tsNode.parent)
                    ? tsNode.parent.operatorToken.kind
                    : ts.SyntaxKind.Unknown,
                  ts.isNewExpression(tsNode.parent)
                    ? tsNode.parent.arguments != null &&
                        tsNode.parent.arguments.length > 0
                    : undefined,
                );

                const expressionPrecedence = getOperatorPrecedenceForNode(
                  node.expression,
                );

                const expressionCodeWrapped = getWrappedCode(
                  expressionCode,
                  expressionPrecedence,
                  asPrecedence,
                );

                const text = `${expressionCodeWrapped} as ${typeAnnotationCode}`;
                return fixer.replaceText(
                  node,
                  isParenthesized(node, context.sourceCode)
                    ? text
                    : getWrappedCode(text, asPrecedence, parentPrecedence),
                );
              }
            : undefined,
        messageId,
        node,
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
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
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
        (node.parent.type === AST_NODE_TYPES.NewExpression ||
          node.parent.type === AST_NODE_TYPES.CallExpression ||
          node.parent.type === AST_NODE_TYPES.ThrowStatement ||
          node.parent.type === AST_NODE_TYPES.AssignmentPattern ||
          node.parent.type === AST_NODE_TYPES.JSXExpressionContainer ||
          (node.parent.type === AST_NODE_TYPES.TemplateLiteral &&
            node.parent.parent.type ===
              AST_NODE_TYPES.TaggedTemplateExpression))
      ) {
        return;
      }

      if (checkType(node.typeAnnotation)) {
        const suggest: TSESLint.ReportSuggestionArray<MessageIds> = [];
        if (
          node.parent.type === AST_NODE_TYPES.VariableDeclarator &&
          !node.parent.id.typeAnnotation
        ) {
          const { parent } = node;
          suggest.push({
            data: { cast: context.sourceCode.getText(node.typeAnnotation) },
            fix: fixer => [
              fixer.insertTextAfter(
                parent.id,
                `: ${context.sourceCode.getText(node.typeAnnotation)}`,
              ),
              fixer.replaceText(
                node,
                getTextWithParentheses(context.sourceCode, node.expression),
              ),
            ],
            messageId: 'replaceObjectTypeAssertionWithAnnotation',
          });
        }
        suggest.push({
          data: { cast: context.sourceCode.getText(node.typeAnnotation) },
          fix: fixer => [
            fixer.replaceText(
              node,
              getTextWithParentheses(context.sourceCode, node.expression),
            ),
            fixer.insertTextAfter(
              node,
              ` satisfies ${context.sourceCode.getText(node.typeAnnotation)}`,
            ),
          ],
          messageId: 'replaceObjectTypeAssertionWithSatisfies',
        });

        context.report({
          messageId: 'unexpectedObjectTypeAssertion',
          node,
          suggest,
        });
      }
    }

    return {
      TSAsExpression(node): void {
        if (options.assertionStyle !== 'as') {
          reportIncorrectAssertionType(node);
          return;
        }

        checkExpression(node);
      },
      TSTypeAssertion(node): void {
        if (options.assertionStyle !== 'angle-bracket') {
          reportIncorrectAssertionType(node);
          return;
        }

        checkExpression(node);
      },
    };
  },
  defaultOptions: [
    {
      assertionStyle: 'as',
      objectLiteralTypeAssertions: 'allow',
    },
  ],
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce consistent usage of type assertions',
      recommended: 'stylistic',
    },
    fixable: 'code',
    hasSuggestions: true,
    messages: {
      'angle-bracket': "Use '<{{cast}}>' instead of 'as {{cast}}'.",
      as: "Use 'as {{cast}}' instead of '<{{cast}}>'.",
      never: 'Do not use any type assertions.',
      replaceObjectTypeAssertionWithAnnotation:
        'Use const x: {{cast}} = { ... } instead.',
      replaceObjectTypeAssertionWithSatisfies:
        'Use const x = { ... } satisfies {{cast}} instead.',
      unexpectedObjectTypeAssertion: 'Always prefer const x: T = { ... }.',
    },
    schema: [
      {
        oneOf: [
          {
            type: 'object',
            additionalProperties: false,
            properties: {
              assertionStyle: {
                type: 'string',
                enum: ['never'],
              },
            },
            required: ['assertionStyle'],
          },
          {
            type: 'object',
            additionalProperties: false,
            properties: {
              assertionStyle: {
                type: 'string',
                enum: ['as', 'angle-bracket'],
              },
              objectLiteralTypeAssertions: {
                type: 'string',
                enum: ['allow', 'allow-as-parameter', 'never'],
              },
            },
            required: ['assertionStyle'],
          },
        ],
      },
    ],
  },
  name: 'consistent-type-assertions',
});
