#!/usr/bin/env ts-node

import type { TSESLint } from '@typescript-eslint/utils';
import fs from 'fs';
import path from 'path';
import prettier from 'prettier';

import rules from '../src/rules';

interface RuleDetails {
  name: string;
  description: string;
  recommended: TSESLint.RuleRecommendation;
  fixable: boolean;
  requiresTypeChecking: boolean;
  extendsBaseRule: boolean;
}

type RuleColumn = [
  string,
  string,
  ':lock:' | ':white_check_mark:' | '',
  ':wrench:' | '',
  ':thought_balloon:' | '',
];

const emojiKey = {
  recommended: ':white_check_mark:',
  strict: ':lock:',
  fixable: ':wrench:',
  requiresTypeChecking: ':thought_balloon:',
} as const;

const staticElements = {
  rulesListKey: [
    `**Key**: ${emojiKey.recommended} = recommended`,
    `${emojiKey.strict} = strict`,
    `${emojiKey.fixable} = fixable`,
    `${emojiKey.requiresTypeChecking} = requires type information`,
  ].join(', '),
  listHeaderRow: [
    'Name',
    'Description',
    `${emojiKey.recommended}${emojiKey.strict}`,
    emojiKey.fixable,
    emojiKey.requiresTypeChecking,
  ],
  listSpacerRow: Array<string>(5).fill('-'),
};

const returnEmojiIfTrue = <TKey extends keyof typeof emojiKey>(
  key: TKey,
  obj: { [K in TKey]?: unknown },
): typeof emojiKey[TKey] | '' => (obj[key] ? emojiKey[key] : '');

const createRuleLink = (ruleName: string, basePath: string): string =>
  `[\`@typescript-eslint/${ruleName}\`](${basePath}${ruleName}.md)`;

const buildRuleRow = (rule: RuleDetails, basePath: string): RuleColumn => [
  createRuleLink(rule.name, basePath),
  rule.description,
  rule.recommended === 'strict'
    ? emojiKey.strict
    : returnEmojiIfTrue('recommended', rule),
  returnEmojiIfTrue('fixable', rule),
  returnEmojiIfTrue('requiresTypeChecking', rule),
];

const buildRulesTable = (
  rules: RuleDetails[],
  basePath: string,
): string[][] => [
  staticElements.listHeaderRow,
  staticElements.listSpacerRow,
  ...rules
    .sort(({ name: ruleNameA }, { name: ruleNameB }) =>
      ruleNameA.localeCompare(ruleNameB),
    )
    .map(item => buildRuleRow(item, basePath)),
];

const generateRulesListMarkdown = (
  rules: RuleDetails[],
  basePath: string,
): string =>
  [
    '',
    staticElements.rulesListKey,
    '',
    ...buildRulesTable(rules, basePath).map(column =>
      [...column, ' '].join('|'),
    ),
    '',
  ].join('\n');

const updateRulesList = (
  listName: 'base' | 'extension',
  rules: RuleDetails[],
  markdown: string,
  basePath: string,
): string => {
  const listBeginMarker = `<!-- begin ${listName} rule list -->`;
  const listEndMarker = `<!-- end ${listName} rule list -->`;

  const listStartIndex = markdown.indexOf(listBeginMarker);
  const listEndIndex = markdown.indexOf(listEndMarker);

  if (listStartIndex === -1 || listEndIndex === -1) {
    throw new Error(`cannot find start or end of ${listName} list`);
  }

  return [
    markdown.substring(0, listStartIndex - 1),
    listBeginMarker,
    '',
    generateRulesListMarkdown(rules, basePath), //
    markdown.substring(listEndIndex),
  ].join('\n');
};

const rulesDetails: RuleDetails[] = Object.entries(rules)
  .filter(([, rule]) => rule.meta.deprecated !== true)
  .map(([name, rule]) => ({
    name,
    description: rule.meta.docs?.description ?? '',
    recommended: rule.meta.docs?.recommended ?? false,
    fixable: !!rule.meta.fixable,
    requiresTypeChecking: rule.meta.docs?.requiresTypeChecking ?? false,
    extendsBaseRule: !!rule.meta.docs?.extendsBaseRule ?? false,
  }));

const baseRules = rulesDetails.filter(rule => !rule.extendsBaseRule);
const extensionRules = rulesDetails.filter(rule => rule.extendsBaseRule);

function updateFile(file: string, basePath: string): void {
  let readme = fs.readFileSync(file, 'utf8');

  readme = updateRulesList('base', baseRules, readme, basePath);
  readme = updateRulesList('extension', extensionRules, readme, basePath);

  readme = prettier.format(readme, { parser: 'markdown' });

  fs.writeFileSync(file, readme, 'utf8');
}

updateFile(path.resolve(__dirname, '../README.md'), './docs/rules/');
updateFile(path.resolve(__dirname, '../docs/rules/README.md'), './');
