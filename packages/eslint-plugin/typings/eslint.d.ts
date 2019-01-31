/* eslint-disable @typescript-eslint/no-unused-vars */

// module augmentation is weird
import { RuleTester, Scope } from 'eslint';
import { TSESTree } from '@typescript-eslint/typescript-estree';
import RuleModule from 'ts-eslint';
declare module 'eslint' {
  namespace Scope {
    interface Variable {
      eslintUsed: boolean;
    }
  }

  interface ValidTestCase<TOptions extends any[]> {
    code: string;
    options?: TOptions;
    filename?: string;
    parserOptions?: Linter.ParserOptions;
    settings?: Record<string, any>;
    parser?: string;
    globals?: Record<string, boolean>;
  }

  interface InvalidTestCase<TMessageIds extends string, TOptions extends any[]>
    extends ValidTestCase<TOptions> {
    errors: TestCaseError<TMessageIds>[];
    output?: string | null;
  }

  interface TestCaseError<TMessageIds extends string> {
    messageId: TMessageIds;
    data?: Record<string, any>;
    // type?: string;
    line?: number;
    column?: number;
    // endLine?: number;
    // endColumn?: number;
  }

  interface RuleTesterRunTests<
    TMessageIds extends string,
    TOptions extends any[]
  > {
    // RuleTester.run also accepts strings for valid cases
    valid: (ValidTestCase<TOptions> | string)[];
    invalid: InvalidTestCase<TMessageIds, TOptions>[];
  }
  interface RuleTester {
    run<TMessageIds extends string, TOptions extends any[]>(
      name: string,
      rule: RuleModule<TMessageIds, TOptions>,
      tests: RuleTesterRunTests<TMessageIds, TOptions>
    ): void;
  }
}
