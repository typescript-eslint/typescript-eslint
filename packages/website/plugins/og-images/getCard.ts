import pluginRules from '@typescript-eslint/eslint-plugin/use-at-your-own-risk/rules';
import * as path from 'node:path';

import type { Card } from './renderCard';

import { isESLintPluginRuleModule } from '../utils/rules';
import { getDocCard } from './getDocCard';
import { getRuleCard } from './getRuleCard';
import {
  baseDocsDirectory,
  getDocOgImageName,
  getRuleOgImageName,
  isInDirectory,
  ruleDocsDirectory,
} from './paths';

export interface CardImage {
  card: Card;
  name: string;
}

export async function getCard(
  filePath: string,
  fileContent: string,
): Promise<CardImage | undefined> {
  const resolved = path.resolve(filePath);

  if (path.dirname(resolved) === ruleDocsDirectory) {
    const ruleName = path.basename(resolved, path.extname(resolved));
    const rule = pluginRules[ruleName];

    return isESLintPluginRuleModule(rule)
      ? {
          card: getRuleCard(ruleName, rule),
          name: getRuleOgImageName(ruleName),
        }
      : undefined;
  }

  if (isInDirectory(baseDocsDirectory, resolved)) {
    const card = await getDocCard(resolved, fileContent);

    return card && { card, name: getDocOgImageName(resolved) };
  }

  return undefined;
}
