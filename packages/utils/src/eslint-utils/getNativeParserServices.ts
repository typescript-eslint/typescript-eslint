import type * as TSESLint from '../ts-eslint';
import type { NativeParserServices } from '../ts-estree';

import { getParserServicesFromContext } from './getParserServicesFromContext';

/**
 * Retrieve experimental native parser services from context.
 * This will throw if they are not available.
 */
export function getNativeParserServices<
  MessageIds extends string,
  Options extends readonly unknown[],
>(
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
): NativeParserServices {
  const { parserServices } = getParserServicesFromContext(context);

  if (parserServices.backend !== 'native') {
    throw new Error('This rule requires experimental native parser services.');
  }

  return parserServices;
}
