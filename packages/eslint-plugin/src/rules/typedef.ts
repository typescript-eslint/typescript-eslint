import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import * as ts from 'typescript';
import * as util from '../util';

interface Options {
  arrayDestructuring?: boolean;
  arrowCallSignature?: boolean;
  arrowParameter?: boolean;
  callSignature?: boolean;
  memberVariableDeclaration?: boolean;
  objectDestructuring?: boolean;
  parameter?: boolean;
  propertyDeclaration?: boolean;
  variableDeclaration?: boolean;
}
type Option = keyof Options;

const OPTION_ARRAY_DESTRUCTURING: Option = 'arrayDestructuring';
const OPTION_ARROW_CALL_SIGNATURE: Option = 'arrowCallSignature';
const OPTION_ARROW_PARAMETER: Option = 'arrowParameter';
const OPTION_CALL_SIGNATURE: Option = 'callSignature';
const OPTION_MEMBER_VARIABLE_DECLARATION: Option = 'memberVariableDeclaration';
const OPTION_OBJECT_DESTRUCTURING: Option = 'objectDestructuring';
const OPTION_PARAMETER: Option = 'parameter';
const OPTION_PROPERTY_DECLARATION: Option = 'propertyDeclaration';
const OPTION_VARIABLE_DECLARATION: Option = 'variableDeclaration';

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
          [OPTION_ARRAY_DESTRUCTURING]: { type: 'boolean' },
          [OPTION_ARROW_CALL_SIGNATURE]: { type: 'boolean' },
          [OPTION_ARROW_PARAMETER]: { type: 'boolean' },
          [OPTION_CALL_SIGNATURE]: { type: 'boolean' },
          [OPTION_MEMBER_VARIABLE_DECLARATION]: { type: 'boolean' },
          [OPTION_OBJECT_DESTRUCTURING]: { type: 'boolean' },
          [OPTION_PARAMETER]: { type: 'boolean' },
          [OPTION_PROPERTY_DECLARATION]: { type: 'boolean' },
          [OPTION_VARIABLE_DECLARATION]: { type: 'boolean' },
        },
      },
    ],
    type: 'suggestion',
  },
  defaultOptions: [
    {
      [OPTION_ARROW_CALL_SIGNATURE]: true,
      [OPTION_ARROW_PARAMETER]: true,
      [OPTION_CALL_SIGNATURE]: true,
      [OPTION_MEMBER_VARIABLE_DECLARATION]: true,
      [OPTION_PARAMETER]: true,
      [OPTION_PROPERTY_DECLARATION]: true,
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
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(esNode);
      if (!ts.isFunctionLike(tsNode) && !ts.isVariableDeclaration(tsNode)) {
        return false;
      }

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
        if (!options[OPTION_ARRAY_DESTRUCTURING]) {
          return;
        }

        const parent = node.parent;
        if (!parent || isTypedVariableDeclaration(parent)) {
          return;
        }

        report(node);
      },
      ArrowFunctionExpression(node) {
        if (options[OPTION_ARROW_CALL_SIGNATURE]) {
          const parent = node.parent!;
          if (
            parent.type !== AST_NODE_TYPES.CallExpression &&
            !isTypedPropertyDeclaration(parent)
          ) {
            report(node);
          }
        }

        if (options[OPTION_ARROW_PARAMETER]) {
          for (const param of node.params) {
            if (!isTypedParameterDeclaration(param)) {
              report(param, getEsNodeName(param));
            }
          }
        }
      },
      ClassProperty(node) {
        if (!options[OPTION_MEMBER_VARIABLE_DECLARATION]) {
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
        if (options[OPTION_CALL_SIGNATURE]) {
          visitCallSignature(node);
        }

        if (options[OPTION_PARAMETER]) {
          for (const param of node.params) {
            if (!isTypedParameterDeclaration(param)) {
              report(param, getEsNodeName(param));
            }
          }
        }
      },
      ObjectPattern(node) {
        if (!options[OPTION_OBJECT_DESTRUCTURING]) {
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
        if (!options[OPTION_PROPERTY_DECLARATION] || node.typeAnnotation) {
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
        if (!options[OPTION_VARIABLE_DECLARATION] || node.id.typeAnnotation) {
          return;
        }

        report(node, getEsNodeName(node.id));
      },
    };
  },
});
