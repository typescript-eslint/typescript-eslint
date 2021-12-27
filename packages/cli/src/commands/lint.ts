import { sync as globSync } from 'globby';
import isGlob from 'is-glob';

import type { AbsolutePath } from '../path';
import { getAbsolutePath } from '../path';
import { lintProjects } from '../workers/lintProjects';
import type { Command } from './Command';

export interface OptionsRaw {
  cwd: string;
  project: readonly string[];
}
export interface Options {
  cwd: AbsolutePath;
  project: readonly string[];
}

const command: Command<OptionsRaw, Options> = {
  builder: yargs => {
    return yargs.options({
      project: {
        alias: ['p', 'projects'],
        array: true,
        demandOption: 'Must pass at least one project.',
        describe:
          'Path to a tsconfig, relative to the CWD. Can also specify a glob pattern - ensure you wrap in quotes to prevent CLI expansion of the glob.',
        normalize: true,
        requiresArg: true,
        type: 'string',
      },
      cwd: {
        coerce: (cwd: OptionsRaw['cwd']) => getAbsolutePath(cwd),
        default: process.cwd(),
        describe:
          'The path to the current working directory to use for the run.',
        type: 'string',
      },
    });
  },
  command: 'lint',
  describe: 'Lint your project.',
  handler: async args => {
    const projects = new Set<AbsolutePath>();
    const globProjects: string[] = [];
    for (const project of args.project) {
      if (isGlob(project)) {
        globProjects.push(project);
      } else {
        projects.add(getAbsolutePath(project, args.cwd));
      }
    }
    for (const globProject of globSync(
      ['!**/node_modules/**', ...globProjects],
      { cwd: args.cwd },
    )) {
      projects.add(getAbsolutePath(globProject, args.cwd));
    }

    args.reporter.debug('found the following projects', Array.from(projects));
    args.reporter.log('Linting', projects.size, 'projects');

    const lintReturnState = await lintProjects(
      {
        cwd: args.cwd,
        logLevel: args.logLevel,
        projects: Array.from(projects),
      },
      args.reporter,
    );

    args.reporter.debug('linting finished');

    process.exitCode = lintReturnState;
  },
};

export { command };
