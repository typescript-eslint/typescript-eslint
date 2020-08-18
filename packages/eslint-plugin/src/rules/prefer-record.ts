import { createRule } from '../util';
import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

export default createRule({
  name: 'prefer-record',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce a consistent record style',
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
          const typeName = node.typeName as TSESTree.Identifier;
          if (typeName.name !== 'Record') {
            return;
          }

          const { params } = node.typeParameters!;
          if (params.length !== 2) {
            return;
          }

          context.report({
            node,
            messageId: 'preferIndexSignature',
            fix(fixer) {
              const key = sourceCode.getText(params[0]);
              const type = sourceCode.getText(params[1]);
              return fixer.replaceTextRange(
                node.range,
                `{ [key: ${key}]: ${type} }`,
              );
            },
          });
        },
      };
    }

    /**
     * Convert an index signature node to record code as string.
     */
    function toRecord(node: TSESTree.TSIndexSignature): string {
      const parameter = node.parameters[0] as TSESTree.Identifier;
      const key = sourceCode.getText(parameter.typeAnnotation?.typeAnnotation);
      const value = sourceCode.getText(node.typeAnnotation?.typeAnnotation);
      return `Record<${key}, ${value}>`;
    }

    return {
      TSTypeLiteral(node): void {
        if (node.members.length !== 1) {
          return;
        }

        const [member] = node.members;

        if (member.type !== AST_NODE_TYPES.TSIndexSignature) {
          return;
        }

        context.report({
          node,
          messageId: 'preferRecord',
          fix(fixer) {
            return fixer.replaceTextRange(node.range, toRecord(member));
          },
        });
      },

      TSInterfaceDeclaration(node): void {
        const { body } = node.body;

        if (body.length !== 1) {
          return;
        }

        const [index] = body;
        if (index.type !== AST_NODE_TYPES.TSIndexSignature) {
          return;
        }

        context.report({
          node,
          messageId: 'preferRecord',
          fix(fixer) {
            const { name } = node.id;
            return fixer.replaceTextRange(
              node.range,
              `type ${name} = ${toRecord(index)};`,
            );
          },
        });
      },
    };
  },
});
