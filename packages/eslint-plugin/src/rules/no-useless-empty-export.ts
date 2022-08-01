import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import * as util from '../util';

function isEmptyExport(
  node: TSESTree.Node,
): node is TSESTree.ExportNamedDeclaration {
  return (
    node.type === AST_NODE_TYPES.ExportNamedDeclaration &&
    node.specifiers.length === 0 &&
    !node.declaration
  );
}

const exportOrImportNodeTypes = new Set([
  AST_NODE_TYPES.ExportAllDeclaration,
  AST_NODE_TYPES.ExportDefaultDeclaration,
  AST_NODE_TYPES.ExportNamedDeclaration,
  AST_NODE_TYPES.ExportSpecifier,
  AST_NODE_TYPES.ImportDeclaration,
  AST_NODE_TYPES.TSExportAssignment,
  AST_NODE_TYPES.TSImportEqualsDeclaration,
]);

export default util.createRule({
  name: 'no-useless-empty-export',
  meta: {
    docs: {
      description:
        "Disallow empty exports that don't change anything in a module file",
      recommended: false,
      suggestion: true,
    },
    fixable: 'code',
    hasSuggestions: false,
    messages: {
      uselessExport: 'Empty export does nothing and can be removed.',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    function checkNode(
      node: TSESTree.Program | TSESTree.TSModuleDeclaration,
    ): void {
      if (!Array.isArray(node.body)) {
        return;
      }

      let emptyExport: TSESTree.ExportNamedDeclaration | undefined;
      let foundOtherExport = false;

      for (const statement of node.body) {
        if (isEmptyExport(statement)) {
          emptyExport = statement;

          if (foundOtherExport) {
            break;
          }
        } else if (exportOrImportNodeTypes.has(statement.type)) {
          foundOtherExport = true;
        }
      }

      if (emptyExport && foundOtherExport) {
        context.report({
          fix: fixer => fixer.remove(emptyExport!),
          messageId: 'uselessExport',
          node: emptyExport,
        });
      }
    }

    return {
      Program: checkNode,
      TSModuleDeclaration: checkNode,
    };
  },
});
