import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, ASTUtils } from '@typescript-eslint/utils';

import { createRule } from '../util';

type MessageIds = 'preferRecord' | 'preferIndexSignature';
type Options = ['record' | 'index-signature'];

export default createRule<Options, MessageIds>({
  name: 'consistent-indexed-object-style',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require or disallow the `Record` type',
      recommended: 'stylistic',
    },
    messages: {
      preferRecord: 'A record is preferred over an index signature.',
      preferIndexSignature: 'An index signature is preferred over a record.',
    },
    fixable: 'code',
    schema: [
      {
        enum: ['record', 'index-signature'],
      },
    ],
  },
  defaultOptions: ['record'],
  create(context, [mode]) {
    const sourceCode = context.getSourceCode();

    function checkMembers(
      members: TSESTree.TypeElement[],
      node: TSESTree.TSTypeLiteral | TSESTree.TSInterfaceDeclaration,
      parentId: TSESTree.Identifier | undefined,
      prefix: string,
      postfix: string,
      safeFix = true,
    ): void {
      if (members.length !== 1) {
        return;
      }
      const [member] = members;

      if (member.type !== AST_NODE_TYPES.TSIndexSignature) {
        return;
      }

      const [parameter] = member.parameters;

      if (!parameter) {
        return;
      }

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

      if (parentId) {
        const scope = context.getScope();
        const superVar = ASTUtils.findVariable(scope, parentId.name);
        if (superVar) {
          const isCircular = superVar.references.some(
            item =>
              item.isTypeReference &&
              node.range[0] <= item.identifier.range[0] &&
              node.range[1] >= item.identifier.range[1],
          );
          if (isCircular) {
            return;
          }
        }
      }

      context.report({
        node,
        messageId: 'preferRecord',
        fix: safeFix
          ? (fixer): TSESLint.RuleFix => {
              const key = sourceCode.getText(keyType.typeAnnotation);
              const value = sourceCode.getText(valueType.typeAnnotation);
              const record = member.readonly
                ? `Readonly<Record<${key}, ${value}>>`
                : `Record<${key}, ${value}>`;
              return fixer.replaceText(node, `${prefix}${record}${postfix}`);
            }
          : null,
      });
    }

    return {
      ...(mode === 'index-signature' && {
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
      }),
      ...(mode === 'record' && {
        TSTypeLiteral(node): void {
          const parent = findParentDeclaration(node);
          checkMembers(node.members, node, parent?.id, '', '');
        },
        TSInterfaceDeclaration(node): void {
          let genericTypes = '';

          if (node.typeParameters?.params?.length) {
            genericTypes = `<${node.typeParameters.params
              .map(p => sourceCode.getText(p))
              .join(', ')}>`;
          }

          checkMembers(
            node.body.body,
            node,
            node.id,
            `type ${node.id.name}${genericTypes} = `,
            ';',
            !node.extends?.length,
          );
        },
      }),
    };
  },
});

function findParentDeclaration(
  node: TSESTree.Node,
): TSESTree.TSTypeAliasDeclaration | undefined {
  if (node.parent && node.parent.type !== AST_NODE_TYPES.TSTypeAnnotation) {
    if (node.parent.type === AST_NODE_TYPES.TSTypeAliasDeclaration) {
      return node.parent;
    }
    return findParentDeclaration(node.parent);
  }
  return undefined;
}
