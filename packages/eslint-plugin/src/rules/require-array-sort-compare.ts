import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as util from '../util';

export default util.createRule({
  name: 'require-array-sort-compare',
  defaultOptions: [],

  meta: {
    type: 'problem',
    docs: {
      description:
        'Requires `Array#sort` calls to always provide a `compareFunction`',
      category: 'Best Practices',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      requireCompare: "Require 'compare' argument.",
    },
    schema: [],
  },

  create(context) {
    const service = util.getParserServices(context);
    const checker = service.program.getTypeChecker();

    return {
      ":matches(CallExpression, OptionalCallExpression)[arguments.length=0] > :matches(MemberExpression, OptionalMemberExpression)[property.name='sort'][computed=false]"(
        callee: TSESTree.MemberExpression | TSESTree.OptionalMemberExpression,
      ): void {
        const tsNode = service.esTreeNodeToTSNodeMap.get(callee.object);
        const calleeObjType = util.getConstrainedTypeAtLocation(
          checker,
          tsNode,
        );

        if (util.isTypeArrayTypeOrUnionOfArrayTypes(calleeObjType, checker)) {
          context.report({ node: callee.parent!, messageId: 'requireCompare' });
        }
      },
    };
  },
});
