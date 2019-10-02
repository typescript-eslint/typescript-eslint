import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
} from '@typescript-eslint/typescript-estree';
import { RuleTester as ESLintRuleTester } from 'eslint';
import { ParserOptions } from './ParserOptions';
import { RuleModule } from './Rule';

interface ValidTestCase<TOptions extends Readonly<unknown[]>> {
  code: string;
  options?: TOptions;
  filename?: string;
  parserOptions?: ParserOptions;
  settings?: Record<string, unknown>;
  parser?: string;
  globals?: Record<string, boolean>;
  env?: {
    browser?: boolean;
  };
}

interface InvalidTestCase<
  TMessageIds extends string,
  TOptions extends Readonly<unknown[]>
> extends ValidTestCase<TOptions> {
  errors: TestCaseError<TMessageIds>[];
  output?: string | null;
}

interface TestCaseError<TMessageIds extends string> {
  messageId: TMessageIds;
  data?: Record<string, unknown>;
  type?: AST_NODE_TYPES | AST_TOKEN_TYPES;
  line?: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
}

interface RunTests<
  TMessageIds extends string,
  TOptions extends Readonly<unknown[]>
> {
  // RuleTester.run also accepts strings for valid cases
  valid: (ValidTestCase<TOptions> | string)[];
  invalid: InvalidTestCase<TMessageIds, TOptions>[];
}
interface RuleTesterConfig {
  // should be require.resolve(parserPackageName)
  parser: string;
  parserOptions?: ParserOptions;
}
declare interface RuleTester {
  run<TMessageIds extends string, TOptions extends Readonly<unknown[]>>(
    name: string,
    rule: RuleModule<TMessageIds, TOptions>,
    tests: RunTests<TMessageIds, TOptions>,
  ): void;
}
const RuleTester = ESLintRuleTester as {
  new (config?: RuleTesterConfig): RuleTester;
};

export {
  InvalidTestCase,
  RuleTester,
  RuleTesterConfig,
  RunTests,
  TestCaseError,
  ValidTestCase,
};
