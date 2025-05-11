import type * as TSESLint from '@typescript-eslint/types-eslint';
import type {
  ParserServices,
  ParserServicesWithTypeInformation,
} from '@typescript-eslint/types-eslint';

import { parserSeemsToBeTSESLint } from './parserSeemsToBeTSESLint';

const ERROR_MESSAGE_REQUIRES_PARSER_SERVICES =
  "You have used a rule which requires type information, but don't have parserOptions set to generate type information for this file. See https://typescript-eslint.io/getting-started/typed-linting for enabling linting with type information.";

const ERROR_MESSAGE_UNKNOWN_PARSER =
  'Note: detected a parser other than @typescript-eslint/parser. Make sure the parser is configured to forward "parserOptions.project" to @typescript-eslint/parser.';

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
): ParserServices;
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
): ParserServices;

export function getParserServices(
  context: Readonly<TSESLint.RuleContext<string, unknown[]>>,
  allowWithoutFullTypeInformation = false,
): ParserServices {
  const parser =
    context.parserPath || context.languageOptions.parser?.meta?.name;

  // This check is unnecessary if the user is using the latest version of our parser.
  //
  // However the world isn't perfect:
  // - Users often use old parser versions.
  //   Old versions of the parser would not return any parserServices unless parserOptions.project was set.
  // - Users sometimes use parsers that aren't @typescript-eslint/parser
  //   Other parsers won't return the parser services we expect (if they return any at all).
  //
  // This check allows us to handle bad user setups whilst providing a nice user-facing
  // error message explaining the problem.
  if (
    context.sourceCode.parserServices?.esTreeNodeToTSNodeMap == null ||
    context.sourceCode.parserServices.tsNodeToESTreeNodeMap == null
  ) {
    throwError(parser);
  }

  // if a rule requires full type information, then hard fail if it doesn't exist
  // this forces the user to supply parserOptions.project
  if (
    context.sourceCode.parserServices.program == null &&
    !allowWithoutFullTypeInformation
  ) {
    throwError(parser);
  }

  return context.sourceCode.parserServices as ParserServices;
}
/* eslint-enable @typescript-eslint/unified-signatures */

function throwError(parser: string | undefined): never {
  const messages = [
    ERROR_MESSAGE_REQUIRES_PARSER_SERVICES,
    `Parser: ${parser || '(unknown)'}`,
    !parserSeemsToBeTSESLint(parser) && ERROR_MESSAGE_UNKNOWN_PARSER,
  ].filter(Boolean);

  throw new Error(messages.join('\n'));
}
