import type { InvalidTestCase } from './InvalidTestCase';
import type { RuleTesterConfig } from './RuleTesterConfig';
import type { ValidTestCase } from './ValidTestCase';

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
export type TesterConfigWithDefaults = Mutable<
  Required<
    Pick<RuleTesterConfig, 'defaultFilenames' | 'languageOptions' | 'rules'>
  > &
    RuleTesterConfig
>;

export interface RunTests<
  MessageIds extends string,
  Options extends readonly unknown[],
> {
  readonly invalid: readonly InvalidTestCase<MessageIds, Options>[];
  // RuleTester.run also accepts strings for valid cases
  readonly valid: readonly (ValidTestCase<Options> | string)[];
}

export interface NormalizedRunTests<
  MessageIds extends string,
  Options extends readonly unknown[],
> {
  readonly invalid: readonly InvalidTestCase<MessageIds, Options>[];
  readonly valid: readonly ValidTestCase<Options>[];
}

export type {
  InvalidTestCase,
  SuggestionOutput,
  TestCaseError,
} from './InvalidTestCase';
export type { RuleTesterConfig } from './RuleTesterConfig';
export type { ValidTestCase } from './ValidTestCase';
