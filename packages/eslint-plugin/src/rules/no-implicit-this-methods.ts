import { createRule } from '../util';
import {
  Property,
  FunctionExpression,
  Node,
  MethodDefinition,
} from '../../../typescript-estree/dist/ts-estree/ts-estree';
import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';

export type MessageId = 'implicitThis';

export default createRule({
  name: 'no-implicit-this-methods',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Requires explicit this type annotations for class and object methods',
      category: 'Best Practices',
      recommended: false,
      requiresTypeChecking: false,
    },
    schema: [],
    messages: {
      implicitThis: '',
    },
  },
  defaultOptions: [],
  create(context) {
    const methodStack = [{ usesThis: false }];

    const isConstructor = (node: Property | MethodDefinition): boolean =>
      node.key.type === 'Identifier' && node.key.name === 'constructor';

    const isFunctionExpression = (node: Node): node is FunctionExpression =>
      node.type === AST_NODE_TYPES.FunctionExpression;

    const hasExplicitThisParam = ({
      params: [maybeThisParam],
    }: FunctionExpression): boolean =>
      maybeThisParam &&
      maybeThisParam.type === 'Identifier' &&
      maybeThisParam.name === 'this';

    const checkMethodForImplicitThis = (
      node: Property | MethodDefinition,
    ): void => {
      if (isFunctionExpression(node.value) && !isConstructor(node)) {
        if (
          methodStack.shift()!.usesThis &&
          !hasExplicitThisParam(node.value)
        ) {
          context.report({ node: node.value, messageId: 'implicitThis' });
        }
      }
    };

    return {
      ThisExpression: (): void => {
        methodStack[0].usesThis = true;
      },
      Property: (node): void => {
        if (isFunctionExpression(node.value) && !isConstructor(node)) {
          methodStack.unshift({ usesThis: false });
        }
      },
      'Property:exit': checkMethodForImplicitThis as never, // the types don't support ":exit" methods
      MethodDefinition: (node): void => {
        if (isFunctionExpression(node.value) && !isConstructor(node)) {
          methodStack.unshift({ usesThis: false });
        }
      },
      'MethodDefinition:exit': checkMethodForImplicitThis as never, // the types don't support ":exit" methods
    };
  },
});
