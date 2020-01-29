import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import {
  isArrowToken,
  getFunctionNameWithKind,
  isOpeningParenToken,
} from 'eslint-utils';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';
import * as util from '../util';

interface ScopeInfo {
  upper: ScopeInfo | null;
  hasAwait: boolean;
  hasAsync: boolean;
}
type FunctionNode =
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.ArrowFunctionExpression;

export default util.createRule({
  name: 'require-await',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow async functions which have no `await` expression',
      category: 'Best Practices',
      recommended: 'error',
      requiresTypeChecking: true,
      extendsBaseRule: true,
    },
    schema: [],
    messages: {
      missingAwait: "{{name}} has no 'await' expression.",
    },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    const sourceCode = context.getSourceCode();
    let scopeInfo: ScopeInfo | null = null;

    /**
     * Push the scope info object to the stack.
     */
    function enterFunction(node: FunctionNode): void {
      scopeInfo = {
        upper: scopeInfo,
        hasAwait: false,
        hasAsync: node.async,
      };
    }

    /**
     * Pop the top scope info object from the stack.
     * Also, it reports the function if needed.
     */
    function exitFunction(node: FunctionNode): void {
      /* istanbul ignore if */ if (!scopeInfo) {
        // this shouldn't ever happen, as we have to exit a function after we enter it
        return;
      }

      if (node.async && !scopeInfo.hasAwait && !isEmptyFunction(node)) {
        context.report({
          node,
          loc: getFunctionHeadLoc(node, sourceCode),
          messageId: 'missingAwait',
          data: {
            name: util.upperCaseFirst(getFunctionNameWithKind(node)),
          },
        });
      }

      scopeInfo = scopeInfo.upper;
    }

    /**
     * Checks if the node returns a thenable type
     */
    function isThenableType(node: ts.Node): boolean {
      const type = checker.getTypeAtLocation(node);

      return tsutils.isThenableType(checker, node, type);
    }

    /**
     * Marks the current scope as having an await
     */
    function markAsHasAwait(): void {
      if (!scopeInfo) {
        return;
      }

      scopeInfo.hasAwait = true;
    }

    return {
      FunctionDeclaration: enterFunction,
      FunctionExpression: enterFunction,
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression): void {
        enterFunction(node);

        // If body type is not BlockStatement, we need to check the return type here
        if (
          node.body.type !== AST_NODE_TYPES.BlockStatement &&
          node.body.type !== AST_NODE_TYPES.AwaitExpression
        ) {
          const expression = parserServices.esTreeNodeToTSNodeMap.get(
            node.body,
          );
          if (expression && isThenableType(expression)) {
            markAsHasAwait();
          }
        }
      },
      'FunctionDeclaration:exit': exitFunction,
      'FunctionExpression:exit': exitFunction,
      'ArrowFunctionExpression:exit': exitFunction,

      AwaitExpression: markAsHasAwait,
      ForOfStatement(node): void {
        if (node.await) {
          markAsHasAwait();
        }
      },
      ReturnStatement(node): void {
        if (!scopeInfo || scopeInfo.hasAwait || !scopeInfo.hasAsync) {
          // short circuit early to avoid unnecessary type checks
          return;
        }

        const { expression } = parserServices.esTreeNodeToTSNodeMap.get(node);
        if (expression && isThenableType(expression)) {
          markAsHasAwait();
        }
      },
    };
  },
});

function isEmptyFunction(node: FunctionNode): boolean {
  return (
    node.body?.type === AST_NODE_TYPES.BlockStatement &&
    node.body.body.length === 0
  );
}

// https://github.com/eslint/eslint/blob/03a69dbe86d5b5768a310105416ae726822e3c1c/lib/rules/utils/ast-utils.js#L382-L392
/**
 * Gets the `(` token of the given function node.
 */
function getOpeningParenOfParams(
  node: FunctionNode,
  sourceCode: TSESLint.SourceCode,
): TSESTree.Token {
  return util.nullThrows(
    node.id
      ? sourceCode.getTokenAfter(node.id, isOpeningParenToken)
      : sourceCode.getFirstToken(node, isOpeningParenToken),
    util.NullThrowsReasons.MissingToken('(', node.type),
  );
}

// https://github.com/eslint/eslint/blob/03a69dbe86d5b5768a310105416ae726822e3c1c/lib/rules/utils/ast-utils.js#L1220-L1242
/**
 * Gets the location of the given function node for reporting.
 */
function getFunctionHeadLoc(
  node: FunctionNode,
  sourceCode: TSESLint.SourceCode,
): TSESTree.SourceLocation {
  const parent = util.nullThrows(
    node.parent,
    util.NullThrowsReasons.MissingParent,
  );
  let start = null;
  let end = null;

  if (node.type === AST_NODE_TYPES.ArrowFunctionExpression) {
    const arrowToken = util.nullThrows(
      sourceCode.getTokenBefore(node.body, isArrowToken),
      util.NullThrowsReasons.MissingToken('=>', node.type),
    );

    start = arrowToken.loc.start;
    end = arrowToken.loc.end;
  } else if (
    parent.type === AST_NODE_TYPES.Property ||
    parent.type === AST_NODE_TYPES.MethodDefinition
  ) {
    start = parent.loc.start;
    end = getOpeningParenOfParams(node, sourceCode).loc.start;
  } else {
    start = node.loc.start;
    end = getOpeningParenOfParams(node, sourceCode).loc.start;
  }

  return {
    start,
    end,
  };
}
