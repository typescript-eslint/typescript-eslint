import type { ParseFrontMatter } from '@docusaurus/types';

import pluginRules from '@typescript-eslint/eslint-plugin/use-at-your-own-risk/rules';
import * as path from 'node:path';

import { isESLintPluginRuleModule } from '../utils/rules';
import { getRuleOgImageUrl, ruleDocsDirectory } from './paths';

function getRuleName(filePath: string): string | undefined {
  const resolved = path.resolve(filePath);
  if (path.dirname(resolved) !== ruleDocsDirectory) {
    return undefined;
  }

  const ruleName = path.basename(resolved, path.extname(resolved));

  return isESLintPluginRuleModule(pluginRules[ruleName]) ? ruleName : undefined;
}

export const parseFrontMatter: ParseFrontMatter = async params => {
  const result = await params.defaultParseFrontMatter(params);
  const ruleName = getRuleName(params.filePath);

  if (!ruleName || result.frontMatter.image) {
    return result;
  }

  return {
    ...result,
    frontMatter: {
      ...result.frontMatter,
      image: getRuleOgImageUrl(ruleName),
    },
  };
};
