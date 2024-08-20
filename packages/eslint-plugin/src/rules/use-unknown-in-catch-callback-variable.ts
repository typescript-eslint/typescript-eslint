import type { Scope } from '@typescript-eslint/scope-manager';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type { ReportDescriptor } from '@typescript-eslint/utils/ts-eslint';
import type * as ts from 'typescript';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';

import {
  createRule,
  getParserServices,
  getStaticValue,
  isParenlessArrowFunction,
  isRestParameterDeclaration,
  nullThrows,
} from '../util';

type MessageIds =
  | 'addUnknownRestTypeAnnotationSuggestion'
  | 'addUnknownTypeAnnotationSuggestion'
  | 'useUnknown'
  | 'useUnknownArrayDestructuringPattern'
  | 'useUnknownObjectDestructuringPattern'
  | 'wrongRestTypeAnnotationSuggestion'
  | 'wrongTypeAnnotationSuggestion';

const useUnknownMessageBase =
  'Prefer the safe `: unknown` for a `{{method}}`{{append}} callback variable.';

/**
 * `x.memberName` => 'memberKey'
 *
 * `const mk = 'memberKey'; x[mk]` => 'memberKey'
 *
 * `const mk = 1234; x[mk]` => 1234
 */
const getStaticMemberAccessKey = (
  { computed, property }: TSESTree.MemberExpression,
  scope: Scope,
): { value: unknown } | null =>
  computed ? getStaticValue(property, scope) : { value: property.name };

export default createRule<[], MessageIds>({
  create(context) {
    const { esTreeNodeToTSNodeMap, program } = getParserServices(context);
    const checker = program.getTypeChecker();

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

    function shouldFlagArgument(node: TSESTree.Expression): boolean {
      const argument = esTreeNodeToTSNodeMap.get(node);
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
    function refineReportIfPossible(
      argument: TSESTree.Expression,
    ): Partial<ReportDescriptor<MessageIds>> | undefined {
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
                  messageId: 'addUnknownTypeAnnotationSuggestion',
                },
              ],
            };
          }

          return {
            node: catchVariableOuter,
            suggest: [
              {
                fix: (fixer: TSESLint.RuleFixer): TSESLint.RuleFix =>
                  fixer.replaceText(catchVariableTypeAnnotation, ': unknown'),
                messageId: 'wrongTypeAnnotationSuggestion',
              },
            ],
          };
        }
        case AST_NODE_TYPES.ArrayPattern: {
          return {
            messageId: 'useUnknownArrayDestructuringPattern',
            node: catchVariableOuter,
          };
        }
        case AST_NODE_TYPES.ObjectPattern: {
          return {
            messageId: 'useUnknownObjectDestructuringPattern',
            node: catchVariableOuter,
          };
        }
        case AST_NODE_TYPES.RestElement: {
          const catchVariableTypeAnnotation = catchVariableInner.typeAnnotation;
          if (catchVariableTypeAnnotation == null) {
            return {
              node: catchVariableOuter,
              suggest: [
                {
                  fix: (fixer): TSESLint.RuleFix =>
                    fixer.insertTextAfter(catchVariableInner, ': [unknown]'),
                  messageId: 'addUnknownRestTypeAnnotationSuggestion',
                },
              ],
            };
          }
          return {
            node: catchVariableOuter,
            suggest: [
              {
                fix: (fixer): TSESLint.RuleFix =>
                  fixer.replaceText(catchVariableTypeAnnotation, ': [unknown]'),
                messageId: 'wrongRestTypeAnnotationSuggestion',
              },
            ],
          };
        }
      }
    }

    return {
      CallExpression({ arguments: args, callee }): void {
        if (callee.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }

        const staticMemberAccessKey = getStaticMemberAccessKey(
          callee,
          context.sourceCode.getScope(callee),
        );
        if (!staticMemberAccessKey) {
          return;
        }

        const promiseMethodInfo = (
          [
            { append: '', argIndexToCheck: 0, method: 'catch' },
            { append: ' rejection', argIndexToCheck: 1, method: 'then' },
          ] satisfies {
            append: string;
            argIndexToCheck: number;
            method: string;
          }[]
        ).find(({ method }) => staticMemberAccessKey.value === method);
        if (!promiseMethodInfo) {
          return;
        }

        // Need to be enough args to check
        const { argIndexToCheck, ...data } = promiseMethodInfo;
        if (args.length < argIndexToCheck + 1) {
          return;
        }

        // Argument to check, and all arguments before it, must be "ordinary" arguments (i.e. no spread arguments)
        // promise.catch(f), promise.catch(() => {}), promise.catch(<expression>, <<other-args>>)
        const argsToCheck = args.slice(0, argIndexToCheck + 1);
        if (
          argsToCheck.some(({ type }) => type === AST_NODE_TYPES.SpreadElement)
        ) {
          return;
        }

        if (
          !tsutils.isThenableType(
            checker,
            esTreeNodeToTSNodeMap.get(callee),
            checker.getTypeAtLocation(esTreeNodeToTSNodeMap.get(callee.object)),
          )
        ) {
          return;
        }

        // the `some` check above has already excluded `SpreadElement`, so we are safe to assert the same
        const node = argsToCheck[argIndexToCheck] as Exclude<
          (typeof argsToCheck)[number],
          TSESTree.SpreadElement
        >;
        if (shouldFlagArgument(node)) {
          // We are now guaranteed to report, but we have a bit of work to do
          // to determine exactly where, and whether we can fix it.
          const overrides = refineReportIfPossible(node);
          context.report({
            data,
            messageId: 'useUnknown',
            node,
            ...overrides,
          });
        }
      },
    };
  },
  defaultOptions: [],

  meta: {
    docs: {
      description:
        'Enforce typing arguments in Promise rejection callbacks as `unknown`',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    hasSuggestions: true,
    messages: {
      addUnknownRestTypeAnnotationSuggestion:
        'Add an explicit `: [unknown]` type annotation to the rejection callback rest variable.',
      addUnknownTypeAnnotationSuggestion:
        'Add an explicit `: unknown` type annotation to the rejection callback variable.',
      useUnknown: useUnknownMessageBase,
      useUnknownArrayDestructuringPattern: `${useUnknownMessageBase} The thrown error may not be iterable.`,
      useUnknownObjectDestructuringPattern: `${
        useUnknownMessageBase
      } The thrown error may be nullable, or may not have the expected shape.`,
      wrongRestTypeAnnotationSuggestion:
        'Change existing type annotation to `: [unknown]`.',
      wrongTypeAnnotationSuggestion:
        'Change existing type annotation to `: unknown`.',
    },
    schema: [],
    type: 'suggestion',
  },

  name: 'use-unknown-in-catch-callback-variable',
});
