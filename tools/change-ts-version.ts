import fs from 'fs';
import path from 'path';
import semver from 'semver';

const packageJson = require('../package.json') as {
  resolutions: Record<string, unknown>;
  devDependencies: Record<string, unknown>;
};

const newVersion = semver.valid(semver.coerce(process.argv[2]));
if (newVersion == null) {
  throw new Error('The first argument passed must be a valid semver');
}

packageJson.resolutions.typescript = newVersion;
packageJson.devDependencies.typescript = newVersion;

fs.writeFileSync(
  path.resolve(__dirname, '../package.json'),
  JSON.stringify(packageJson, null, 2),
);
