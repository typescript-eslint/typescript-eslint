/**
 * @fileoverview Disallow iterating over an array with a for-in loop
 * @author Benjamin Lichtman
 */

import { TSESTree } from '@typescript-eslint/typescript-estree';
import ts from 'typescript';
import * as util from '../util';

export default util.createRule({
  name: 'no-for-in-array',
  meta: {
    docs: {
      description: 'Disallow iterating over an array with a for-in loop',
      category: 'Best Practices',
      recommended: false,
      tslintName: 'no-for-in-array',
    },
    messages: {
      forInViolation:
        'For-in loops over arrays are forbidden. Use for-of or array.forEach instead.',
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],
  create(context) {
    return {
      ForInStatement(node: TSESTree.ForInStatement) {
        const parserServices = util.getParserServices(context);
        const checker = parserServices.program.getTypeChecker();
        const originalNode = parserServices.esTreeNodeToTSNodeMap.get<
          ts.ForInStatement
        >(node);

        const type = checker.getTypeAtLocation(originalNode.expression);

        if (
          (typeof type.symbol !== 'undefined' &&
            type.symbol.name === 'Array') ||
          (type.flags & ts.TypeFlags.StringLike) !== 0
        ) {
          context.report({
            node,
            messageId: 'forInViolation',
          });
        }
      },
    };
  },
});
