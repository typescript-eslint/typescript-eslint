import type { Linter } from '@typescript-eslint/utils/ts-eslint';

import debugNamespace from './debug-namespace';
import eqeqNullish from './eqeq-nullish';
import noPoorlyTypedTsProps from './no-poorly-typed-ts-props';
import noRelativePathsToInternalPackages from './no-relative-paths-to-internal-packages';
import noTypescriptDefaultImport from './no-typescript-default-import';
import noTypescriptEstreeImport from './no-typescript-estree-import';
import pluginTestFormatting from './plugin-test-formatting';
import preferASTTypesEnum from './prefer-ast-types-enum';

export default {
  'debug-namespace': debugNamespace,
  'no-poorly-typed-ts-props': noPoorlyTypedTsProps,
  'no-typescript-default-import': noTypescriptDefaultImport,
  'no-typescript-estree-import': noTypescriptEstreeImport,
  'prefer-ast-types-enum': preferASTTypesEnum,
  'eqeq-nullish': eqeqNullish,
  'no-relative-paths-to-internal-packages': noRelativePathsToInternalPackages,
  'plugin-test-formatting': pluginTestFormatting,
} satisfies Linter.PluginRules;
