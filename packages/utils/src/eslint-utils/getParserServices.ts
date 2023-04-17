import type * as TSESLint from '../ts-eslint';
import type {
  ParserServices,
  ParserServicesWithTypeInformation,
} from '../ts-estree';

const ERROR_MESSAGE =
  'You have used a rule which requires parserServices to be generated. You must therefore provide a value for the "parserOptions.project" property for @typescript-eslint/parser.';

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
    context.parserServices?.esTreeNodeToTSNodeMap == null ||
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

  return context.parserServices;
}

export { getParserServices };
