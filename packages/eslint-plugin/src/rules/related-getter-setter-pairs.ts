import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule, getNameFromMember, getParserServices } from '../util';

type Method = TSESTree.MethodDefinition | TSESTree.TSMethodSignature;

type GetMethod = {
  kind: 'get';
  returnType: TSESTree.TSTypeAnnotation;
} & Method;

type GetMethodRaw = {
  returnType: TSESTree.TSTypeAnnotation | undefined;
} & GetMethod;

type SetMethod = { kind: 'set'; params: [TSESTree.Node] } & Method;

interface MethodPair {
  get?: GetMethod;
  set?: SetMethod;
}

export default createRule({
  name: 'related-getter-setter-pairs',
  meta: {
    type: 'problem',
    docs: {
      recommended: 'strict',
      description:
        'Enforce that `get()` types should be assignable to their equivalent `set()` type',
      requiresTypeChecking: true,
    },
    messages: {
      mismatch:
        '`get()` type should be assignable to its equivalent `set()` type.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    const methodPairsStack: Map<string, MethodPair>[] = [];

    function addPropertyNode(
      member: GetMethod | SetMethod,
      inner: TSESTree.Node,
      kind: 'get' | 'set',
    ): void {
      const methodPairs = methodPairsStack[methodPairsStack.length - 1];
      const { name } = getNameFromMember(member, context.sourceCode);

      methodPairs.set(name, {
        ...methodPairs.get(name),
        [kind]: inner,
      });
    }

    return {
      ':matches(ClassBody, TSInterfaceBody, TSTypeLiteral):exit'(): void {
        const methodPairs = methodPairsStack[methodPairsStack.length - 1];

        for (const pair of methodPairs.values()) {
          if (!pair.get || !pair.set) {
            continue;
          }

          const getter = pair.get;

          const getType = services.getTypeAtLocation(getter);
          const setType = services.getTypeAtLocation(pair.set.params[0]);

          if (!checker.isTypeAssignableTo(getType, setType)) {
            context.report({
              node: getter.returnType.typeAnnotation,
              messageId: 'mismatch',
            });
          }
        }

        methodPairsStack.pop();
      },
      ':matches(MethodDefinition, TSMethodSignature)[kind=get]'(
        node: GetMethodRaw,
      ): void {
        const getter = getMethodFromNode(node);

        if (getter.returnType) {
          addPropertyNode(node, getter, 'get');
        }
      },
      ':matches(MethodDefinition, TSMethodSignature)[kind=set]'(
        node: SetMethod,
      ): void {
        const setter = getMethodFromNode(node);

        if (setter.params.length === 1) {
          addPropertyNode(node, setter, 'set');
        }
      },

      'ClassBody, TSInterfaceBody, TSTypeLiteral'(): void {
        methodPairsStack.push(new Map());
      },
    };
  },
});

function getMethodFromNode(node: GetMethodRaw | SetMethod) {
  return node.type === AST_NODE_TYPES.TSMethodSignature ? node : node.value;
}
