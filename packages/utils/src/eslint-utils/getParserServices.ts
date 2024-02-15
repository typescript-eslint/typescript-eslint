import { parse } from 'path';

import type * as TSESLint from '../ts-eslint';
import type {
  ParserServices,
  ParserServicesWithTypeInformation,
} from '../ts-estree';
import { parserPathSeemsToBeTSESLint } from './parserPathSeemsToBeTSESLint';

const ERROR_MESSAGE_REQUIRES_PARSER_SERVICES =
  'You have used a rule which requires parserServices to be generated. You must therefore provide a value for the "parserOptions.project" property for @typescript-eslint/parser.';

const ERROR_MESSAGE_UNKNOWN_PARSER =
  'Note: detected a parser other than @typescript-eslint/parser. Make sure the parser is configured to forward "parserOptions.project" to @typescript-eslint/parser.';

/* eslint-disable @typescript-eslint/unified-signatures */
/**
 * Try to retrieve type-aware parser service from context.
 * This **_will_** throw if it is not available.
 */
function getParserServices<
  TMessageIds extends string,
  TOptions extends readonly unknown[],
>(
  context: Readonly<TSESLint.RuleContext<TMessageIds, TOptions>>,
): ParserServicesWithTypeInformation;
/**
 * Try to retrieve type-aware parser service from context.
 * This **_will_** throw if it is not available.
 */
function getParserServices<
  TMessageIds extends string,
  TOptions extends readonly unknown[],
>(
  context: Readonly<TSESLint.RuleContext<TMessageIds, TOptions>>,
  allowWithoutFullTypeInformation: false,
): ParserServicesWithTypeInformation;
/**
 * Try to retrieve type-aware parser service from context.
 * This **_will not_** throw if it is not available.
 */
function getParserServices<
  TMessageIds extends string,
  TOptions extends readonly unknown[],
>(
  context: Readonly<TSESLint.RuleContext<TMessageIds, TOptions>>,
  allowWithoutFullTypeInformation: true,
): ParserServices;
/**
 * Try to retrieve type-aware parser service from context.
 * This may or may not throw if it is not available, depending on if `allowWithoutFullTypeInformation` is `true`
 */
function getParserServices<
  TMessageIds extends string,
  TOptions extends readonly unknown[],
>(
  context: Readonly<TSESLint.RuleContext<TMessageIds, TOptions>>,
  allowWithoutFullTypeInformation: boolean,
): ParserServices;

function getParserServices(
  context: Readonly<TSESLint.RuleContext<string, unknown[]>>,
  allowWithoutFullTypeInformation = false,
): ParserServices {
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
    throwError(context.parserPath);
  }

  // if a rule requires full type information, then hard fail if it doesn't exist
  // this forces the user to supply parserOptions.project
  if (
    context.sourceCode.parserServices.program == null &&
    !allowWithoutFullTypeInformation
  ) {
    throwError(context.parserPath);
  }

  return context.sourceCode.parserServices as ParserServices;
}
/* eslint-enable @typescript-eslint/unified-signatures */

function throwError(parserPath: string): never {
  const messages = [
    ERROR_MESSAGE_REQUIRES_PARSER_SERVICES,
    `Parser: ${parserPath}`,
  ];
  if (!parserPathSeemsToBeTSESLint(parserPath)) {
    messages.push(ERROR_MESSAGE_UNKNOWN_PARSER);
  }
  throw new Error(messages.join('\n'));
}

export { getParserServices };
