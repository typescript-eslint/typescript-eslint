import type * as TSESLint from '../ts-eslint';
import type {
  ParserServices,
  ParserServicesWithTypeInformation,
} from '../ts-estree';

const ERROR_MESSAGE =
  'You have used a rule which requires parserServices to be generated. You must therefore provide a value for the "parserOptions.project" property for @typescript-eslint/parser.';

type GetParserServicesResult<T extends boolean> = T extends true
  ? ParserServices
  : ParserServicesWithTypeInformation;

/**
 * Try to retrieve typescript parser service from context
 */
function getParserServices<
  TMessageIds extends string,
  TOptions extends readonly unknown[],
  TAllowWithoutFullTypeInformation extends boolean = false,
>(
  context: Readonly<TSESLint.RuleContext<TMessageIds, TOptions>>,
  allowWithoutFullTypeInformation: TAllowWithoutFullTypeInformation = false as TAllowWithoutFullTypeInformation,
): GetParserServicesResult<TAllowWithoutFullTypeInformation> {
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
    context.parserServices == null ||
    context.parserServices.esTreeNodeToTSNodeMap == null ||
    context.parserServices.tsNodeToESTreeNodeMap == null
  ) {
    throw new Error(ERROR_MESSAGE);
  }

  // if a rule requires full type information, then hard fail if it doesn't exist
  // this forces the user to supply parserOptions.project
  if (
    context.parserServices.program == null &&
    !allowWithoutFullTypeInformation
  ) {
    throw new Error(ERROR_MESSAGE);
  }

  return context.parserServices as GetParserServicesResult<TAllowWithoutFullTypeInformation>;
}

export { getParserServices };
