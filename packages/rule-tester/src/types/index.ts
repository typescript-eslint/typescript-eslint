import type { InvalidTestCase } from './InvalidTestCase';
import type { RuleTesterConfig } from './RuleTesterConfig';
import type { ValidTestCase } from './ValidTestCase';

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
export type TesterConfigWithDefaults = Mutable<
  RuleTesterConfig &
    Required<Pick<RuleTesterConfig, 'parser' | 'rules' | 'defaultFilenames'>>
>;

export interface RunTests<
  TMessageIds extends string,
  TOptions extends Readonly<unknown[]>,
> {
  // RuleTester.run also accepts strings for valid cases
  readonly valid: readonly (ValidTestCase<TOptions> | string)[];
  readonly invalid: readonly InvalidTestCase<TMessageIds, TOptions>[];
}

export interface NormalizedRunTests<
  TMessageIds extends string,
  TOptions extends Readonly<unknown[]>,
> {
  readonly valid: readonly ValidTestCase<TOptions>[];
  readonly invalid: readonly InvalidTestCase<TMessageIds, TOptions>[];
}

export type { ValidTestCase } from './ValidTestCase';
export type {
  InvalidTestCase,
  SuggestionOutput,
  TestCaseError,
} from './InvalidTestCase';
export type { RuleTesterConfig } from './RuleTesterConfig';
