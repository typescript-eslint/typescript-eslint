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
        let annotationNode: TSESTree.Node | undefined;

        switch (param.type) {
          case AST_NODE_TYPES.AssignmentPattern:
            annotationNode = param.left;
            break;
          case AST_NODE_TYPES.TSParameterProperty:
            annotationNode = param.parameter;

            // Check TS parameter property with default value like `constructor(private param: string = 'something') {}`
            if (
              annotationNode &&
              annotationNode.type === AST_NODE_TYPES.AssignmentPattern
            ) {
              annotationNode = annotationNode.left;
            }

            break;
          default:
            annotationNode = param;
            break;
        }

        if (annotationNode !== undefined && !annotationNode.typeAnnotation) {
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
          !options[OptionKeys.VariableDeclaration] ||
          node.id.typeAnnotation ||
          (node.id.type === AST_NODE_TYPES.ArrayPattern &&
            !options[OptionKeys.ArrayDestructuring]) ||
          (node.id.type === AST_NODE_TYPES.ObjectPattern &&
            !options[OptionKeys.ObjectDestructuring])
        ) {
          return;
        }

        let current: TSESTree.Node | undefined = node.parent;
        while (current) {
          switch (current.type) {
            case AST_NODE_TYPES.VariableDeclaration:
              // Keep looking upwards
              current = current.parent;
              break;
            case AST_NODE_TYPES.ForOfStatement:
            case AST_NODE_TYPES.ForInStatement:
              // Stop traversing and don't report an error
              return;
            default:
              // Stop traversing
              current = undefined;
              break;
          }
        }

        report(node, getNodeName(node.id));
      },
    };
  },
});
