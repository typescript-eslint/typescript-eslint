const fs = require('fs');
// eslint-disable-next-line import/no-absolute-path
const rootPackageJSON = require('/usr/root-package.json');

/**
 * Apply package versions based on what they are currently set to in the root package.json
 * in the monorepo.
 */
const testPackageJSON = {
  private: true,
  devDependencies: {
    eslint: rootPackageJSON.devDependencies.eslint,
    typescript: rootPackageJSON.devDependencies.typescript,
    tslint: rootPackageJSON.devDependencies.tslint,
    jest: rootPackageJSON.devDependencies.jest,
  },
};

fs.writeFileSync('/usr/package.json', JSON.stringify(testPackageJSON, null, 2));
