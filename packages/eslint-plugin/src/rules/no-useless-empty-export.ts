import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule, isDefinitionFile } from '../util';

function isEmptyExport(
  node: TSESTree.Node,
): node is TSESTree.ExportNamedDeclaration {
  return (
    node.type === AST_NODE_TYPES.ExportNamedDeclaration &&
    node.specifiers.length === 0 &&
    !node.declaration &&
    !node.source
  );
}

const exportOrImportNodeTypes = new Set([
  AST_NODE_TYPES.ExportAllDeclaration,
  AST_NODE_TYPES.ExportDefaultDeclaration,
  AST_NODE_TYPES.ExportNamedDeclaration,
  AST_NODE_TYPES.ImportDeclaration,
  AST_NODE_TYPES.TSExportAssignment,
]);

function isExportOrImport(node: TSESTree.Node): boolean {
  return (
    exportOrImportNodeTypes.has(node.type) ||
    // `import x = Foo.bar` doesn't make a file a module, but `import x = require('...')` does
    (node.type === AST_NODE_TYPES.TSImportEqualsDeclaration &&
      node.moduleReference.type === AST_NODE_TYPES.TSExternalModuleReference)
  );
}

export default createRule({
  name: 'no-useless-empty-export',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        "Disallow empty exports that don't change anything in a module file",
    },
    fixable: 'code',
    hasSuggestions: false,
    messages: {
      uselessExport: 'Empty export does nothing and can be removed.',
    },
    schema: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [],
  create(context) {
    // In a definition file, export {} is necessary to make the module properly
    // encapsulated, even when there are other exports
    // https://github.com/typescript-eslint/typescript-eslint/issues/4975
    if (isDefinitionFile(context.filename)) {
      return {};
    }
    return {
      Program(node): void {
        const emptyExports: TSESTree.ExportNamedDeclaration[] = [];
        let foundOtherExport = false;

        for (const statement of node.body) {
          if (isEmptyExport(statement)) {
            emptyExports.push(statement);
          } else if (isExportOrImport(statement)) {
            foundOtherExport = true;
          }
        }

        if (foundOtherExport) {
          for (const emptyExport of emptyExports) {
            context.report({
              node: emptyExport,
              messageId: 'uselessExport',
              fix: fixer =>
                // removing the export would also remove any comments inside it
                context.sourceCode.getCommentsInside(emptyExport).length
                  ? null
                  : fixer.remove(emptyExport),
            });
          }
        }
      },
    };
  },
});
