import type { Linter, ParserOptions } from '@typescript-eslint/utils/ts-eslint';

export interface RuleTesterConfig extends Linter.Config {
  // should be require.resolve(parserPackageName)
  readonly parser: string;
  readonly parserOptions?: Readonly<ParserOptions>;
}

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
export type TesterConfigWithDefaults = Mutable<
  RuleTesterConfig & Required<Pick<RuleTesterConfig, 'parser' | 'rules'>>
>;
