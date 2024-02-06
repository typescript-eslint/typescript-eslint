import type { Linter } from '@typescript-eslint/utils/ts-eslint';

import configRule from './rules/config';

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
const { name, version } = require('../package.json') as {
  name: string;
  version: string;
};

export const meta: Linter.PluginMeta = {
  name,
  version,
};

/**
 * Expose a single rule called "config", which will be accessed in the user's eslint config files
 * via "tslint/config"
 */
export const rules: Linter.PluginRules = {
  config: configRule,
};
