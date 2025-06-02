import type {
  ClassicConfig,
  FlatConfig,
} from '@typescript-eslint/utils/ts-eslint';

import type rules from './rules';
import { TSESLintPlugin } from './raw-plugin';

declare const cjsExport: TSESLintPlugin;

export = cjsExport;
