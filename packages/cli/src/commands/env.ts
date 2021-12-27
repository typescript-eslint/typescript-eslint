/* eslint-disable no-console -- no need to use a reporter for this command as it's intended to dump straight to console */

import Module from 'module';

import type { CommandNoOpts } from './Command';

const packagesToResolve = [
  '@typescript-eslint/cli',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/experimental-utils',
  '@typescript-eslint/parser',
  '@typescript-eslint/scope-manager',
  '@typescript-eslint/typescript-estree',
  'typescript',
];

const command: CommandNoOpts = {
  aliases: ['environment', 'env-info', 'support-info'],
  command: 'env',
  describe:
    'Prints information about your environment to provide when reporting an issue.',
  handler: () => {
    const nodeVersion = process.version.replace(/^v/, '');
    const versions: Record<string, string> = {
      node: nodeVersion,
    };

    const require = Module.createRequire(process.cwd());

    let maxPackageLength = 0;
    let maxVersionLength = Math.max(nodeVersion.length, 'version'.length);
    for (const pkg of packagesToResolve) {
      const packageJson = require(`${pkg}/package.json`) as { version: string };
      versions[pkg] = packageJson.version;

      maxPackageLength = Math.max(maxPackageLength, pkg.length);
      maxVersionLength = Math.max(maxVersionLength, packageJson.version.length);
    }

    console.log(
      '|',
      'package'.padEnd(maxPackageLength, ' '),
      '|',
      'version'.padEnd(maxVersionLength, ' '),
      '|',
    );
    console.log(
      '|',
      '-'.padEnd(maxPackageLength, '-'),
      '|',
      '-'.padEnd(maxVersionLength, '-'),
      '|',
    );
    for (const [pkg, version] of Object.entries(versions)) {
      console.log(
        '|',
        pkg.padEnd(maxPackageLength, ' '),
        '|',
        version.padEnd(maxVersionLength, ' '),
        '|',
      );
    }
  },
};

export { command };
