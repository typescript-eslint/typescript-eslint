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
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    const rules = baseRule.create(context);

    let functionNode: FunctionNode | null;

    function setFunctionNode(node: FunctionNode): void {
      functionNode = node;
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
      FunctionDeclaration: setFunctionNode,
      FunctionExpression: setFunctionNode,
      ArrowFunctionExpression: setFunctionNode,
      ReturnStatement(node): void {
        if (!node.argument && functionNode) {
          if (isReturnVoidOrThenableVoid(functionNode)) {
            return;
          }
        }
        rules.ReturnStatement(node);
      },
    };
  },
});
