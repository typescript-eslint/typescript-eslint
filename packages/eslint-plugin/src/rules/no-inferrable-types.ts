import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/util';
import * as util from '../util';

type Options = [
  {
    ignoreParameters?: boolean;
    ignoreProperties?: boolean;
  }
];
type MessageIds = 'noInferrableType';

export default util.createRule<Options, MessageIds>({
  name: 'no-inferrable-types',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallows explicit type declarations for variables or parameters initialized to a number, string, or boolean.',
      tslintRuleName: 'no-inferrable-types',
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
      ignoreParameters: true,
      ignoreProperties: true,
    },
  ],
  create(context, [{ ignoreParameters, ignoreProperties }]) {
    /**
     * Returns whether a node has an inferrable value or not
     * @param node the node to check
     * @param init the initializer
     */
    function isInferrable(
      node: TSESTree.TSTypeAnnotation,
      init: TSESTree.Expression,
    ): boolean {
      if (
        node.type !== AST_NODE_TYPES.TSTypeAnnotation ||
        !node.typeAnnotation
      ) {
        return false;
      }

      const annotation = node.typeAnnotation;

      if (annotation.type === AST_NODE_TYPES.TSStringKeyword) {
        if (init.type === AST_NODE_TYPES.Literal) {
          return typeof init.value === 'string';
        }
        return false;
      }

      if (annotation.type === AST_NODE_TYPES.TSBooleanKeyword) {
        return init.type === AST_NODE_TYPES.Literal;
      }

      if (annotation.type === AST_NODE_TYPES.TSNumberKeyword) {
        // Infinity is special
        if (
          (init.type === AST_NODE_TYPES.UnaryExpression &&
            init.operator === '-' &&
            init.argument.type === AST_NODE_TYPES.Identifier &&
            init.argument.name === 'Infinity') ||
          (init.type === AST_NODE_TYPES.Identifier && init.name === 'Infinity')
        ) {
          return true;
        }

        return (
          init.type === AST_NODE_TYPES.Literal && typeof init.value === 'number'
        );
      }

      return false;
    }

    /**
     * Reports an inferrable type declaration, if any
     * @param node the node being visited
     * @param typeNode the type annotation node
     * @param initNode the initializer node
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

      if (!isInferrable(typeNode, initNode)) {
        return;
      }

      let type = null;
      if (typeNode.typeAnnotation.type === AST_NODE_TYPES.TSBooleanKeyword) {
        type = 'boolean';
      } else if (
        typeNode.typeAnnotation.type === AST_NODE_TYPES.TSNumberKeyword
      ) {
        type = 'number';
      } else if (
        typeNode.typeAnnotation.type === AST_NODE_TYPES.TSStringKeyword
      ) {
        type = 'string';
      } else {
        // shouldn't happen...
        return;
      }

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
      if (ignoreProperties || node.readonly) {
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
