const fs = require('fs');
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
    /**
     * TEMP: Bump jest to ahead of our stable usage in the monorepo,
     * we need the bleeding edge snapshotResolver option
     */
    // jest: rootPackageJSON.devDependencies.jest,
    jest: '24.0.0-alpha.12'
  }
};

fs.writeFileSync('/usr/package.json', JSON.stringify(testPackageJSON, null, 2));
