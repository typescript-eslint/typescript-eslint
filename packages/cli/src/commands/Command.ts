import type { ArgumentsCamelCase, CommandBuilder, CommandModule } from 'yargs';

import type { Reporter } from '../reporters/Reporter';

// eslint-disable-next-line @typescript-eslint/ban-types
export interface Command<TRawOpts = {}, TProcessedOpts = {}>
  extends CommandModule<
    TRawOpts & GlobalOptions,
    TProcessedOpts & GlobalOptions
  > {
  /** object declaring the options the command accepts, or a function accepting and returning a yargs instance */
  builder: CommandBuilder<
    TRawOpts & GlobalOptions,
    TProcessedOpts & GlobalOptions
  >;
  /** string used as the description for the command in help text, use `false` for a hidden command */
  describe: string;
  /** a function which will be passed the parsed argv. */
  handler: (
    args: ArgumentsCamelCase<TProcessedOpts & GlobalOptions>,
  ) => Promise<void>;
}

export interface CommandNoOpts extends CommandModule {
  /** string (or array of strings) that executes this command when given on the command line, first string may contain positional args */
  command: ReadonlyArray<string> | string;
  /** string used as the description for the command in help text, use `false` for a hidden command */
  describe: string;
  /** a function which will be passed the parsed argv. */
  handler: () => void | Promise<void>;
}

export enum ReporterConfig {
  ink = 'ink',
  plain = 'plain',
}

// numbering is important as each level includes the prior levels
// eg level >= LogLevel.error should include both info and debug
export enum LogLevel {
  error = 0,
  info = 1,
  debug = 2,
}

export interface GlobalOptionsRaw {
  logLevel: keyof typeof LogLevel;
  reporter: ReporterConfig;
}

export interface GlobalOptions {
  logLevel: LogLevel;
  reporter: Reporter;
}
