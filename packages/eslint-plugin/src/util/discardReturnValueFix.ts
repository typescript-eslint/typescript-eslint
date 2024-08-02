import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import {
  AST_NODE_TYPES,
  ASTUtils,
  ESLintUtils,
} from '@typescript-eslint/utils';

import { nullThrows } from '.';
import { getRangeWithParens } from './getRangeWithParens';
import { getWrappingFixer } from './getWrappingFixer';

const ASI_PREVENTING_TOKENS = new Set(['-', '+', '`', '<', '(', '[']);

/**
 * Rewrites a return statement with a value so that the value is discarded.
 *
 * Must be called only on return statements with a value!
 *
 * Does one of these things:
 * - Removes whole return statement if possible.
 * - {@link removeValueLeaveReturnFix}
 * - {@link removeReturnLeaveValueFix}
 * - {@link getWrappingFixer} with void operator if {@link useVoidOperator} is true
 * - {@link moveValueBeforeReturnFix} if {@link useVoidOperator} is false
 */
export function discardReturnValueFix(
  fixer: TSESLint.RuleFixer,
  sourceCode: Readonly<TSESLint.SourceCode>,
  returnNode: TSESTree.ReturnStatement,
  useVoidOperator = false,
): TSESLint.RuleFix {
  const argumentNode = nullThrows(
    returnNode.argument,
    'missing return argument',
  );

  if (!ASTUtils.hasSideEffect(argumentNode, sourceCode)) {
    // Return value is not needed.

    if (isFinalReturn(returnNode)) {
      // Return statement is not needed.
      // We can remove everything.
      return fixer.remove(returnNode);
    }

    // Return statement must stay.
    return removeValueLeaveReturnFix(fixer, sourceCode, returnNode);
  }

  // Return value must stay.

  if (isFinalReturn(returnNode)) {
    // Return statement is not needed.
    return removeReturnLeaveValueFix(fixer, sourceCode, returnNode);
  }

  // Both the statement and the value must stay.

  if (useVoidOperator) {
    // Use void operator to discard the return value.
    return getWrappingFixer({
      node: argumentNode,
      sourceCode,
      wrap: code => `void ${code}`,
    })(fixer);
  }

  return moveValueBeforeReturnFix(fixer, sourceCode, returnNode);
}

/**
 * Checks whether the return statement is the last statement in a function body.
 */
export function isFinalReturn(returnNode: TSESTree.ReturnStatement): boolean {
  // Return's parent must be a block.
  if (returnNode.parent.type !== AST_NODE_TYPES.BlockStatement) {
    // E.g. `if (cond) return;` (not in a block)
    return false;
  }
  // Block's parent must be a function.
  if (
    returnNode.parent.parent.type !== AST_NODE_TYPES.FunctionDeclaration &&
    returnNode.parent.parent.type !== AST_NODE_TYPES.FunctionExpression &&
    returnNode.parent.parent.type !== AST_NODE_TYPES.ArrowFunctionExpression
  ) {
    // E.g. `if (cond) { return; }`
    // Not in a top-level function block.
    return false;
  }
  // Return must be the last child of the block.
  if (
    returnNode.parent.body.indexOf(returnNode) <
    returnNode.parent.body.length - 1
  ) {
    // Not the last statement in the block.
    return false;
  }
  return true;
}

/**
 * Removes the value from a return statement and leaves only the return keyword.
 */
export function removeValueLeaveReturnFix(
  fixer: TSESLint.RuleFixer,
  sourceCode: Readonly<TSESLint.SourceCode>,
  returnNode: TSESTree.ReturnStatement,
): TSESLint.RuleFix {
  const returnToken = ESLintUtils.nullThrows(
    sourceCode.getFirstToken(returnNode, {
      filter: token => token.value === 'return',
    }),
    ESLintUtils.NullThrowsReasons.MissingToken(
      'return keyword',
      returnNode.type,
    ),
  );
  const argumentNode = nullThrows(
    returnNode.argument,
    'missing return argument',
  );
  const argRange = getRangeWithParens(argumentNode, sourceCode);
  return fixer.removeRange([returnToken.range[1], argRange[1]]);
}

/**
 * Removes the return keyword from a return statement and leaves only the value.
 */
export function removeReturnLeaveValueFix(
  fixer: TSESLint.RuleFixer,
  sourceCode: Readonly<TSESLint.SourceCode>,
  returnNode: TSESTree.ReturnStatement,
): TSESLint.RuleFix {
  const argumentNode = nullThrows(
    returnNode.argument,
    'missing return argument',
  );
  let newReturnText = `${sourceCode.getText(argumentNode)};`;
  if (ASI_PREVENTING_TOKENS.has(newReturnText[0])) {
    // The line could be interpreted as a continuation of the previous line, so
    // we put a semicolon at the beginning to not break semicolon-less code.
    newReturnText = `;${newReturnText}`;
  }
  return fixer.replaceText(returnNode, newReturnText);
}

/**
 * Moves the return value before the return statement
 * and leaves the return statement without a value.
 */
export function moveValueBeforeReturnFix(
  fixer: TSESLint.RuleFixer,
  sourceCode: Readonly<TSESLint.SourceCode>,
  returnNode: TSESTree.ReturnStatement,
): TSESLint.RuleFix {
  const argumentNode = nullThrows(
    returnNode.argument,
    'missing return argument',
  );
  let newReturnText = sourceCode.getText(argumentNode);
  if (newReturnText[0] === '{') {
    // The value would be interpreted as a block statement,
    // so we need to wrap it in parentheses.
    newReturnText = `(${newReturnText})`;
  }
  if (ASI_PREVENTING_TOKENS.has(newReturnText[0])) {
    // The line could be interpreted as a continuation of the previous line,
    // so we put a semicolon at the beginning to not break semicolon-less code.
    newReturnText = `;${newReturnText}`;
  }
  newReturnText = `${newReturnText}; return;`;
  if (returnNode.parent.type !== AST_NODE_TYPES.BlockStatement) {
    // E.g. `if (cond) return value;`
    // Add braces if not inside a block.
    newReturnText = `{ ${newReturnText} }`;
  }
  return fixer.replaceText(returnNode, newReturnText);
}
