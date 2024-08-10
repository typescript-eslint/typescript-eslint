import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import type {
  ReportDescriptor,
  Scope,
} from '@typescript-eslint/utils/ts-eslint';
import * as tsutils from 'ts-api-utils';
import type * as ts from 'typescript';

import {
  createRule,
  getParserServices,
  getStaticValue,
  isParenlessArrowFunction,
  isRestParameterDeclaration,
  nullThrows,
} from '../util';

type MessageIds =
  | 'useUnknown'
  | 'useUnknownArrayDestructuringPattern'
  | 'useUnknownObjectDestructuringPattern'
  | 'addUnknownTypeAnnotationSuggestion'
  | 'addUnknownRestTypeAnnotationSuggestion'
  | 'wrongTypeAnnotationSuggestion'
  | 'wrongRestTypeAnnotationSuggestion';

const useUnknownMessageBase =
  'Prefer the safe `: unknown` for a `{{method}}`{{append}} callback variable.';

export default createRule<[], MessageIds>({
  name: 'use-unknown-in-catch-callback-variable',
  meta: {
    docs: {
      description:
        'Enforce typing arguments in `.then()` and `.catch()` rejection callbacks as `unknown`',
      requiresTypeChecking: true,
      recommended: 'strict',
    },
    type: 'suggestion',
    messages: {
      useUnknown: useUnknownMessageBase,
      useUnknownArrayDestructuringPattern:
        useUnknownMessageBase + ' The thrown error may not be iterable.',
      useUnknownObjectDestructuringPattern:
        useUnknownMessageBase +
        ' The thrown error may be nullable, or may not have the expected shape.',
      addUnknownTypeAnnotationSuggestion:
        'Add an explicit `: unknown` type annotation to the rejection callback variable.',
      addUnknownRestTypeAnnotationSuggestion:
        'Add an explicit `: [unknown]` type annotation to the rejection callback rest variable.',
      wrongTypeAnnotationSuggestion:
        'Change existing type annotation to `: unknown`.',
      wrongRestTypeAnnotationSuggestion:
        'Change existing type annotation to `: [unknown]`.',
    },
    fixable: 'code',
    schema: [],
    hasSuggestions: true,
  },

  defaultOptions: [],

  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    type ArgumentIndexToCheck = 0 | 1;
    function getPromiseMethodInfo(node: TSESTree.Expression):
      | {
          argumentIndexToCheck: ArgumentIndexToCheck;
          messageData: Record<'method' | 'append', string>;
        }
      | false {
      if (node.type !== AST_NODE_TYPES.MemberExpression) {
        return false;
      }
      const methodsToCheck = [
        { method: 'catch', append: '' },
        { method: 'then', append: ' rejection' },
      ] as const;
      const argumentIndexToCheck = methodsToCheck.findIndex(({ method }) =>
        isStaticMemberAccessOfValue(node, method),
      ) as -1 | ArgumentIndexToCheck;
      if (argumentIndexToCheck === -1) {
        return false;
      }

      const objectTsNode = services.esTreeNodeToTSNodeMap.get(node.object);
      const tsNode = services.esTreeNodeToTSNodeMap.get(node);
      return (
        tsutils.isThenableType(
          checker,
          tsNode,
          checker.getTypeAtLocation(objectTsNode),
        ) && {
          argumentIndexToCheck,
          messageData: methodsToCheck[argumentIndexToCheck],
        }
      );
    }

    function isFlaggableHandlerType(type: ts.Type): boolean {
      for (const unionPart of tsutils.unionTypeParts(type)) {
        const callSignatures = tsutils.getCallSignaturesOfType(unionPart);
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

          const decl = firstParam.valueDeclaration;
          if (decl != null && isRestParameterDeclaration(decl)) {
            if (checker.isArrayType(firstParamType)) {
              firstParamType = checker.getTypeArguments(firstParamType)[0];
            } else if (checker.isTupleType(firstParamType)) {
              firstParamType = checker.getTypeArguments(firstParamType)[0];
            } else {
              // a rest arg that's not an array or tuple should definitely be flagged.
              return true;
            }
          }

          if (!tsutils.isIntrinsicUnknownType(firstParamType)) {
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
    function shouldFlagArgument(
      node: TSESTree.Expression | TSESTree.SpreadElement,
    ): boolean {
      const argument = services.esTreeNodeToTSNodeMap.get(node);
      const typeOfArgument = checker.getTypeAtLocation(argument);
      return isFlaggableHandlerType(typeOfArgument);
    }

    /**
     * Analyzes the syntax of the catch argument and makes a best effort to pinpoint
     * why it's reporting, and to come up with a suggested fix if possible.
     *
     * This function is explicitly operating under the assumption that the
     * rule _is reporting_, so it is not guaranteed to be sound to call otherwise.
     */
    function refineReportForNormalArgumentIfPossible(
      argument: TSESTree.Expression,
    ): undefined | Partial<ReportDescriptor<MessageIds>> {
      // Only know how to be helpful if a function literal has been provided.
      if (
        !(
          argument.type === AST_NODE_TYPES.ArrowFunctionExpression ||
          argument.type === AST_NODE_TYPES.FunctionExpression
        )
      ) {
        return undefined;
      }

      const catchVariableOuterWithIncorrectTypes = nullThrows(
        argument.params.at(0),
        'There should have been at least one parameter for the rule to have flagged.',
      );

      // Function expressions can't have parameter properties; those only exist in constructors.
      const catchVariableOuter =
        catchVariableOuterWithIncorrectTypes as Exclude<
          typeof catchVariableOuterWithIncorrectTypes,
          TSESTree.TSParameterProperty
        >;
      const catchVariableInner =
        catchVariableOuter.type === AST_NODE_TYPES.AssignmentPattern
          ? catchVariableOuter.left
          : catchVariableOuter;

      switch (catchVariableInner.type) {
        case AST_NODE_TYPES.Identifier: {
          const catchVariableTypeAnnotation = catchVariableInner.typeAnnotation;
          if (catchVariableTypeAnnotation == null) {
            return {
              node: catchVariableOuter,
              suggest: [
                {
                  messageId: 'addUnknownTypeAnnotationSuggestion',
                  fix: (fixer: TSESLint.RuleFixer): TSESLint.RuleFix[] => {
                    if (
                      argument.type ===
                        AST_NODE_TYPES.ArrowFunctionExpression &&
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
        }
        case AST_NODE_TYPES.ArrayPattern: {
          return {
            node: catchVariableOuter,
            messageId: 'useUnknownArrayDestructuringPattern',
          };
        }
        case AST_NODE_TYPES.ObjectPattern: {
          return {
            node: catchVariableOuter,
            messageId: 'useUnknownObjectDestructuringPattern',
          };
        }
        case AST_NODE_TYPES.RestElement: {
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
      }
    }

    return {
      CallExpression(node): void {
        const args = node.arguments;
        const promiseMethodInfo = getPromiseMethodInfo(node.callee);
        if (!promiseMethodInfo) {
          return;
        }
        const { argumentIndexToCheck, messageData } = promiseMethodInfo;

        for (const [i, argument] of args.entries()) {
          if (argument.type === AST_NODE_TYPES.SpreadElement) {
            return;
          }
          // Argument to check, and all arguments before it, are an "ordinary" argument (i.e. not a spread argument)
          // promise.catch(f), promise.catch(() => {}), promise.catch(<expression>, <<other-args>>)
          if (i === argumentIndexToCheck && shouldFlagArgument(argument)) {
            // We are now guaranteed to report, but we have a bit of work to do
            // to determine exactly where, and whether we can fix it.
            const overrides = refineReportForNormalArgumentIfPossible(argument);
            context.report({
              node: argument,
              messageId: 'useUnknown',
              data: messageData,
              ...overrides,
            });
          }
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
