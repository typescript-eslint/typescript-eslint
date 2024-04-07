import type { TSESTree } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  isTypeArrayTypeOrUnionOfArrayTypes,
  nullThrows,
} from '../util';

export default createRule({
  name: 'no-for-in-array',
  meta: {
    docs: {
      description: 'Disallow iterating over an array with a for-in loop',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    messages: {
      forInViolation:
        'For-in loops over arrays skips holes, returns indices as strings, and may visit the prototype chain or other enumerable properties. Use a more robust iteration method such as for-of or array.forEach instead.',
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],
  create(context) {
    function getReportLoc(
      forInNode: TSESTree.ForInStatement,
    ): TSESTree.SourceLocation {
      const closingParens = nullThrows(
        context.sourceCode.getTokenBefore(
          forInNode.body,
          token => token.value === ')',
        ),
        'for-in must have a closing parenthesis.',
      );
      return {
        start: structuredClone(forInNode.loc.start),
        end: structuredClone(closingParens.loc.end),
      };
    }

    return {
      ForInStatement(node): void {
        const services = getParserServices(context);
        const checker = services.program.getTypeChecker();

        const type = getConstrainedTypeAtLocation(services, node.right);

        if (
          isTypeArrayTypeOrUnionOfArrayTypes(type, checker) ||
          (type.flags & ts.TypeFlags.StringLike) !== 0
        ) {
          context.report({
            loc: getReportLoc(node),
            messageId: 'forInViolation',
          });
        }
      },
    };
  },
});
