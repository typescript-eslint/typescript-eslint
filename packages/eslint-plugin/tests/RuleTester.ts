import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import { RuleTester } from 'eslint';
import RuleModule from 'ts-eslint';
import { ParserOptions } from '@typescript-eslint/parser';

interface ValidTestCase<TOptions extends any[]> {
  code: string;
  options?: TOptions;
  filename?: string;
  parserOptions?: ParserOptions;
  settings?: Record<string, any>;
  parser?: string;
  globals?: Record<string, boolean>;
}

interface InvalidTestCase<TMessageIds extends string, TOptions extends any[]>
  extends ValidTestCase<TOptions> {
  errors: TestCaseError<TMessageIds>[];
  output?: string;
}

interface TestCaseError<TMessageIds extends string> {
  messageId: TMessageIds;
  data?: Record<string, any>;
  type?: AST_NODE_TYPES;
  line?: number;
  column?: number;
  // endLine?: number;
  // endColumn?: number;
}

interface RunTests<TMessageIds extends string, TOptions extends any[]> {
  // RuleTester.run also accepts strings for valid cases
  valid: (ValidTestCase<TOptions> | string)[];
  invalid: InvalidTestCase<TMessageIds, TOptions>[];
}

declare class RuleTesterTyped {
  run<TMessageIds extends string, TOptions extends any[]>(
    name: string,
    rule: RuleModule<TMessageIds, TOptions>,
    tests: RunTests<TMessageIds, TOptions>
  ): void;
}

const RuleTesterRetyped = (RuleTester as any) as {
  new (config?: {
    parser: '@typescript-eslint/parser';
    parserOptions?: ParserOptions;
  }): RuleTesterTyped;
};
export default RuleTesterRetyped;
export { RunTests, TestCaseError, InvalidTestCase, ValidTestCase };
