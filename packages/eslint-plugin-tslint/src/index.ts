import configRule from './rules/config';

/**
 * Expose a single rule called "config", which will be accessed in the user's eslint config files
 * via "tslint/config"
 */
export const rules = {
  config: configRule,
};
