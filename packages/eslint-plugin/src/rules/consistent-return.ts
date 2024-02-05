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

    function isReturnPromiseVoid(
      node: FunctionNode,
      signature: ts.Signature,
    ): boolean {
      const tsNode = services.esTreeNodeToTSNodeMap.get(node);
      const returnType = signature.getReturnType();
      if (
        tsutils.isThenableType(checker, tsNode, returnType) &&
        tsutils.isTypeReference(returnType)
      ) {
        const typeArgs = returnType.typeArguments;
        const hasVoid = !!typeArgs?.some(typeArg =>
          isTypeFlagSet(typeArg, ts.TypeFlags.Void),
        );
        return hasVoid;
      }
      return false;
    }

    function isReturnVoidOrThenableVoid(node: FunctionNode): boolean {
      const functionType = services.getTypeAtLocation(node);
      const callSignatures = functionType.getCallSignatures();

      return callSignatures.some(signature => {
        if (node.async) {
          return isReturnPromiseVoid(node, signature);
        }
        const returnType = signature.getReturnType();
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
