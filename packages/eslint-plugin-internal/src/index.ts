import type { Linter } from '@typescript-eslint/utils/ts-eslint';

import rules from './rules/index.js';
import packageJson from './util/packagejson.js';

export default {
  meta: {
    name: packageJson.name,
    namespace: '@typescript-eslint/internal',
    version: packageJson.version,
  },
  rules,
} satisfies Linter.Plugin;
