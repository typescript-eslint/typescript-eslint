import type {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
} from '@typescript-eslint/typescript-estree';
import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

export type FileUnawareConfig = Omit<FlatConfig.Config, 'files' | 'ignores'>;

export interface RuleTesterConfig<Formats extends string> {
  baseOptions: FileUnawareConfig;
  /**
   * A list of extension-specific configurations
   *
   * You must add an extension-specific configuration for each extension you use (For safety reasons, else you could mistype "ts" like "ys" and it wouldn't yell at you)
   */
  extensions: {
    [K in Formats]: FileUnawareConfig;
  };

  /**
   * The directory where fixtures (Virtual files that make TypeScript and eslint plugins happy by providing a virtual file) are located
   *
   * compilerServices are mandatory to prevent bugs
   *
   * Requires a fixtures directory as such:
   * ```plaintext
   * (directory pointed to by fixtureRootDir, must be absolute)
   *   |-file.ts
   *   |-file.{any extra extension you need}
   *   |-tsconfig.json
   * ```
   * `tsconfig.json` must be:
   * ```json
   * {
   *   "compilerOptions": { ##SET ANY OPTIONS HERE## },
   *   "include": ["./file.*", "./file.ts"]
   * }
   * ```
   * In addition, ensure to put your fixture directory INSIDE of the project directory, else type errors will occur
   */
  fixtureRootDir: string;

  /**
   * For future use, do not set.
   */
  fixtureMode?: undefined;

  /**
   * RuleTester compatibility mode, hides some errors, including:
   * - The data property of invalid test cases is unimplemented and deprecated
   */
  hideLegacyConfigLeftovers?: boolean;
}

export interface ExpectedSuggestion<MessageIds extends string> {
  desc?: string;
  output?: string;
  messageId?: MessageIds;
}

export interface ExpectedError<MessageIds extends string> {
  line?: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
  message?: string;
  messageId?: MessageIds;
  suggestions?: ExpectedSuggestion<MessageIds>[];
  type?: /* Trick to make it show up as a string */
  AST_NODE_TYPES | `${AST_NODE_TYPES}` | AST_TOKEN_TYPES | `${AST_TOKEN_TYPES}`;
  /**
   * Not implemented, here for parity, DO NOT USE
   *
   * @deprecated
   */
  data?: unknown;
}

export interface Sample {
  name: string;
  code: string;
  format?: string;
}

export type ValidSample = Sample;

export interface InvalidSample<MessageIds extends string> extends Sample {
  errors: ExpectedError<MessageIds>[];
  output: string | null;
}

/**
 * Used for legacy (ESLint RuleTester) compatibility.
 */
export interface LegacyValidSample<Options extends unknown[]> {
  name?: string;
  code: string;
  options?: Options;
}

/**
 * Used for legacy (core ESLint RuleTester) compatibility,
 */
export interface LegacyInvalidSample<
  MessageIds extends string,
  Options extends unknown[],
> {
  name?: string;
  code: string;
  errors: ExpectedError<MessageIds>[];
  options?: Options;
  output?: string | null;
}
