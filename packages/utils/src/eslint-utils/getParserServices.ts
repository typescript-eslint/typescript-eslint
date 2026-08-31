import type * as TSESLint from '../ts-eslint';
import type {
  ClassicParserServices,
  ParserServicesWithTypeInformation,
} from '../ts-estree';

import {
  getParserServicesFromContext,
  throwParserServicesError,
} from './getParserServicesFromContext';

/* eslint-disable @typescript-eslint/unified-signatures */
/**
 * Try to retrieve type-aware parser service from context.
 * This **_will_** throw if it is not available.
 */
export function getParserServices<
  MessageIds extends string,
  Options extends readonly unknown[],
>(
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
): ParserServicesWithTypeInformation;
/**
 * Try to retrieve type-aware parser service from context.
 * This **_will_** throw if it is not available.
 */
export function getParserServices<
  MessageIds extends string,
  Options extends readonly unknown[],
>(
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
  allowWithoutFullTypeInformation: false,
): ParserServicesWithTypeInformation;
/**
 * Try to retrieve type-aware parser service from context.
 * This **_will not_** throw if it is not available.
 */
export function getParserServices<
  MessageIds extends string,
  Options extends readonly unknown[],
>(
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
  allowWithoutFullTypeInformation: true,
): ClassicParserServices;
/**
 * Try to retrieve type-aware parser service from context.
 * This may or may not throw if it is not available, depending on if `allowWithoutFullTypeInformation` is `true`
 */
export function getParserServices<
  MessageIds extends string,
  Options extends readonly unknown[],
>(
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
  allowWithoutFullTypeInformation: boolean,
): ClassicParserServices;

export function getParserServices(
  context: Readonly<TSESLint.RuleContext<string, unknown[]>>,
  allowWithoutFullTypeInformation = false,
): ClassicParserServices {
  const { parser, parserServices } = getParserServicesFromContext(context);

  if (parserServices.backend === 'native') {
    throw new Error(
      'This rule requires classic TypeScript parser services, but the experimental native backend is enabled.',
    );
  }

  // if a rule requires full type information, then hard fail if it doesn't exist
  // this forces the user to supply parserOptions.project
  if (!allowWithoutFullTypeInformation && parserServices.program == null) {
    throwParserServicesError(parser);
  }

  return parserServices;
}
/* eslint-enable @typescript-eslint/unified-signatures */
