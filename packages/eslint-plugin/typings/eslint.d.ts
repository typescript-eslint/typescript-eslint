/* eslint-disable @typescript-eslint/no-unused-vars */

// module augmentation is weird
import { RuleTester, Scope } from 'eslint';
import { TSESTree } from '@typescript-eslint/typescript-estree';
import RuleModule from '../src/RuleModule';
declare module 'eslint' {
  namespace Scope {
    interface Variable {
      eslintUsed: boolean;
    }
  }

  export interface RuleTesterRunTests {
    // RuleTester.run also accepts strings for valid cases
    valid: (RuleTester.ValidTestCase | string)[];
    invalid: RuleTester.InvalidTestCase[];
  }
  interface RuleTester {
    run<T extends any[] = never[]>(
      name: string,
      // have to keep the base eslint def for our base eslint-rule test cases
      rule: RuleModule<T> | Rule.RuleModule,
      tests: RuleTesterRunTests
    ): void;
  }
}
