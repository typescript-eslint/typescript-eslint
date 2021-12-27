import path from 'path';
import type { CommandModule } from 'yargs';
import * as yargs from 'yargs';

import type { GlobalOptions, GlobalOptionsRaw } from './commands/Command';
import { LogLevel, ReporterConfig } from './commands/Command';
import * as lintCommand from './commands/lint';
import { InkReporter } from './reporters/InkReporter';
import { PlainReporter } from './reporters/PlainReporter';

function prepareReporter(argvRaw: GlobalOptionsRaw): void {
  /* yargs and dynamic js - the middleware overwrites the options object
  @ts-expect-error */
  const argvResult = argvRaw as GlobalOptions;

  const logLevel = LogLevel[argvRaw.logLevel];
  argvResult.logLevel = logLevel;

  switch (argvRaw.reporter) {
    default:
    case ReporterConfig.ink:
      argvResult.reporter = new InkReporter(logLevel);
      return;

    case ReporterConfig.plain:
      argvResult.reporter = new PlainReporter(logLevel);
      return;
  }
}

async function execute(): Promise<void> {
  // @ts-expect-error - yargs and dynamic js
  const argv: GlobalOptions = await yargs
    .usage('Usage: $0 -p ./tsconfig.json')
    .scriptName('ts-eslint')
    .strict(true)
    .commandDir(path.resolve(__dirname, 'commands'), {
      extensions: ['js', 'ts'],
      exclude: /\.d\.ts$/,
      visit: (mod: { readonly command: CommandModule }) => {
        return mod.command;
      },
    })
    // specify the `lint` command as the default command
    .command('$0', false, lintCommand.command as CommandModule)
    // global options
    .options({
      logLevel: {
        describe: 'Control the log level',
        default: 'error' as const,
        enum: Object.keys(LogLevel) as (keyof typeof LogLevel)[],
        global: true,
        type: 'string',
      },
      reporter: {
        describe: 'Control how the console output is rendered',
        default: process.env.CI ? ReporterConfig.plain : ReporterConfig.ink,
        enum: Object.values(ReporterConfig) as ReporterConfig[],
        global: true,
        type: 'string',
      },
    })
    .middleware(prepareReporter)
    .help()
    .wrap(yargs.terminalWidth()).argv;

  argv.reporter.cleanup();
}

if (require.main === module) {
  // for easy testing - execute directly if we are the main node script
  void execute();
}

export { execute };
