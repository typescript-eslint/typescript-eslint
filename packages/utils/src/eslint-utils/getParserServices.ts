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
  // backwards compatibility check
  // old versions of the parser would not return any parserServices unless parserOptions.project was set
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

  // @ts-expect-error - this is safe and correct, TS just doesn't like the assignment to the conditional type
  return context.parserServices;
}

export { getParserServices };
