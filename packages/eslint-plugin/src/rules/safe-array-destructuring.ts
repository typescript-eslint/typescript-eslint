import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import * as tsutils from 'tsutils';
import * as util from '../util';

type MessageIds = 'unsafeArrayDestructuring' | 'unsafeDestructuringOfRestTuple';

export default util.createRule<[], MessageIds>({
  name: 'safe-array-destructuring',
  meta: {
    docs: {
      description: 'Restricts destructuring of tuple/arrays that may be empty',
      category: 'Best Practices',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      unsafeArrayDestructuring:
        'Destructuring an array cannot guarantee that an element is not undefined (use a tuple instead).',
      unsafeDestructuringOfRestTuple:
        'This element of destructuring is not guaranteed to be present, use a rest operator to retrieve it.',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      ArrayPattern(node): void {
        const expression = parserServices.esTreeNodeToTSNodeMap.get(node);
        const exprType = checker.getTypeAtLocation(expression);

        // The parent of an ArrayPattern can be `VariableDeclaration | ParameterDeclaration | BindingElement`
        // This simple implementation should work for all those cases without checking for them specifically

        if (checker.isArrayType(exprType)) {
          // Handle degenerate cases: `const [] = [1, 2]`
          if (node.elements.length === 0) {
            return;
          }

          context.report({
            node: node,
            messageId: 'unsafeArrayDestructuring',
          });
        }

        if (tsutils.isTupleTypeReference(exprType)) {
          const tupleType = exprType.target;
          const typeArguments = tupleType.typeArguments ?? [];

          // If there isn't a rest type present (e.g. `[string, ...number[]]`)
          // then it is a simple tuple type and TS can enforce it better than us
          if (!tupleType.hasRestElement) {
            return;
          }

          // Don't take into account the last element which is a rest element
          const numberOfFixedChildrenInType = typeArguments.length - 1;

          const lastNodeElement = node.elements[node.elements.length - 1];

          const lastNodeIsRestElement =
            lastNodeElement?.type === AST_NODE_TYPES.RestElement;

          // We take into account just the fixed destructured elements
          // So if the last one is destructured using a rest operator we don't count it
          // For example in the case:
          //    declare const tup : [string, ...number[]];
          //    const [a, b, c, ...arr] = tup;
          //    const [d, e, f] = tup;
          // in both cases we count just the first 3 elements
          const numberOfDestructuredChildren = lastNodeIsRestElement
            ? node.elements.length - 1
            : node.elements.length;

          if (numberOfDestructuredChildren > numberOfFixedChildrenInType) {
            // The error should be on the first fixed destructured element that
            // may be undefined, so that the user knows where to start trimming
            const reportingElement = node.elements[
              numberOfFixedChildrenInType
            ]!;

            context.report({
              node: reportingElement,
              messageId: 'unsafeDestructuringOfRestTuple',
            });
          }
        }
      },
    };
  },
});
