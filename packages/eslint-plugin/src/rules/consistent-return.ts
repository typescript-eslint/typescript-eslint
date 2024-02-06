import { type TSESTree } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../util';
import { createRule, getParserServices, isTypeFlagSet } from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('consistent-return');

type Options = InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

type FunctionNode =
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.ArrowFunctionExpression;

export default createRule<Options, MessageIds>({
  name: 'consistent-return',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require `return` statements to either always or never specify values',
      extendsBaseRule: true,
      requiresTypeChecking: true,
    },
    hasSuggestions: baseRule.meta.hasSuggestions,
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages,
  },
  defaultOptions: [{ treatUndefinedAsUnspecified: false }],
  create(context, [options]) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    const rules = baseRule.create(context);
    const functions: FunctionNode[] = [];
    const treatUndefinedAsUnspecified =
      options?.treatUndefinedAsUnspecified === true;

    function enterFunction(node: FunctionNode): void {
      functions.push(node);
    }

    function exitFunction(): void {
      functions.pop();
    }

    function getCurrentFunction(): FunctionNode | null {
      return functions[functions.length - 1] ?? null;
    }

    function isPromiseVoid(node: ts.Node, type: ts.Type): boolean {
      if (
        tsutils.isThenableType(checker, node, type) &&
        tsutils.isTypeReference(type)
      ) {
        const awaitedType = type.typeArguments?.[0];
        if (awaitedType) {
          if (isTypeFlagSet(awaitedType, ts.TypeFlags.Void)) {
            return true;
          }
          return isPromiseVoid(node, awaitedType);
        }
      }
      return false;
    }

    function isReturnVoidOrThenableVoid(node: FunctionNode): boolean {
      const functionType = services.getTypeAtLocation(node);
      const tsNode = services.esTreeNodeToTSNodeMap.get(node);
      const callSignatures = functionType.getCallSignatures();

      return callSignatures.some(signature => {
        const returnType = signature.getReturnType();
        if (node.async) {
          return isPromiseVoid(tsNode, returnType);
        }
        return isTypeFlagSet(returnType, ts.TypeFlags.Void);
      });
    }

    return {
      ...rules,
      FunctionDeclaration: enterFunction,
      'FunctionDeclaration:exit'(node): void {
        exitFunction();
        rules['FunctionDeclaration:exit'](node);
      },
      FunctionExpression: enterFunction,
      'FunctionExpression:exit'(node): void {
        exitFunction();
        rules['FunctionExpression:exit'](node);
      },
      ArrowFunctionExpression: enterFunction,
      'ArrowFunctionExpression:exit'(node): void {
        exitFunction();
        rules['ArrowFunctionExpression:exit'](node);
      },
      ReturnStatement(node): void {
        const functionNode = getCurrentFunction();
        if (
          !node.argument &&
          functionNode &&
          isReturnVoidOrThenableVoid(functionNode)
        ) {
          return;
        }
        if (treatUndefinedAsUnspecified && node.argument) {
          const returnValueType = services.getTypeAtLocation(node.argument);
          if (returnValueType.flags === ts.TypeFlags.Undefined) {
            rules.ReturnStatement({
              ...node,
              argument: null,
            });
            return;
          }
        }

        rules.ReturnStatement(node);
      },
    };
  },
});
