import type { InvalidTestCase } from './InvalidTestCase';
import type { RuleTesterConfig } from './RuleTesterConfig';
import type { ValidTestCase } from './ValidTestCase';

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
export type TesterConfigWithDefaults = Mutable<
  Required<Pick<RuleTesterConfig, 'defaultFilenames' | 'parser' | 'rules'>> &
    RuleTesterConfig
>;

export interface RunTests<
  MessageIds extends string,
  Options extends Readonly<unknown[]>,
> {
  // RuleTester.run also accepts strings for valid cases
  readonly valid: readonly (ValidTestCase<Options> | string)[];
  readonly invalid: readonly InvalidTestCase<MessageIds, Options>[];
}

export interface NormalizedRunTests<
  MessageIds extends string,
  Options extends Readonly<unknown[]>,
> {
  readonly valid: readonly ValidTestCase<Options>[];
  readonly invalid: readonly InvalidTestCase<MessageIds, Options>[];
}

export type { ValidTestCase } from './ValidTestCase';
export type {
  InvalidTestCase,
  SuggestionOutput,
  TestCaseError,
} from './InvalidTestCase';
export type { RuleTesterConfig } from './RuleTesterConfig';
