import { ParserOptions } from '@typescript-eslint/parser';
import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import { RuleTester as ESLintRuleTester } from 'eslint';
import * as path from 'path';
import RuleModule from 'ts-eslint';

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
  output?: string;
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

declare class RuleTesterTyped {
  run<TMessageIds extends string, TOptions extends Readonly<any[]>>(
    name: string,
    rule: RuleModule<TMessageIds, TOptions>,
    tests: RunTests<TMessageIds, TOptions>
  ): void;
}

const RuleTester = (ESLintRuleTester as any) as {
  new (config?: {
    parser: '@typescript-eslint/parser';
    parserOptions?: ParserOptions;
  }): RuleTesterTyped;
};

function getFixturesRootDir() {
  return path.join(process.cwd(), 'tests/fixtures/');
}

export {
  RuleTester,
  RunTests,
  TestCaseError,
  InvalidTestCase,
  ValidTestCase,
  getFixturesRootDir
};
