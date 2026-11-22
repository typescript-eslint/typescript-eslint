import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

const moduleIndicatorNodeTypes = new Set([
  AST_NODE_TYPES.ExportAllDeclaration,
  AST_NODE_TYPES.ExportDefaultDeclaration,
  AST_NODE_TYPES.ExportNamedDeclaration,
  AST_NODE_TYPES.ImportDeclaration,
  AST_NODE_TYPES.TSExportAssignment,
]);

function isModuleIndicator(node: TSESTree.ProgramStatement): boolean {
  return (
    moduleIndicatorNodeTypes.has(node.type) ||
    // `import x = Foo.bar` doesn't make a file a module, but `import x = require('...')` does
    (node.type === AST_NODE_TYPES.TSImportEqualsDeclaration &&
      node.moduleReference.type === AST_NODE_TYPES.TSExternalModuleReference)
  );
}

/**
 * Whether TypeScript treats the file as a global script rather than a module:
 * either it's parsed as a script, or no top-level statement is an import or
 * export. Top-level declarations in such a file are globals, so they merge
 * with (augment) lib declarations of the same name, even though ESLint's scope
 * analysis still puts them in a module scope.
 *
 * This follows TypeScript's default `moduleDetection` (`"auto"`) using only the
 * AST. It doesn't detect files that TypeScript makes modules for other reasons:
 * `moduleDetection: "force"`, `.mts`/`.cts` extensions, `"type": "module"` in
 * package.json under `node16`/`nodenext`, `jsx: "react-jsx"`, or `import.meta`.
 */
export function isGlobalScript(
  sourceCode: Readonly<Pick<TSESLint.SourceCode, 'ast'>>,
): boolean {
  return (
    sourceCode.ast.sourceType === 'script' ||
    !sourceCode.ast.body.some(isModuleIndicator)
  );
}
