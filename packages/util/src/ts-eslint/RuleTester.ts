import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import { ParserOptions } from './ParserOptions';
import { RuleModule } from './Rule';

interface ValidTestCase<TOptions extends Readonly<any[]>> {
  code: string;
  options?: TOptions;
  filename?: string;
  parserOptions?: ParserOptions;
  settings?: Record<string, any>;
  parser?: string;
  globals?: Record<string, boolean>;
  env?: {
    browser?: boolean;
  };
}

interface InvalidTestCase<
  TMessageIds extends string,
  TOptions extends Readonly<any[]>
> extends ValidTestCase<TOptions> {
  errors: TestCaseError<TMessageIds>[];
  output?: string | null;
}

interface TestCaseError<TMessageIds extends string> {
  messageId: TMessageIds;
  data?: Record<string, any>;
  type?: AST_NODE_TYPES;
  line?: number;
  column?: number;
}

interface RunTests<
  TMessageIds extends string,
  TOptions extends Readonly<any[]>
> {
  // RuleTester.run also accepts strings for valid cases
  valid: (ValidTestCase<TOptions> | string)[];
  invalid: InvalidTestCase<TMessageIds, TOptions>[];
}

interface RunTests<
  TMessageIds extends string,
  TOptions extends Readonly<any[]>
> {
  // RuleTester.run also accepts strings for valid cases
  valid: (ValidTestCase<TOptions> | string)[];
  invalid: InvalidTestCase<TMessageIds, TOptions>[];
}
interface RuleTesterConfig {
  parser: '@typescript-eslint/parser';
  parserOptions?: ParserOptions;
}
interface RuleTester {
  // eslint-disable-next-line @typescript-eslint/no-misused-new
  new (config?: RuleTesterConfig): RuleTester;

  run<TMessageIds extends string, TOptions extends Readonly<any[]>>(
    name: string,
    rule: RuleModule<TMessageIds, TOptions>,
    tests: RunTests<TMessageIds, TOptions>,
  ): void;
}

export {
  InvalidTestCase,
  RuleTester,
  RuleTesterConfig,
  RunTests,
  TestCaseError,
  ValidTestCase,
};
