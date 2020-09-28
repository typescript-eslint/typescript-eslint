import { createRule } from '../util';
import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

export default createRule({
  name: 'consistent-indexed-object-style',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce or disallow the use of the record type',
      category: 'Stylistic Issues',
      // too opinionated to be recommended
      recommended: false,
    },
    messages: {
      preferRecord: 'A record is preferred over an index signature',
      preferIndexSignature: 'An index signature is preferred over a record.',
    },
    fixable: 'code',
    schema: [
      {
        enum: ['always', 'never'],
      },
    ],
  },
  defaultOptions: ['always'],
  create(context) {
    const sourceCode = context.getSourceCode();

    if (context.options[0] === 'never') {
      return {
        TSTypeReference(node): void {
          const typeName = node.typeName;
          if (typeName.type !== AST_NODE_TYPES.Identifier) {
            return;
          }
          if (typeName.name !== 'Record') {
            return;
          }

          const params = node.typeParameters?.params;
          if (params?.length !== 2) {
            return;
          }

          context.report({
            node,
            messageId: 'preferIndexSignature',
            fix(fixer) {
              const key = sourceCode.getText(params[0]);
              const type = sourceCode.getText(params[1]);
              return fixer.replaceText(node, `{ [key: ${key}]: ${type} }`);
            },
          });
        },
      };
    }

    function checkMembers(
      members: TSESTree.TypeElement[],
      node: TSESTree.Node,
      prefix: string,
      postfix: string,
    ): void {
      if (members.length !== 1) {
        return;
      }
      const [member] = members;

      if (member.type !== AST_NODE_TYPES.TSIndexSignature) {
        return;
      }

      const [parameter] = member.parameters;

      if (parameter.type !== AST_NODE_TYPES.Identifier) {
        return;
      }
      const keyType = parameter.typeAnnotation;
      if (!keyType) {
        return;
      }

      const valueType = member.typeAnnotation;
      if (!valueType) {
        return;
      }

      context.report({
        node,
        messageId: 'preferRecord',
        fix(fixer) {
          const key = sourceCode.getText(keyType.typeAnnotation);
          const value = sourceCode.getText(valueType.typeAnnotation);
          return fixer.replaceText(
            node,
            `${prefix}Record<${key}, ${value}>${postfix}`,
          );
        },
      });
    }

    return {
      TSTypeLiteral(node): void {
        checkMembers(node.members, node, '', '');
      },

      TSInterfaceDeclaration(node): void {
        checkMembers(node.body.body, node, `type ${node.id.name} = `, ';');
      },
    };
  },
});
