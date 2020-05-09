import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';
import * as util from '../util';

interface ScopeInfo {
  upper: ScopeInfo | null;
  hasAwait: boolean;
  hasAsync: boolean;
  isGen: boolean;
  isAsyncYield: boolean;
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
        isGen: node.generator || false,
        isAsyncYield: false,
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

      if (
        node.async &&
        !scopeInfo.hasAwait &&
        !isEmptyFunction(node) &&
        !(scopeInfo.isGen && scopeInfo.isAsyncYield)
      ) {
        context.report({
          node,
          loc: getFunctionHeadLoc(node, sourceCode),
          messageId: 'missingAwait',
          data: {
            name: util.upperCaseFirst(util.getFunctionNameWithKind(node)),
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

    /**
     * mark `scopeInfo.isAsyncYield` to `true` if its a generator
     * function and the delegate is `true`
     */
    function markAsHasDelegateGen(node: TSESTree.YieldExpression): void {
      if (!scopeInfo || !scopeInfo.isGen || !node.argument) {
        return;
      }

      if (node?.argument?.type === AST_NODE_TYPES.Literal) {
        // making this `false` as for literals we don't need to check the definition
        // eg : async function* run() { yield* 1 }
        scopeInfo.isAsyncYield = false;
      }

      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node?.argument);
      const type = checker.getTypeAtLocation(tsNode);
      const symbol = type.getSymbol();

      // async function* test1() {yield* asyncGenerator() }
      if (symbol?.getName() === 'AsyncGenerator') {
        scopeInfo.isAsyncYield = true;
      }
    }

    return {
      FunctionDeclaration: enterFunction,
      FunctionExpression: enterFunction,
      ArrowFunctionExpression: enterFunction,
      'FunctionDeclaration:exit': exitFunction,
      'FunctionExpression:exit': exitFunction,
      'ArrowFunctionExpression:exit': exitFunction,

      AwaitExpression: markAsHasAwait,
      'ForOfStatement[await = true]': markAsHasAwait,
      'YieldExpression[delegate = true]': markAsHasDelegateGen,

      // check body-less async arrow function.
      // ignore `async () => await foo` because it's obviously correct
      'ArrowFunctionExpression[async = true] > :not(BlockStatement, AwaitExpression)'(
        node: Exclude<
          TSESTree.Node,
          TSESTree.BlockStatement | TSESTree.AwaitExpression
        >,
      ): void {
        const expression = parserServices.esTreeNodeToTSNodeMap.get(node);
        if (expression && isThenableType(expression)) {
          markAsHasAwait();
        }
      },
      ReturnStatement(node): void {
        // short circuit early to avoid unnecessary type checks
        if (!scopeInfo || scopeInfo.hasAwait || !scopeInfo.hasAsync) {
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
      ? sourceCode.getTokenAfter(node.id, util.isOpeningParenToken)
      : sourceCode.getFirstToken(node, util.isOpeningParenToken),
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
      sourceCode.getTokenBefore(node.body, util.isArrowToken),
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
