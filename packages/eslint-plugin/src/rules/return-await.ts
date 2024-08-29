import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getParserServices,
  isAwaitExpression,
  isAwaitKeyword,
  isTypeAnyType,
  isTypeUnknownType,
  nullThrows,
} from '../util';
import { getOperatorPrecedence } from '../util/getOperatorPrecedence';

type FunctionNode =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression;

interface ScopeInfo {
  hasAsync: boolean;
  owningFunc: FunctionNode;
}

type Option =
  | 'in-try-catch'
  | 'always'
  | 'never'
  | 'error-handling-correctness-only';

export default createRule({
  name: 'return-await',
  meta: {
    docs: {
      description: 'Enforce consistent awaiting of returned promises',
      requiresTypeChecking: true,
      extendsBaseRule: 'no-return-await',
      recommended: {
        strict: ['error-handling-correctness-only'],
      },
    },
    fixable: 'code',
    hasSuggestions: true,
    type: 'problem',
    messages: {
      nonPromiseAwait:
        'Returning an awaited value that is not a promise is not allowed.',
      disallowedPromiseAwait:
        'Returning an awaited promise is not allowed in this context.',
      requiredPromiseAwait:
        'Returning an awaited promise is required in this context.',
      requiredPromiseAwaitSuggestion:
        'Add `await` before the expression. Use caution as this may impact control flow.',
      disallowedPromiseAwaitSuggestion:
        'Remove `await` before the expression. Use caution as this may impact control flow.',
    },
    schema: [
      {
        type: 'string',
        oneOf: [
          {
            type: 'string',
            enum: ['always'],
            description: 'Requires that all returned promises be awaited.',
          },
          {
            type: 'string',
            enum: ['error-handling-correctness-only'],
            description:
              'In error-handling contexts, the rule enforces that returned promises must be awaited. In ordinary contexts, the rule does not enforce any particular behavior around whether returned promises are awaited.',
          },
          {
            type: 'string',
            enum: ['in-try-catch'],
            description:
              'In error-handling contexts, the rule enforces that returned promises must be awaited. In ordinary contexts, the rule enforces that returned promises _must not_ be awaited.',
          },
          {
            type: 'string',
            enum: ['never'],
            description: 'Disallows awaiting any returned promises.',
          },
        ],
      },
    ],
  },
  defaultOptions: ['in-try-catch'],

  create(context, [option]) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    const scopeInfoStack: ScopeInfo[] = [];

    function enterFunction(node: FunctionNode): void {
      scopeInfoStack.push({
        hasAsync: node.async,
        owningFunc: node,
      });
    }

    function exitFunction(): void {
      scopeInfoStack.pop();
    }

    function affectsExplicitResourceManagement(node: TSESTree.Node): boolean {
      // just need to determine if there is a `using` declaration in scope.
      let scope = context.sourceCode.getScope(node);
      const functionScope = scope.variableScope;
      while (true) {
        for (const variable of scope.variables) {
          if (variable.defs.length !== 1) {
            // This can't be the case for `using` or `await using` since it's
            // an error to redeclare those more than once in the same scope,
            // unlike, say, `var` declarations.
            continue;
          }

          const declaration = variable.defs[0];
          const declaratorNode = declaration.node;
          const declarationNode =
            declaratorNode.parent as TSESTree.VariableDeclaration;

          // if it's a using/await using declaration, and it comes _before_ the
          // node we're checking, it affects control flow for that node.
          if (
            ['using', 'await using'].includes(declarationNode.kind) &&
            declaratorNode.range[1] < node.range[0]
          ) {
            return true;
          }
        }

        if (scope === functionScope) {
          // We've checked all the relevant scopes
          break;
        }

        // This should always exist, since the rule should only be checking
        // contexts in which `return` statements are legal, which should always
        // be inside a function.
        scope = nullThrows(
          scope.upper,
          'Expected parent scope to exist. return-await should only operate on return statements within functions',
        );
      }

      return false;
    }

    /**
     * Tests whether a node is inside of an explicit error handling context
     * (try/catch/finally) in a way that throwing an exception will have an
     * impact on the program's control flow.
     */
    function affectsExplicitErrorHandling(node: ts.Node): boolean {
      // If an error-handling block is followed by another error-handling block,
      // control flow is affected by whether promises in it are awaited or not.
      // Otherwise, we need to check recursively for nested try statements until
      // we get to the top level of a function or the program. If by then,
      // there's no offending error-handling blocks, it doesn't affect control
      // flow.
      const tryAncestorResult = findContainingTryStatement(node);
      if (tryAncestorResult == null) {
        return false;
      }

      const { tryStatement, block } = tryAncestorResult;

      switch (block) {
        case 'try':
          // Try blocks are always followed by either a catch or finally,
          // so exceptions thrown here always affect control flow.
          return true;
        case 'catch':
          // Exceptions thrown in catch blocks followed by a finally block affect
          // control flow.
          if (tryStatement.finallyBlock != null) {
            return true;
          }

          // Otherwise recurse.
          return affectsExplicitErrorHandling(tryStatement);
        case 'finally':
          return affectsExplicitErrorHandling(tryStatement);
        default: {
          const __never: never = block;
          throw new Error(`Unexpected block type: ${String(__never)}`);
        }
      }
    }

    interface FindContainingTryStatementResult {
      tryStatement: ts.TryStatement;
      block: 'try' | 'catch' | 'finally';
    }

    /**
     * A try _statement_ is the whole thing that encompasses try block,
     * catch clause, and finally block. This function finds the nearest
     * enclosing try statement (if present) for a given node, and reports which
     * part of the try statement the node is in.
     */
    function findContainingTryStatement(
      node: ts.Node,
    ): FindContainingTryStatementResult | undefined {
      let child = node;
      let ancestor = node.parent as ts.Node | undefined;

      while (ancestor && !ts.isFunctionLike(ancestor)) {
        if (ts.isTryStatement(ancestor)) {
          let block: 'try' | 'catch' | 'finally' | undefined;
          if (child === ancestor.tryBlock) {
            block = 'try';
          } else if (child === ancestor.catchClause) {
            block = 'catch';
          } else if (child === ancestor.finallyBlock) {
            block = 'finally';
          }

          return {
            tryStatement: ancestor,
            block: nullThrows(
              block,
              'Child of a try statement must be a try block, catch clause, or finally block',
            ),
          };
        }
        child = ancestor;
        ancestor = ancestor.parent;
      }

      return undefined;
    }

    function removeAwait(
      fixer: TSESLint.RuleFixer,
      node: TSESTree.Expression,
    ): TSESLint.RuleFix | null {
      // Should always be an await node; but let's be safe.
      /* istanbul ignore if */ if (!isAwaitExpression(node)) {
        return null;
      }

      const awaitToken = context.sourceCode.getFirstToken(node, isAwaitKeyword);
      // Should always be the case; but let's be safe.
      /* istanbul ignore if */ if (!awaitToken) {
        return null;
      }

      const startAt = awaitToken.range[0];
      let endAt = awaitToken.range[1];
      // Also remove any extraneous whitespace after `await`, if there is any.
      const nextToken = context.sourceCode.getTokenAfter(awaitToken, {
        includeComments: true,
      });
      if (nextToken) {
        endAt = nextToken.range[0];
      }

      return fixer.removeRange([startAt, endAt]);
    }

    function insertAwait(
      fixer: TSESLint.RuleFixer,
      node: TSESTree.Expression,
      isHighPrecendence: boolean,
    ): TSESLint.RuleFix | TSESLint.RuleFix[] {
      if (isHighPrecendence) {
        return fixer.insertTextBefore(node, 'await ');
      }
      return [
        fixer.insertTextBefore(node, 'await ('),
        fixer.insertTextAfter(node, ')'),
      ];
    }

    function isHigherPrecedenceThanAwait(node: ts.Node): boolean {
      const operator = ts.isBinaryExpression(node)
        ? node.operatorToken.kind
        : ts.SyntaxKind.Unknown;
      const nodePrecedence = getOperatorPrecedence(node.kind, operator);
      const awaitPrecedence = getOperatorPrecedence(
        ts.SyntaxKind.AwaitExpression,
        ts.SyntaxKind.Unknown,
      );
      return nodePrecedence > awaitPrecedence;
    }

    function test(node: TSESTree.Expression, expression: ts.Node): void {
      let child: ts.Node;

      const isAwait = ts.isAwaitExpression(expression);

      if (isAwait) {
        child = expression.getChildAt(1);
      } else {
        child = expression;
      }

      const type = checker.getTypeAtLocation(child);
      const isThenable = tsutils.isThenableType(checker, expression, type);

      // handle awaited _non_thenables

      if (!isThenable) {
        if (isAwait) {
          // any/unknown could be thenable; do not auto-fix
          const useAutoFix = !(isTypeAnyType(type) || isTypeUnknownType(type));

          context.report({
            messageId: 'nonPromiseAwait',
            node,
            ...fixOrSuggest(useAutoFix, {
              messageId: 'nonPromiseAwait',
              fix: fixer => removeAwait(fixer, node),
            }),
          });
        }
        return;
      }

      // At this point it's definitely a thenable.

      const affectsErrorHandling =
        affectsExplicitErrorHandling(expression) ||
        affectsExplicitResourceManagement(node);
      const useAutoFix = !affectsErrorHandling;

      const ruleConfiguration = getConfiguration(option as Option);

      const shouldAwaitInCurrentContext = affectsErrorHandling
        ? ruleConfiguration.errorHandlingContext
        : ruleConfiguration.ordinaryContext;

      switch (shouldAwaitInCurrentContext) {
        case "don't-care":
          break;
        case 'await':
          if (!isAwait) {
            context.report({
              messageId: 'requiredPromiseAwait',
              node,
              ...fixOrSuggest(useAutoFix, {
                messageId: 'requiredPromiseAwaitSuggestion',
                fix: fixer =>
                  insertAwait(
                    fixer,
                    node,
                    isHigherPrecedenceThanAwait(expression),
                  ),
              }),
            });
          }
          break;
        case 'no-await':
          if (isAwait) {
            context.report({
              messageId: 'disallowedPromiseAwait',
              node,
              ...fixOrSuggest(useAutoFix, {
                messageId: 'disallowedPromiseAwaitSuggestion',
                fix: fixer => removeAwait(fixer, node),
              }),
            });
          }
          break;
      }
    }

    function findPossiblyReturnedNodes(
      node: TSESTree.Expression,
    ): TSESTree.Expression[] {
      if (node.type === AST_NODE_TYPES.ConditionalExpression) {
        return [
          ...findPossiblyReturnedNodes(node.alternate),
          ...findPossiblyReturnedNodes(node.consequent),
        ];
      }
      return [node];
    }

    return {
      FunctionDeclaration: enterFunction,
      FunctionExpression: enterFunction,
      ArrowFunctionExpression: enterFunction,

      'FunctionDeclaration:exit': exitFunction,
      'FunctionExpression:exit': exitFunction,
      'ArrowFunctionExpression:exit': exitFunction,

      // executes after less specific handler, so exitFunction is called
      'ArrowFunctionExpression[async = true]:exit'(
        node: TSESTree.ArrowFunctionExpression,
      ): void {
        if (node.body.type !== AST_NODE_TYPES.BlockStatement) {
          findPossiblyReturnedNodes(node.body).forEach(node => {
            const tsNode = services.esTreeNodeToTSNodeMap.get(node);
            test(node, tsNode);
          });
        }
      },
      ReturnStatement(node): void {
        const scopeInfo = scopeInfoStack.at(-1);
        if (!scopeInfo?.hasAsync || !node.argument) {
          return;
        }
        findPossiblyReturnedNodes(node.argument).forEach(node => {
          const tsNode = services.esTreeNodeToTSNodeMap.get(node);
          test(node, tsNode);
        });
      },
    };
  },
});

type WhetherToAwait = 'await' | 'no-await' | "don't-care";

interface RuleConfiguration {
  ordinaryContext: WhetherToAwait;
  errorHandlingContext: WhetherToAwait;
}

function getConfiguration(option: Option): RuleConfiguration {
  switch (option) {
    case 'always':
      return {
        ordinaryContext: 'await',
        errorHandlingContext: 'await',
      };
    case 'never':
      return {
        ordinaryContext: 'no-await',
        errorHandlingContext: 'no-await',
      };
    case 'error-handling-correctness-only':
      return {
        ordinaryContext: "don't-care",
        errorHandlingContext: 'await',
      };
    case 'in-try-catch':
      return {
        ordinaryContext: 'no-await',
        errorHandlingContext: 'await',
      };
  }
}

function fixOrSuggest<MessageId extends string>(
  useFix: boolean,
  suggestion: TSESLint.SuggestionReportDescriptor<MessageId>,
):
  | { fix: TSESLint.ReportFixFunction }
  | { suggest: TSESLint.SuggestionReportDescriptor<MessageId>[] } {
  return useFix ? { fix: suggestion.fix } : { suggest: [suggestion] };
}
