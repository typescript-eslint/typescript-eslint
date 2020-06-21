import * as TSESLint from '../ts-eslint';
import { ParserServices } from '../ts-estree';

const ERROR_MESSAGE =
  'You have used a rule which requires parserServices to be generated. You must therefore provide a value for the "parserOptions.project" property for @typescript-eslint/parser.';

/**
 * Try to retrieve typescript parser service from context
 */
function getParserServices<
  TMessageIds extends string,
  TOptions extends readonly unknown[]
>(
  context: Readonly<TSESLint.RuleContext<TMessageIds, TOptions>>,
  allowWithoutFullTypeInformation = false,
): ParserServices {
  // backwards compatibility check
  // old versions of the parser would not return any parserServices unless parserOptions.project was set
  if (
    !context.parserServices ||
    !context.parserServices.program ||
    !context.parserServices.esTreeNodeToTSNodeMap ||
    !context.parserServices.tsNodeToESTreeNodeMap
  ) {
    throw new Error(ERROR_MESSAGE);
  }

  const hasFullTypeInformation =
    context.parserServices.hasFullTypeInformation ??
    /* backwards compatible */ true;

  // if a rule requires full type information, then hard fail if it doesn't exist
  // this forces the user to supply parserOptions.project
  if (!hasFullTypeInformation && !allowWithoutFullTypeInformation) {
    throw new Error(ERROR_MESSAGE);
  }

  return context.parserServices;
}

export { getParserServices };
