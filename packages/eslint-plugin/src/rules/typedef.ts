import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import * as ts from 'typescript';
import * as util from '../util';

const enum OptionKeys {
  ArrayDestructuring = 'arrayDestructuring',
  ArrowCallSignature = 'arrowCallSignature',
  ArrowParameter = 'arrowParameter',
  CallSignature = 'callSignature',
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
          [OptionKeys.ArrowCallSignature]: { type: 'boolean' },
          [OptionKeys.ArrowParameter]: { type: 'boolean' },
          [OptionKeys.CallSignature]: { type: 'boolean' },
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
      [OptionKeys.ArrowCallSignature]: true,
      [OptionKeys.ArrowParameter]: true,
      [OptionKeys.CallSignature]: true,
      [OptionKeys.MemberVariableDeclaration]: true,
      [OptionKeys.Parameter]: true,
      [OptionKeys.PropertyDeclaration]: true,
    },
  ],
  create(context, [options]) {
    const parserServices = util.getParserServices(context);

    function report(location: TSESTree.Node, name?: string) {
      context.report({
        node: location,
        messageId: name ? 'expectedTypedefNamed' : 'expectedTypedef',
        data: { name },
      });
    }

    function getEsNodeName(esNode: TSESTree.Parameter | TSESTree.PropertyName) {
      return esNode.type === AST_NODE_TYPES.Identifier
        ? esNode.name
        : undefined;
    }

    function getTsNodeName(tsNode: ts.FunctionLike | ts.Identifier) {
      if (ts.isIdentifier(tsNode)) {
        return tsNode.text;
      }

      if (tsNode.name && ts.isIdentifier(tsNode.name)) {
        return tsNode.name.text;
      }

      return undefined;
    }

    function isTypedParameterDeclaration(esNode: TSESTree.Parameter) {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(esNode)
        .parent as ts.ParameterDeclaration;

      return tsNode.type !== undefined;
    }

    function isTypedPropertyDeclaration(esNode: TSESTree.Node) {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(esNode);

      return ts.isPropertyDeclaration(tsNode) && tsNode.type !== undefined;
    }

    function isTypedVariableDeclaration(esNode: TSESTree.Node) {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(esNode) as
        | ts.FunctionLike
        | ts.VariableDeclaration;

      return tsNode.type !== undefined;
    }

    function visitCallSignature(
      node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression,
    ) {
      if (
        node.parent &&
        node.parent.type === AST_NODE_TYPES.Property &&
        node.parent.kind === 'set'
      ) {
        return;
      }

      const tsNode = parserServices.esTreeNodeToTSNodeMap.get<
        ts.FunctionDeclaration | ts.FunctionExpression
      >(node);

      if (!tsNode.type) {
        report(node, getTsNodeName(tsNode));
      }
    }

    return {
      ArrayPattern(node) {
        if (!options[OptionKeys.ArrayDestructuring]) {
          return;
        }

        const parent = node.parent;
        if (!parent || isTypedVariableDeclaration(parent)) {
          return;
        }

        report(node);
      },
      ArrowFunctionExpression(node) {
        if (options[OptionKeys.ArrowCallSignature]) {
          const parent = node.parent!;
          if (
            parent.type !== AST_NODE_TYPES.CallExpression &&
            !isTypedPropertyDeclaration(parent)
          ) {
            report(node);
          }
        }

        if (options[OptionKeys.ArrowParameter]) {
          for (const param of node.params) {
            if (!isTypedParameterDeclaration(param)) {
              report(param, getEsNodeName(param));
            }
          }
        }
      },
      ClassProperty(node) {
        if (!options[OptionKeys.MemberVariableDeclaration]) {
          return;
        }

        const tsNode = parserServices.esTreeNodeToTSNodeMap.get<
          ts.PropertyDeclaration
        >(node);
        if (tsNode.type !== undefined) {
          return;
        }

        report(
          node,
          node.key.type === AST_NODE_TYPES.Identifier
            ? node.key.name
            : undefined,
        );
      },
      'FunctionDeclaration, FunctionExpression'(
        node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression,
      ) {
        if (options[OptionKeys.CallSignature]) {
          visitCallSignature(node);
        }

        if (options[OptionKeys.Parameter]) {
          for (const param of node.params) {
            if (!isTypedParameterDeclaration(param)) {
              report(param, getEsNodeName(param));
            }
          }
        }
      },
      ObjectPattern(node) {
        if (!options[OptionKeys.ObjectDestructuring]) {
          return;
        }

        const parent = node.parent;
        if (!parent || isTypedVariableDeclaration(parent)) {
          return;
        }

        report(node);
      },
      'TSIndexSignature, TSPropertySignature'(
        node: TSESTree.TSIndexSignature | TSESTree.TSPropertySignature,
      ) {
        if (!options[OptionKeys.PropertyDeclaration] || node.typeAnnotation) {
          return;
        }

        report(
          node,
          node.type === AST_NODE_TYPES.TSPropertySignature
            ? getEsNodeName(node.key)
            : undefined,
        );
      },
      VariableDeclarator(node) {
        if (
          !options[OptionKeys.VariableDeclaration] ||
          node.id.typeAnnotation
        ) {
          return;
        }

        report(node, getEsNodeName(node.id));
      },
    };
  },
});
