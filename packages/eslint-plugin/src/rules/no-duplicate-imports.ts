import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import baseRule from 'eslint/lib/rules/no-duplicate-imports';
import * as util from '../util';

type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'no-duplicate-imports',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow duplicate imports',
      category: 'Best Practices',
      recommended: false,
      extendsBaseRule: true,
    },
    schema: baseRule.meta.schema,
    messages: {
      ...baseRule.meta.messages,
      importType: '{{module}} type import is duplicated',
      importTypeAs: '{{module}} type import is duplicated as type export',
      exportType: '{{module}} type export is duplicated',
      exportTypeAs: '{{module}} type export is duplicated as type import',
    },
  },
  defaultOptions: [
    {
      includeExports: false,
    },
  ],
  create(context, [option]) {
    const rules = baseRule.create(context);
    const includeExports = option.includeExports;
    const typeMemberImports = new Set();
    const typeDefaultImports = new Set();
    const typeExports = new Set();

    function report(
      messageId: MessageIds,
      node: TSESTree.Node,
      module: string,
    ): void {
      context.report({
        messageId,
        node,
        data: {
          module,
        },
      });
    }

    function isStringLiteral(
      node: TSESTree.Node | null,
    ): node is TSESTree.StringLiteral {
      return (
        !!node &&
        node.type === AST_NODE_TYPES.Literal &&
        typeof node.value === 'string'
      );
    }

    function isAllMemberImport(node: TSESTree.ImportDeclaration): boolean {
      return node.specifiers.every(
        specifier => specifier.type === AST_NODE_TYPES.ImportSpecifier,
      );
    }

    function checkTypeImport(node: TSESTree.ImportDeclaration): void {
      if (isStringLiteral(node.source)) {
        const value = node.source.value;
        const isMemberImport = isAllMemberImport(node);
        if (
          isMemberImport
            ? typeMemberImports.has(value)
            : typeDefaultImports.has(value)
        ) {
          report('importType', node, value);
        }

        if (includeExports && typeExports.has(value)) {
          report('importTypeAs', node, value);
        }
        if (isMemberImport) {
          typeMemberImports.add(value);
        } else {
          typeDefaultImports.add(value);
        }
      }
    }

    function checkTypeExport(
      node: TSESTree.ExportNamedDeclaration | TSESTree.ExportAllDeclaration,
    ): void {
      if (isStringLiteral(node.source)) {
        const value = node.source.value;
        if (typeExports.has(value)) {
          report('exportType', node, value);
        }
        if (typeMemberImports.has(value) || typeDefaultImports.has(value)) {
          report('exportTypeAs', node, value);
        }
        typeExports.add(value);
      }
    }

    return {
      ...rules,
      ImportDeclaration(node): void {
        if (node.importKind === 'type') {
          checkTypeImport(node);
          return;
        }
        rules.ImportDeclaration(node);
      },
      ExportNamedDeclaration(node): void {
        if (includeExports && node.exportKind === 'type') {
          checkTypeExport(node);
          return;
        }
        rules.ExportNamedDeclaration?.(node);
      },
      ExportAllDeclaration(node): void {
        if (includeExports && node.exportKind === 'type') {
          checkTypeExport(node);
          return;
        }
        rules.ExportAllDeclaration?.(node);
      },
    };
  },
});
