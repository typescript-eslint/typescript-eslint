/* eslint-disable @typescript-eslint/internal/prefer-ast-types-enum */
import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import {
  createRule,
  nullThrows,
  NullThrowsReasons,
  skipChainExpression,
} from '../util';

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
    function isFunctionCall(
      init: TSESTree.Expression,
      callName: string,
    ): boolean {
      const node = skipChainExpression(init);

      return (
        node.type === AST_NODE_TYPES.CallExpression &&
        node.callee.type === AST_NODE_TYPES.Identifier &&
        node.callee.name === callName
      );
    }
    function isLiteral(init: TSESTree.Expression, typeName: string): boolean {
      return (
        init.type === AST_NODE_TYPES.Literal && typeof init.value === typeName
      );
    }
    function isIdentifier(
      init: TSESTree.Expression,
      ...names: string[]
    ): boolean {
      return (
        init.type === AST_NODE_TYPES.Identifier && names.includes(init.name)
      );
    }
    function hasUnaryPrefix(
      init: TSESTree.Expression,
      ...operators: string[]
    ): init is TSESTree.UnaryExpression {
      return (
        init.type === AST_NODE_TYPES.UnaryExpression &&
        operators.includes(init.operator)
      );
    }

    type Keywords =
      | TSESTree.TSBigIntKeyword
      | TSESTree.TSBooleanKeyword
      | TSESTree.TSNullKeyword
      | TSESTree.TSNumberKeyword
      | TSESTree.TSStringKeyword
      | TSESTree.TSSymbolKeyword
      | TSESTree.TSTypeReference
      | TSESTree.TSUndefinedKeyword;
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
     * Returns whether a node has an inferrable value or not
     */
    function isInferrable(
      annotation: TSESTree.TypeNode,
      init: TSESTree.Expression,
    ): annotation is Keywords {
      switch (annotation.type) {
        case AST_NODE_TYPES.TSBigIntKeyword: {
          // note that bigint cannot have + prefixed to it
          const unwrappedInit = hasUnaryPrefix(init, '-')
            ? init.argument
            : init;

          return (
            isFunctionCall(unwrappedInit, 'BigInt') ||
            unwrappedInit.type === AST_NODE_TYPES.Literal
          );
        }

        case AST_NODE_TYPES.TSBooleanKeyword:
          return (
            hasUnaryPrefix(init, '!') ||
            isFunctionCall(init, 'Boolean') ||
            isLiteral(init, 'boolean')
          );

        case AST_NODE_TYPES.TSNumberKeyword: {
          const unwrappedInit = hasUnaryPrefix(init, '+', '-')
            ? init.argument
            : init;

          return (
            isIdentifier(unwrappedInit, 'Infinity', 'NaN') ||
            isFunctionCall(unwrappedInit, 'Number') ||
            isLiteral(unwrappedInit, 'number')
          );
        }

        case AST_NODE_TYPES.TSNullKeyword:
          return init.type === AST_NODE_TYPES.Literal && init.value == null;

        case AST_NODE_TYPES.TSStringKeyword:
          return (
            isFunctionCall(init, 'String') ||
            isLiteral(init, 'string') ||
            init.type === AST_NODE_TYPES.TemplateLiteral
          );

        case AST_NODE_TYPES.TSSymbolKeyword:
          return isFunctionCall(init, 'Symbol');

        case AST_NODE_TYPES.TSTypeReference: {
          if (
            annotation.typeName.type === AST_NODE_TYPES.Identifier &&
            annotation.typeName.name === 'RegExp'
          ) {
            const isRegExpLiteral =
              init.type === AST_NODE_TYPES.Literal &&
              init.value instanceof RegExp;
            const isRegExpNewCall =
              init.type === AST_NODE_TYPES.NewExpression &&
              init.callee.type === AST_NODE_TYPES.Identifier &&
              init.callee.name === 'RegExp';
            const isRegExpCall = isFunctionCall(init, 'RegExp');

            return isRegExpLiteral || isRegExpCall || isRegExpNewCall;
          }

          return false;
        }

        case AST_NODE_TYPES.TSUndefinedKeyword:
          return (
            hasUnaryPrefix(init, 'void') || isIdentifier(init, 'undefined')
          );
      }

      return false;
    }

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
