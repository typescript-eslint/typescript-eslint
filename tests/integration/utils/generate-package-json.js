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
    tslint: '^5.11.0',
    /**
     * TEMP: Bump jest to ahead of our stable usage in the monorepo,
     * we need the bleeding edge snapshotResolver option
     */
    // jest: rootPackageJSON.devDependencies.jest,
    jest: '24.0.0-alpha.12',
    /**
     * Use the local volumes for our own packages
     */
    'eslint-plugin-typescript': 'file:/usr/eslint-plugin',
    'eslint-plugin-tslint': 'file:/usr/eslint-plugin-tslint',
    'typescript-estree': 'file:/usr/typescript-estree'
  }
};

fs.writeFileSync('/usr/package.json', JSON.stringify(testPackageJSON, null, 2));
