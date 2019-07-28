import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

const enum OptionKeys {
  ArrayDestructuring = 'arrayDestructuring',
  ArrowParameter = 'arrowParameter',
  MemberVariableDeclaration = 'memberVariableDeclaration',
  ObjectDestructuring = 'objectDestructuring',
  Parameter = 'parameter',
  PropertyDeclaration = 'propertyDeclaration',
  VariableDeclaration = 'variableDeclaration',
}

type Options = { [k in OptionKeys]?: boolean };

type MessageIds = 'expectedTypedef' | 'expectedTypedefNamed';

export default util.createRule<[Options], MessageIds>({
  name: 'typedef',
  meta: {
    docs: {
      description: 'Requires type annotations to exist',
      category: 'Stylistic Issues',
      recommended: false,
    },
    messages: {
      expectedTypedef: 'expected a type annotation',
      expectedTypedefNamed: 'expected {{name}} to have a type annotation',
    },
    schema: [
      {
        type: 'object',
        properties: {
          [OptionKeys.ArrayDestructuring]: { type: 'boolean' },
          [OptionKeys.ArrowParameter]: { type: 'boolean' },
          [OptionKeys.MemberVariableDeclaration]: { type: 'boolean' },
          [OptionKeys.ObjectDestructuring]: { type: 'boolean' },
          [OptionKeys.Parameter]: { type: 'boolean' },
          [OptionKeys.PropertyDeclaration]: { type: 'boolean' },
          [OptionKeys.VariableDeclaration]: { type: 'boolean' },
        },
      },
    ],
    type: 'suggestion',
  },
  defaultOptions: [
    {
      [OptionKeys.ArrowParameter]: true,
      [OptionKeys.MemberVariableDeclaration]: true,
      [OptionKeys.Parameter]: true,
      [OptionKeys.PropertyDeclaration]: true,
    },
  ],
  create(context, [options]) {
    function report(location: TSESTree.Node, name?: string): void {
      context.report({
        node: location,
        messageId: name ? 'expectedTypedefNamed' : 'expectedTypedef',
        data: { name },
      });
    }

    function getNodeName(
      node: TSESTree.Parameter | TSESTree.PropertyName,
    ): string | undefined {
      return node.type === AST_NODE_TYPES.Identifier ? node.name : undefined;
    }

    function checkParameters(params: TSESTree.Parameter[]): void {
      for (const param of params) {
        if (
          param.type !== AST_NODE_TYPES.TSParameterProperty &&
          !param.typeAnnotation
        ) {
          report(param, getNodeName(param));
        }
      }
    }

    return {
      ArrayPattern(node): void {
        if (options[OptionKeys.ArrayDestructuring] && !node.typeAnnotation) {
          report(node);
        }
      },
      ArrowFunctionExpression(node): void {
        if (options[OptionKeys.ArrowParameter]) {
          checkParameters(node.params);
        }
      },
      ClassProperty(node): void {
        if (
          options[OptionKeys.MemberVariableDeclaration] &&
          !node.typeAnnotation
        ) {
          report(
            node,
            node.key.type === AST_NODE_TYPES.Identifier
              ? node.key.name
              : undefined,
          );
        }
      },
      'FunctionDeclaration, FunctionExpression'(
        node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression,
      ): void {
        if (options[OptionKeys.Parameter]) {
          checkParameters(node.params);
        }
      },
      ObjectPattern(node): void {
        if (options[OptionKeys.ObjectDestructuring] && !node.typeAnnotation) {
          report(node);
        }
      },
      'TSIndexSignature, TSPropertySignature'(
        node: TSESTree.TSIndexSignature | TSESTree.TSPropertySignature,
      ): void {
        if (options[OptionKeys.PropertyDeclaration] && !node.typeAnnotation) {
          report(
            node,
            node.type === AST_NODE_TYPES.TSPropertySignature
              ? getNodeName(node.key)
              : undefined,
          );
        }
      },
      VariableDeclarator(node): void {
        if (
          options[OptionKeys.VariableDeclaration] &&
          !node.id.typeAnnotation
        ) {
          report(node, getNodeName(node.id));
        }
      },
    };
  },
});
