import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { escapeRegExp } from './escapeRegExp';
import * as ts from 'typescript';

// deeply re-export, for convenience
export * from '@typescript-eslint/utils/dist/ast-utils';

// The following is copied from `eslint`'s source code since it doesn't exist in eslint@5.
// https://github.com/eslint/eslint/blob/145aec1ab9052fbca96a44d04927c595951b1536/lib/rules/utils/ast-utils.js#L1751-L1779
// Could be export { getNameLocationInGlobalDirectiveComment } from 'eslint/lib/rules/utils/ast-utils'
/**
 * Get the `loc` object of a given name in a `/*globals` directive comment.
 * @param {SourceCode} sourceCode The source code to convert index to loc.
 * @param {Comment} comment The `/*globals` directive comment which include the name.
 * @param {string} name The name to find.
 * @returns {SourceLocation} The `loc` object.
 */
export function getNameLocationInGlobalDirectiveComment(
  sourceCode: TSESLint.SourceCode,
  comment: TSESTree.Comment,
  name: string,
): TSESTree.SourceLocation {
  const namePattern = new RegExp(
    `[\\s,]${escapeRegExp(name)}(?:$|[\\s,:])`,
    'gu',
  );

  // To ignore the first text "global".
  namePattern.lastIndex = comment.value.indexOf('global') + 6;

  // Search a given variable name.
  const match = namePattern.exec(comment.value);

  // Convert the index to loc.
  const start = sourceCode.getLocFromIndex(
    comment.range[0] + '/*'.length + (match ? match.index + 1 : 0),
  );
  const end = {
    line: start.line,
    column: start.column + (match ? name.length : 1),
  };

  return { start, end };
}

// Copied from typescript https://github.com/microsoft/TypeScript/blob/42b0e3c4630c129ca39ce0df9fff5f0d1b4dd348/src/compiler/utilities.ts#L1335
// Warning: This has the same semantics as the forEach family of functions,
//          in that traversal terminates in the event that 'visitor' supplies a truthy value.
export function forEachReturnStatement<T>(
  body: ts.Block,
  visitor: (stmt: ts.ReturnStatement) => T,
): T | undefined {
  return traverse(body);

  function traverse(node: ts.Node): T | undefined {
    switch (node.kind) {
      case ts.SyntaxKind.ReturnStatement:
        return visitor(<ts.ReturnStatement>node);
      case ts.SyntaxKind.CaseBlock:
      case ts.SyntaxKind.Block:
      case ts.SyntaxKind.IfStatement:
      case ts.SyntaxKind.DoStatement:
      case ts.SyntaxKind.WhileStatement:
      case ts.SyntaxKind.ForStatement:
      case ts.SyntaxKind.ForInStatement:
      case ts.SyntaxKind.ForOfStatement:
      case ts.SyntaxKind.WithStatement:
      case ts.SyntaxKind.SwitchStatement:
      case ts.SyntaxKind.CaseClause:
      case ts.SyntaxKind.DefaultClause:
      case ts.SyntaxKind.LabeledStatement:
      case ts.SyntaxKind.TryStatement:
      case ts.SyntaxKind.CatchClause:
        return ts.forEachChild(node, traverse);
    }

    return undefined;
  }
}
