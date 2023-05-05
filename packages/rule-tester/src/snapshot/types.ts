export interface TestReportSuggestion {
  /**
   * The hydrated suggestion message
   */
  readonly message: string;
  /**
   * The results of applying the suggestion fixer to the code.
   */
  readonly fixOutput: string;
}
export interface TestReportError {
  /**
   * The code string with the error rendered in it.
   */
  readonly errorCodeFrame: string;
  /**
   * Information about suggestions provided alongside the error.
   */
  readonly suggestions: TestReportSuggestion[] | null;
}
export interface SingleTestResult {
  /**
   * The original test code.
   */
  readonly code: string;
  /**
   * The results of applying the autofixers to the code.
   * `null` if there was no fixers applied.
   */
  readonly fixOutput: string | null;
  /**
   * The errors reported during the test run.
   */
  readonly errors: readonly TestReportError[];
  /**
   * The unique hash for the test so that it can be uniquely keyed in an object
   */
  readonly testHash: string;
  /**
   * The resolved name of the test.
   */
  readonly testName: string;
  /**
   * The language flavour of the test code for rendering markdown code fences
   * with appropriate syntax highlighting
   */
  readonly testLanguageFlavour: string;
}
