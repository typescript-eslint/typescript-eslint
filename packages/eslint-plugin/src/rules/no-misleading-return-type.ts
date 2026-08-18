import { createRule, getParserServices } from '../util';
import { createNoMisleadingReturnTypeAnalyzer } from './no-misleading-return-type-utils/analyzer';

export default createRule<[], 'misleadingReturnType'>({
  name: 'no-misleading-return-type',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow return type annotations that include types the function never returns',
      requiresTypeChecking: true,
    },
    messages: {
      misleadingReturnType:
        "Return type '{{annotated}}' includes '{{unused}}', which the function never returns.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    return createNoMisleadingReturnTypeAnalyzer(context, services);
  },
});
