import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule, nullThrows, NullThrowsReasons } from '../util';
import { isInferrable } from '../util/isInferrable';

export type Options = [
  {
    ignoreParameters?: boolean;
    ignoreProperties?: boolean;
  },
];
export type MessageIds = 'noInferrableType';

export default createRule<Options, MessageIds>({
  name: 'no-inferrable-types',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow explicit type declarations for variables or parameters initialized to a number, string, or boolean',
      recommended: 'stylistic',
    },
    fixable: 'code',
    messages: {
      noInferrableType:
        'Type {{type}} trivially inferred from a {{type}} literal, remove type annotation.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          ignoreParameters: {
            type: 'boolean',
            description: 'Whether to ignore function parameters.',
          },
          ignoreProperties: {
            type: 'boolean',
            description: 'Whether to ignore class properties.',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      ignoreParameters: false,
      ignoreProperties: false,
    },
  ],
  create(context, [{ ignoreParameters, ignoreProperties }]) {
    const keywordMap = {
      [AST_NODE_TYPES.TSBigIntKeyword]: 'bigint',
      [AST_NODE_TYPES.TSBooleanKeyword]: 'boolean',
      [AST_NODE_TYPES.TSNullKeyword]: 'null',
      [AST_NODE_TYPES.TSNumberKeyword]: 'number',
      [AST_NODE_TYPES.TSStringKeyword]: 'string',
      [AST_NODE_TYPES.TSSymbolKeyword]: 'symbol',
      [AST_NODE_TYPES.TSUndefinedKeyword]: 'undefined',
    };

    /**
     * Reports an inferrable type declaration, if any
     */
    function reportInferrableType(
      node:
        | TSESTree.AccessorProperty
        | TSESTree.Parameter
        | TSESTree.PropertyDefinition
        | TSESTree.VariableDeclarator,
      typeNode: TSESTree.TSTypeAnnotation | undefined,
      initNode: TSESTree.Expression | null | undefined,
    ): void {
      if (!typeNode || !initNode) {
        return;
      }

      if (!isInferrable(typeNode.typeAnnotation, initNode)) {
        return;
      }

      const type =
        typeNode.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference
          ? // TODO - if we add more references
            'RegExp'
          : keywordMap[typeNode.typeAnnotation.type];

      context.report({
        node,
        messageId: 'noInferrableType',
        data: {
          type,
        },
        *fix(fixer) {
          if (
            (node.type === AST_NODE_TYPES.AssignmentPattern &&
              node.left.optional) ||
            (node.type === AST_NODE_TYPES.PropertyDefinition && node.definite)
          ) {
            yield fixer.remove(
              nullThrows(
                context.sourceCode.getTokenBefore(typeNode),
                NullThrowsReasons.MissingToken('token before', 'type node'),
              ),
            );
          }
          yield fixer.remove(typeNode);
        },
      });
    }

    function inferrableVariableVisitor(
      node: TSESTree.VariableDeclarator,
    ): void {
      reportInferrableType(node, node.id.typeAnnotation, node.init);
    }

    function inferrableParameterVisitor(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression,
    ): void {
      if (ignoreParameters) {
        return;
      }

      node.params.forEach(param => {
        if (param.type === AST_NODE_TYPES.TSParameterProperty) {
          param = param.parameter;
        }

        if (param.type === AST_NODE_TYPES.AssignmentPattern) {
          reportInferrableType(param, param.left.typeAnnotation, param.right);
        }
      });
    }

    function inferrablePropertyVisitor(
      node: TSESTree.AccessorProperty | TSESTree.PropertyDefinition,
    ): void {
      // We ignore `readonly` because of Microsoft/TypeScript#14416
      // Essentially a readonly property without a type
      // will result in its value being the type, leading to
      // compile errors if the type is stripped.
      if (ignoreProperties || node.readonly || node.optional) {
        return;
      }
      reportInferrableType(node, node.typeAnnotation, node.value);
    }

    return {
      AccessorProperty: inferrablePropertyVisitor,
      ArrowFunctionExpression: inferrableParameterVisitor,
      FunctionDeclaration: inferrableParameterVisitor,
      FunctionExpression: inferrableParameterVisitor,
      PropertyDefinition: inferrablePropertyVisitor,
      VariableDeclarator: inferrableVariableVisitor,
    };
  },
});
