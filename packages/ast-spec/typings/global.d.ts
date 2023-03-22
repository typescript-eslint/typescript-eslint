/**
 * We define this as a global type to make it easier to consume from fixtures.
 * It saves us having to import the type into `src` files from a test utils folder.
 * This is a convenient property because it saves us from a lot of `../`!
 */
interface ASTFixtureConfig {
  /**
   * Prevents the parser from throwing an error if it receives an invalid AST from TypeScript.
   * This case only usually occurs when attempting to lint invalid code.
   */
  readonly allowInvalidAST?: boolean;

  /**
   * Specifies that we expect that babel doesn't yet support the code in this fixture, so we expect that it will error.
   * This should not be used if we expect babel to throw for this feature due to a valid parser error!
   *
   * The value should be a description of why there isn't support - for example a github issue URL.
   */
  readonly expectBabelToNotSupport?: string;

  /**
   * Include comments in AST
   */
  readonly comment?: boolean;
}
