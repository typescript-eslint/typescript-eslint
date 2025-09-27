import type { Linter } from '@typescript-eslint/utils/ts-eslint';

import debugNamespace from './debug-namespace.js';
import eqeqNullish from './eqeq-nullish.js';
import noPoorlyTypedTsProps from './no-poorly-typed-ts-props.js';
import noRelativePathsToInternalPackages from './no-relative-paths-to-internal-packages.js';
import noTypescriptDefaultImport from './no-typescript-default-import.js';
import noTypescriptEstreeImport from './no-typescript-estree-import.js';
import pluginTestFormatting from './plugin-test-formatting.js';
import preferASTTypesEnum from './prefer-ast-types-enum.js';

export default {
  'debug-namespace': debugNamespace,
  'eqeq-nullish': eqeqNullish,
  'no-poorly-typed-ts-props': noPoorlyTypedTsProps,
  'no-relative-paths-to-internal-packages': noRelativePathsToInternalPackages,
  'no-typescript-default-import': noTypescriptDefaultImport,
  'no-typescript-estree-import': noTypescriptEstreeImport,
  'plugin-test-formatting': pluginTestFormatting,
  'prefer-ast-types-enum': preferASTTypesEnum,
} satisfies Linter.PluginRules;
