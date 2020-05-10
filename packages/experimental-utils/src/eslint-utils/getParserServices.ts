import * as TSESLint from '../ts-eslint';
import { ParserServices } from '../ts-estree';

const ERROR_MESSAGE =
  'You have used a rule which requires parserServices to be generated. You must therefore provide a value for the "parserOptions.project" property for @typescript-eslint/parser.';

type RequiredParserServices = {
  [k in keyof ParserServices]: Exclude<ParserServices[k], undefined>;
};

/**
 * Try to retrieve typescript parser service from context
 */
function getParserServices<
  TMessageIds extends string,
  TOptions extends unknown[]
>(
  context: TSESLint.RuleContext<TMessageIds, TOptions>,
): RequiredParserServices {
  if (
    !context.parserServices ||
    !context.parserServices.program ||
    !context.parserServices.esTreeNodeToTSNodeMap
  ) {
    /**
     * The user needs to have configured "project" in their parserOptions
     * for @typescript-eslint/parser
     */
    throw new Error(ERROR_MESSAGE);
  }
  return context.parserServices as RequiredParserServices;
}

export { getParserServices };
