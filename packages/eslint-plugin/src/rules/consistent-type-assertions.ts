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
  | 'replaceArrayTypeAssertionWithAnnotation'
  | 'replaceArrayTypeAssertionWithSatisfies'
  | 'replaceObjectTypeAssertionWithAnnotation'
  | 'replaceObjectTypeAssertionWithSatisfies'
  | 'unexpectedArrayTypeAssertion'
  | 'unexpectedObjectTypeAssertion';
type OptUnion =
  | {
      assertionStyle: 'angle-bracket' | 'as';
      objectLiteralTypeAssertions?: 'allow' | 'allow-as-parameter' | 'never';
      arrayLiteralTypeAssertions?: 'allow' | 'allow-as-parameter' | 'never';
    }
  | {
      assertionStyle: 'never';
    };
export type Options = readonly [OptUnion];

type AsExpressionOrTypeAssertion =
  | TSESTree.TSAsExpression
  | TSESTree.TSTypeAssertion;

export default createRule<Options, MessageIds>({
  name: 'consistent-type-assertions',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      recommended: 'stylistic',
      description: 'Enforce consistent usage of type assertions',
    },
    hasSuggestions: true,
    messages: {
      'angle-bracket': "Use '<{{cast}}>' instead of 'as {{cast}}'.",
      as: "Use 'as {{cast}}' instead of '<{{cast}}>'.",
      never: 'Do not use any type assertions.',
      replaceArrayTypeAssertionWithAnnotation:
        'Use const x: {{cast}} = [ ... ] instead.',
      replaceArrayTypeAssertionWithSatisfies:
        'Use const x = [ ... ] satisfies {{cast}} instead.',
      replaceObjectTypeAssertionWithAnnotation:
        'Use const x: {{cast}} = { ... } instead.',
      replaceObjectTypeAssertionWithSatisfies:
        'Use const x = { ... } satisfies {{cast}} instead.',
      unexpectedArrayTypeAssertion: 'Always prefer const x: T[] = [ ... ].',
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
                description: 'The expected assertion style to enforce.',
                enum: ['never'],
              },
            },
            required: ['assertionStyle'],
          },
          {
            type: 'object',
            additionalProperties: false,
            properties: {
              arrayLiteralTypeAssertions: {
                type: 'string',
                description:
                  'Whether to always prefer type declarations for array literals used as variable initializers, rather than type assertions.',
                enum: ['allow', 'allow-as-parameter', 'never'],
              },
              assertionStyle: {
                type: 'string',
                description: 'The expected assertion style to enforce.',
                enum: ['as', 'angle-bracket'],
              },
              objectLiteralTypeAssertions: {
                type: 'string',
                description:
                  'Whether to always prefer type declarations for object literals used as variable initializers, rather than type assertions.',
                enum: ['allow', 'allow-as-parameter', 'never'],
              },
            },
          },
        ],
      },
    ],
  },
  defaultOptions: [
    {
      arrayLiteralTypeAssertions: 'allow',
      assertionStyle: 'as',
      objectLiteralTypeAssertions: 'allow',
    },
  ],
  create(context, [options]) {
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
      node: AsExpressionOrTypeAssertion,
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
            ? { cast: context.sourceCode.getText(node.typeAnnotation) }
            : {},
        fix:
          messageId === 'as'
            ? (fixer): TSESLint.RuleFix => {
                // lazily access parserServices to avoid crashing on non TS files (#9860)
                const tsNode = getParserServices(
                  context,
                  true,
                ).esTreeNodeToTSNodeMap.get(node as TSESTree.TSTypeAssertion);

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

    function getSuggestions(
      node: AsExpressionOrTypeAssertion,
      annotationMessageId: MessageIds,
      satisfiesMessageId: MessageIds,
    ): TSESLint.ReportSuggestionArray<MessageIds> {
      const suggestions: TSESLint.ReportSuggestionArray<MessageIds> = [];
      if (
        node.parent.type === AST_NODE_TYPES.VariableDeclarator &&
        !node.parent.id.typeAnnotation
      ) {
        const { parent } = node;
        suggestions.push({
          messageId: annotationMessageId,
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
        });
      }
      suggestions.push({
        messageId: satisfiesMessageId,
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
      });
      return suggestions;
    }

    function isAsParameter(node: AsExpressionOrTypeAssertion): boolean {
      return (
        node.parent.type === AST_NODE_TYPES.NewExpression ||
        node.parent.type === AST_NODE_TYPES.CallExpression ||
        node.parent.type === AST_NODE_TYPES.ThrowStatement ||
        node.parent.type === AST_NODE_TYPES.AssignmentPattern ||
        node.parent.type === AST_NODE_TYPES.JSXExpressionContainer ||
        (node.parent.type === AST_NODE_TYPES.TemplateLiteral &&
          node.parent.parent.type === AST_NODE_TYPES.TaggedTemplateExpression)
      );
    }

    function checkExpressionForObjectAssertion(
      node: AsExpressionOrTypeAssertion,
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
        isAsParameter(node)
      ) {
        return;
      }

      if (checkType(node.typeAnnotation)) {
        const suggest = getSuggestions(
          node,
          'replaceObjectTypeAssertionWithAnnotation',
          'replaceObjectTypeAssertionWithSatisfies',
        );

        context.report({
          node,
          messageId: 'unexpectedObjectTypeAssertion',
          suggest,
        });
      }
    }

    function checkExpressionForArrayAssertion(
      node: AsExpressionOrTypeAssertion,
    ): void {
      if (
        options.assertionStyle === 'never' ||
        options.arrayLiteralTypeAssertions === 'allow' ||
        node.expression.type !== AST_NODE_TYPES.ArrayExpression
      ) {
        return;
      }

      if (
        options.arrayLiteralTypeAssertions === 'allow-as-parameter' &&
        isAsParameter(node)
      ) {
        return;
      }

      if (checkType(node.typeAnnotation)) {
        const suggest = getSuggestions(
          node,
          'replaceArrayTypeAssertionWithAnnotation',
          'replaceArrayTypeAssertionWithSatisfies',
        );

        context.report({
          node,
          messageId: 'unexpectedArrayTypeAssertion',
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

        checkExpressionForObjectAssertion(node);
        checkExpressionForArrayAssertion(node);
      },
      TSTypeAssertion(node): void {
        if (options.assertionStyle !== 'angle-bracket') {
          reportIncorrectAssertionType(node);
          return;
        }

        checkExpressionForObjectAssertion(node);
        checkExpressionForArrayAssertion(node);
      },
    };
  },
});
