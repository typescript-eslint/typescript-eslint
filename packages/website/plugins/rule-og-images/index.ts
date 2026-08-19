import type { Plugin } from '@docusaurus/types';

import pluginRules from '@typescript-eslint/eslint-plugin/use-at-your-own-risk/rules';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { isESLintPluginRuleModule } from '../utils/rules';
import { ruleOgImagesDirectory } from './paths';
import { renderRuleCard } from './renderRuleCard';

export default async function ruleOgImages(): Promise<Plugin> {
  await fs.rm(ruleOgImagesDirectory, { force: true, recursive: true });
  await fs.mkdir(ruleOgImagesDirectory, { recursive: true });

  for (const [ruleName, rule] of Object.entries(pluginRules)) {
    if (!isESLintPluginRuleModule(rule)) {
      continue;
    }

    await fs.writeFile(
      path.join(ruleOgImagesDirectory, `${ruleName}.png`),
      await renderRuleCard(ruleName, rule),
    );
  }

  return {
    name: 'rule-og-images',
  };
}
