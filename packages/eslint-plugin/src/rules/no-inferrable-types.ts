import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type Options = [
  {
    ignoreParameters?: boolean;
    ignoreProperties?: boolean;
  },
];
type MessageIds = 'noInferrableType';

export default util.createRule<Options, MessageIds>({
  name: 'no-inferrable-types',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallows explicit type declarations for variables or parameters initialized to a number, string, or boolean',
      category: 'Best Practices',
      recommended: 'error',
    },
    fixable: 'code',
    messages: {
      noInferrableType:
        'Type {{type}} trivially inferred from a {{type}} literal, remove type annotation.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreParameters: {
            type: 'boolean',
          },
          ignoreProperties: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
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
      if (init.type === AST_NODE_TYPES.ChainExpression) {
        return isFunctionCall(init.expression, callName);
      }

      return (
        init.type === AST_NODE_TYPES.CallExpression &&
        init.callee.type === AST_NODE_TYPES.Identifier &&
        init.callee.name === callName
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
      | TSESTree.TSNumberKeyword
      | TSESTree.TSNullKeyword
      | TSESTree.TSStringKeyword
      | TSESTree.TSSymbolKeyword
      | TSESTree.TSUndefinedKeyword
      | TSESTree.TSTypeReference;
    const keywordMap = {
      [AST_NODE_TYPES.TSBigIntKeyword]: 'bigint',
      [AST_NODE_TYPES.TSBooleanKeyword]: 'boolean',
      [AST_NODE_TYPES.TSNumberKeyword]: 'number',
      [AST_NODE_TYPES.TSNullKeyword]: 'null',
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
            (unwrappedInit.type === AST_NODE_TYPES.Literal &&
              'bigint' in unwrappedInit)
          );
        }

        case AST_NODE_TYPES.TSBooleanKeyword:
          return (
            hasUnaryPrefix(init, '!') ||
            // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
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
          return init.type === AST_NODE_TYPES.Literal && init.value === null;

        case AST_NODE_TYPES.TSStringKeyword:
          return (
            // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
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
        | TSESTree.VariableDeclarator
        | TSESTree.Parameter
        | TSESTree.ClassProperty,
      typeNode: TSESTree.TSTypeAnnotation | undefined,
      initNode: TSESTree.Expression | null | undefined,
    ): void {
      if (!typeNode || !initNode || !typeNode.typeAnnotation) {
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
        fix: fixer => fixer.remove(typeNode),
      });
    }

    function inferrableVariableVisitor(
      node: TSESTree.VariableDeclarator,
    ): void {
      if (!node.id) {
        return;
      }
      reportInferrableType(node, node.id.typeAnnotation, node.init);
    }

    function inferrableParameterVisitor(
      node:
        | TSESTree.FunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.ArrowFunctionExpression,
    ): void {
      if (ignoreParameters || !node.params) {
        return;
      }
      (node.params.filter(
        param =>
          param.type === AST_NODE_TYPES.AssignmentPattern &&
          param.left &&
          param.right,
      ) as TSESTree.AssignmentPattern[]).forEach(param => {
        reportInferrableType(param, param.left.typeAnnotation, param.right);
      });
    }

    function inferrablePropertyVisitor(node: TSESTree.ClassProperty): void {
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
      VariableDeclarator: inferrableVariableVisitor,
      FunctionExpression: inferrableParameterVisitor,
      FunctionDeclaration: inferrableParameterVisitor,
      ArrowFunctionExpression: inferrableParameterVisitor,
      ClassProperty: inferrablePropertyVisitor,
    };
  },
});
