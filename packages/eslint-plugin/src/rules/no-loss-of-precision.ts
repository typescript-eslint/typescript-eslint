import { TSESTree } from '@typescript-eslint/experimental-utils';
import BaseRule from 'eslint/lib/rules/no-loss-of-precision';
import * as util from '../util';

const baseRule = ((): typeof BaseRule | null => {
  try {
    return require('eslint/lib/rules/no-loss-of-precision');
  } catch {
    /* istanbul ignore next */
    return null;
  }
})();

type Options = util.InferOptionsTypeFromRule<typeof BaseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof BaseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'no-loss-of-precision',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow literal numbers that lose precision',
      category: 'Possible Errors',
      recommended: false,
      extendsBaseRule: true,
    },
    schema: [],
    messages: baseRule?.meta.messages ?? { noLossOfPrecision: '' },
  },
  defaultOptions: [],
  create(context) {
    /* istanbul ignore if */ if (baseRule === null) {
      throw new Error(
        '@typescript-eslint/no-loss-of-precision requires at least ESLint v7.1.0',
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const rules = baseRule!.create(context);

    function isSeperatedNumeric(node: TSESTree.Literal): boolean {
      return typeof node.value === 'number' && node.raw.includes('_');
    }
    return {
      Literal(node: TSESTree.Literal): void {
        rules.Literal({
          ...node,
          raw: isSeperatedNumeric(node) ? node.raw.replace(/_/g, '') : node.raw,
        });
      },
    };
  },
});
