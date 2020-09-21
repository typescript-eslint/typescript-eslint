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
  VariableDeclarationIgnoreFunction = 'variableDeclarationIgnoreFunction',
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
      expectedTypedef: 'Expected a type annotation.',
      expectedTypedefNamed: 'Expected {{name}} to have a type annotation.',
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
          [OptionKeys.VariableDeclarationIgnoreFunction]: { type: 'boolean' },
        },
      },
    ],
    type: 'suggestion',
  },
  defaultOptions: [
    {
      [OptionKeys.ArrayDestructuring]: false,
      [OptionKeys.ArrowParameter]: false,
      [OptionKeys.MemberVariableDeclaration]: false,
      [OptionKeys.ObjectDestructuring]: false,
      [OptionKeys.Parameter]: false,
      [OptionKeys.PropertyDeclaration]: false,
      [OptionKeys.VariableDeclaration]: false,
      [OptionKeys.VariableDeclarationIgnoreFunction]: false,
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

    function isForOfStatementContext(
      node: TSESTree.ArrayPattern | TSESTree.ObjectPattern,
    ): boolean {
      let current: TSESTree.Node | undefined = node.parent;
      while (current) {
        switch (current.type) {
          case AST_NODE_TYPES.VariableDeclarator:
          case AST_NODE_TYPES.VariableDeclaration:
          case AST_NODE_TYPES.ObjectPattern:
          case AST_NODE_TYPES.ArrayPattern:
          case AST_NODE_TYPES.Property:
            current = current.parent;
            break;

          case AST_NODE_TYPES.ForOfStatement:
            return true;

          default:
            current = undefined;
        }
      }

      return false;
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

    function isVariableDeclarationIgnoreFunction(node: TSESTree.Node): boolean {
      return (
        !!options[OptionKeys.VariableDeclarationIgnoreFunction] &&
        (node.type === AST_NODE_TYPES.FunctionExpression ||
          node.type === AST_NODE_TYPES.ArrowFunctionExpression)
      );
    }

    return {
      ArrayPattern(node): void {
        if (
          node.parent?.type === AST_NODE_TYPES.RestElement &&
          node.parent.typeAnnotation
        ) {
          return;
        }
        if (
          options[OptionKeys.ArrayDestructuring] &&
          !node.typeAnnotation &&
          !isForOfStatementContext(node)
        ) {
          report(node);
        }
      },
      ArrowFunctionExpression(node): void {
        if (options[OptionKeys.ArrowParameter]) {
          checkParameters(node.params);
        }
      },
      ClassProperty(node): void {
        if (node.value && isVariableDeclarationIgnoreFunction(node.value)) {
          return;
        }

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
        if (
          options[OptionKeys.ObjectDestructuring] &&
          !node.typeAnnotation &&
          !isForOfStatementContext(node)
        ) {
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
            !options[OptionKeys.ObjectDestructuring]) ||
          (node.init && isVariableDeclarationIgnoreFunction(node.init))
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
