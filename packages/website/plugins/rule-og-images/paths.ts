import * as path from 'node:path';

import { eslintPluginDirectory } from '../utils/rules';

export const ruleDocsDirectory = path.join(
  eslintPluginDirectory,
  'docs',
  'rules',
);

export const ruleOgImagesDirectory = path.join(
  __dirname,
  '../../static/img/og/rules',
);

export function getRuleOgImageUrl(ruleName: string): string {
  return `/img/og/rules/${ruleName}.png`;
}
