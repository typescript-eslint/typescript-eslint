import rules from './rules';

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
const { name, version } = require('../package.json') as {
  name: string;
  version: string;
};

export = {
  rules,
  meta: {
    name,
    version,
  },
};
