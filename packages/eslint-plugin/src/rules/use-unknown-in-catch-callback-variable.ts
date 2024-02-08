import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import type {
  ReportDescriptor,
  Scope,
} from '@typescript-eslint/utils/ts-eslint';
import * as tsUtils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getParserServices,
  getStaticValue,
  isParenthesized,
  nullThrows,
} from '../util';

type MessageIds =
  | 'useUnknown'
  | 'useUnknownDestructuringPattern'
  | 'useUnknownSpreadArgs'
  | 'addUnknownTypeAnnotationSuggestion'
  | 'addUnknownRestTypeAnnotationSuggestion'
  | 'wrongTypeAnnotationSuggestion'
  | 'wrongRestTypeAnnotationSuggestion';

const useUnknownMessageBase =
  'Use the intrinsic `unknown` type for the catch callback variable.';

export default createRule<[], MessageIds>({
  name: 'use-unknown-in-catch-callback-variable',
  meta: {
    docs: {
      description: 'Enforce typing arguments in .catch() callbacks as unknown',
      requiresTypeChecking: true,
    },
    type: 'suggestion',
    messages: {
      useUnknown: useUnknownMessageBase,
      useUnknownDestructuringPattern:
        useUnknownMessageBase +
        ' A destructuring pattern makes assumptions about the object that may not be valid.',
      useUnknownSpreadArgs:
        useUnknownMessageBase +
        ' The argument list may contain a handler that does not use `unknown` for the catch variable.',
      addUnknownTypeAnnotationSuggestion:
        'Add an explicit `: unknown` type annotation to the catch variable.',
      addUnknownRestTypeAnnotationSuggestion:
        'Add an explicit `: [unknown]` type annotation to the catch rest variable.',
      wrongTypeAnnotationSuggestion:
        'Change existing type annotation to `: unknown`',
      wrongRestTypeAnnotationSuggestion:
        'Change existing type annotation to `: [unknown]`',
    },
    fixable: 'code',
    schema: [],
    hasSuggestions: true,
  },

  defaultOptions: [],

  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function isPromiseCatchAccess(node: TSESTree.Expression): boolean {
      if (
        !(
          node.type === AST_NODE_TYPES.MemberExpression &&
          isStaticMemberAccessOfValue(node, 'catch')
        )
      ) {
        return false;
      }

      const objectTsNode = services.esTreeNodeToTSNodeMap.get(node.object);
      const tsNode = services.esTreeNodeToTSNodeMap.get(node);

      return tsUtils.isThenableType(
        checker,
        tsNode,
        checker.getTypeAtLocation(objectTsNode),
      );
    }

    function isFlaggableHandlerType(type: ts.Type): boolean {
      for (const unionPart of tsUtils.unionTypeParts(type)) {
        const callSignatures = tsUtils.getCallSignaturesOfType(unionPart);
        if (callSignatures.length === 0) {
          // Ignore any non-function components to the type. Those are not this rule's problem.
          continue;
        }

        for (const callSignature of callSignatures) {
          const firstParam = callSignature.parameters.at(0);
          if (!firstParam) {
            // it's not an issue if there's no catch variable at all.
            continue;
          }

          let firstParamType = checker.getTypeOfSymbol(firstParam);

          // Deal with a rest arg.
          const decl = firstParam.valueDeclaration;
          if (decl != null && ts.isParameter(decl) && decl.dotDotDotToken) {
            if (checker.isArrayType(firstParamType)) {
              firstParamType = checker.getTypeArguments(firstParamType)[0];
            } else if (checker.isTupleType(firstParamType)) {
              firstParamType = checker.getTypeArguments(firstParamType)[0];
            } else {
              // a rest arg that's not an array or tuple should definitely be flagged.
              return true;
            }
          }

          if (!tsUtils.isIntrinsicUnknownType(firstParamType)) {
            return true;
          }
        }
      }

      return false;
    }

    /**
     * If passed an ordinary expression, this will check it as expected.
     *
     * If passed a spread element, it treats it as the union of unwrapped array/tuple type.
     */
    function checkWhetherShouldFlagArgument(
      node: TSESTree.Expression | TSESTree.SpreadElement,
    ): boolean {
      const argument = services.esTreeNodeToTSNodeMap.get(node);
      const typeOfArgument = checker.getTypeAtLocation(argument);
      return isFlaggableHandlerType(typeOfArgument);
    }

    function checkWhetherShouldFlagMultipleSpreadArgs(
      argumentsList: TSESTree.CallExpressionArgument[],
    ): boolean {
      // One could try to be clever about unpacking fixed length tuples and stuff
      // like that, but there's no need, since this is all invalid use of `.catch`
      // anyway at the end of the day. Instead, we'll just check whether any of the
      // possible args types would violate the rule on its own.
      return argumentsList.some(argument =>
        checkWhetherShouldFlagArgument(argument),
      );
    }

    function checkWhetherShouldFlagSingleSpreadArg(
      node: TSESTree.SpreadElement,
    ): boolean {
      const spreadArgs = services.esTreeNodeToTSNodeMap.get(node.argument);

      const spreadArgsType = checker.getTypeAtLocation(spreadArgs);

      if (checker.isArrayType(spreadArgsType)) {
        const arrayType = checker.getTypeArguments(spreadArgsType)[0];
        return isFlaggableHandlerType(arrayType);
      }

      if (checker.isTupleType(spreadArgsType)) {
        const firstType = checker.getTypeArguments(spreadArgsType).at(0);
        if (!firstType) {
          // empty spread args. Suspect code, but not a problem for this rule.
          return false;
        }
        return isFlaggableHandlerType(firstType);
      }

      return true;
    }

    function refineReportForNormalArgumentIfPossible(
      argument: TSESTree.Expression,
    ): undefined | Partial<ReportDescriptor<MessageIds>> {
      // This function is explicitly operating under the assumption that the
      // rule *is reporting*.
      //
      // The goal here is to analyze the syntax and make a best effort to pinpoint
      // why it's reporting, and come up with a suggested fix if we can.

      // Only care to be helpful if a function literal has been provided.
      if (
        !(
          argument.type === AST_NODE_TYPES.ArrowFunctionExpression ||
          argument.type === AST_NODE_TYPES.FunctionExpression
        )
      ) {
        return undefined;
      }

      // Shouldn't be reachable, since function literals without an argument
      // should not cause the rule to report, but if it does happen, fail gracefully.
      /* istanbul ignore if */
      if (argument.params.length < 1) {
        return undefined;
      }

      const catchVariableOuter = argument.params[0];
      const catchVariableInner =
        catchVariableOuter.type === AST_NODE_TYPES.AssignmentPattern
          ? catchVariableOuter.left
          : catchVariableOuter;

      if (catchVariableInner.type === AST_NODE_TYPES.Identifier) {
        const catchVariableTypeAnnotation = catchVariableInner.typeAnnotation;
        if (catchVariableTypeAnnotation == null) {
          return {
            node: catchVariableOuter,
            suggest: [
              {
                messageId: 'addUnknownTypeAnnotationSuggestion',
                fix: (fixer: TSESLint.RuleFixer): TSESLint.RuleFix[] => {
                  if (
                    argument.type === AST_NODE_TYPES.ArrowFunctionExpression &&
                    isParenlessArrowFunction(argument, context.sourceCode)
                  ) {
                    return [
                      fixer.insertTextBefore(catchVariableInner, '('),
                      fixer.insertTextAfter(catchVariableInner, ': unknown)'),
                    ];
                  }

                  return [
                    fixer.insertTextAfter(catchVariableInner, ': unknown'),
                  ];
                },
              },
            ],
          };
        }

        return {
          node: catchVariableOuter,
          suggest: [
            {
              messageId: 'wrongTypeAnnotationSuggestion',
              fix: (fixer: TSESLint.RuleFixer): TSESLint.RuleFix =>
                fixer.replaceText(catchVariableTypeAnnotation, ': unknown'),
            },
          ],
        };
      } else if (
        catchVariableInner.type === AST_NODE_TYPES.ArrayPattern ||
        catchVariableInner.type === AST_NODE_TYPES.ObjectPattern
      ) {
        return {
          node: catchVariableOuter,
          messageId: 'useUnknownDestructuringPattern',
        };
      } else if (catchVariableInner.type === AST_NODE_TYPES.RestElement) {
        const catchVariableTypeAnnotation = catchVariableInner.typeAnnotation;
        if (catchVariableTypeAnnotation == null) {
          return {
            node: catchVariableOuter,
            suggest: [
              {
                messageId: 'addUnknownRestTypeAnnotationSuggestion',
                fix: (fixer): TSESLint.RuleFix =>
                  fixer.insertTextAfter(catchVariableInner, ': [unknown]'),
              },
            ],
          };
        }
        return {
          node: catchVariableOuter,
          suggest: [
            {
              messageId: 'wrongRestTypeAnnotationSuggestion',
              fix: (fixer): TSESLint.RuleFix =>
                fixer.replaceText(catchVariableTypeAnnotation, ': [unknown]'),
            },
          ],
        };
      }

      // No need to handle any other case.
      /* istanbul ignore next */
      return undefined;
    }

    return {
      CallExpression(node): void {
        // If there's no arguments, this rule doesn't apply.
        if (node.arguments.length === 0) {
          return;
        }

        if (!isPromiseCatchAccess(node.callee)) {
          return;
        }

        const firstArgument = node.arguments[0];

        // Deal with some special cases around spread element
        if (firstArgument.type === AST_NODE_TYPES.SpreadElement) {
          if (node.arguments.length === 1) {
            if (checkWhetherShouldFlagSingleSpreadArg(firstArgument)) {
              context.report({
                node: firstArgument,
                messageId: 'useUnknown',
              });
            }
          } else {
            if (checkWhetherShouldFlagMultipleSpreadArgs(node.arguments)) {
              context.report({
                node,
                messageId: 'useUnknownSpreadArgs',
              });
            }
          }
          return;
        }

        // Normal cases.
        if (checkWhetherShouldFlagArgument(firstArgument)) {
          // We are now guaranteed to report, but we have a bit of work to do
          // to determine exactly where, and whether we can fix it.
          const overrides =
            refineReportForNormalArgumentIfPossible(firstArgument);
          context.report({
            node: firstArgument,
            messageId: 'useUnknown',
            ...overrides,
          });
          return;
        }
      },
    };
  },
});

/**
 * Answers whether the member expression looks like
 * `x.memberName`, `x['memberName']`,
 * or even `const mn = 'memberName'; x[mn]` (or optional variants thereof).
 */
function isStaticMemberAccessOfValue(
  memberExpression:
    | TSESTree.MemberExpressionComputedName
    | TSESTree.MemberExpressionNonComputedName,
  value: string,
  scope?: Scope.Scope | undefined,
): boolean {
  if (!memberExpression.computed) {
    // x.memberName case.
    return memberExpression.property.name === value;
  }

  // x['memberName'] cases.
  const staticValueResult = getStaticValue(memberExpression.property, scope);
  return staticValueResult != null && value === staticValueResult.value;
}

function isParenlessArrowFunction(
  node: TSESTree.ArrowFunctionExpression,
  sourceCode: TSESLint.SourceCode,
): boolean {
  return (
    node.params.length === 1 && !isParenthesized(node.params[0], sourceCode)
  );
}
