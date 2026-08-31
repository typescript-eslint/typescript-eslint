import type * as TSESLint from '../ts-eslint';
import type { ParserServices } from '../ts-estree';

import { parserSeemsToBeTSESLint } from './parserSeemsToBeTSESLint';

const ERROR_MESSAGE_REQUIRES_PARSER_SERVICES =
  "You have used a rule which requires type information, but don't have parserOptions set to generate type information for this file. See https://tseslint.com/typed-linting for enabling linting with type information.";
const ERROR_MESSAGE_UNKNOWN_PARSER =
  'Note: detected a parser other than @typescript-eslint/parser. Make sure the parser is configured to forward "parserOptions.project" to @typescript-eslint/parser.';

export function getParserServicesFromContext<
  MessageIds extends string,
  Options extends readonly unknown[],
>(
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
): { parser: string | undefined; parserServices: ParserServices } {
  const parserServices = context.sourceCode.parserServices;
  const parser =
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8
    context.parserPath || context.languageOptions.parser?.meta?.name;

  if (
    parserServices?.esTreeNodeToTSNodeMap == null ||
    parserServices.tsNodeToESTreeNodeMap == null
  ) {
    throwParserServicesError(parser);
  }

  return { parser, parserServices: parserServices as ParserServices };
}

export function throwParserServicesError(parser: string | undefined): never {
  const messages = [
    ERROR_MESSAGE_REQUIRES_PARSER_SERVICES,
    `Parser: ${parser || '(unknown)'}`,
    !parserSeemsToBeTSESLint(parser) && ERROR_MESSAGE_UNKNOWN_PARSER,
  ].filter(Boolean);

  throw new Error(messages.join('\n'));
}
