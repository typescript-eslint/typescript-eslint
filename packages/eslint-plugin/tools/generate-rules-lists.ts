#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';

import rules from '../src/rules';

import prettier from 'prettier';

interface RuleDetails {
  name: string;
  description: string;
  recommended: boolean;
  fixable: boolean;
  requiresTypeChecking: boolean;
  extendsBaseRule: boolean;
}

type RuleColumn = [
  string,
  string,
  ':heavy_check_mark:' | '',
  ':wrench:' | '',
  ':thought_balloon:' | '',
];

const emojiKey = {
  recommended: ':heavy_check_mark:',
  fixable: ':wrench:',
  requiresTypeChecking: ':thought_balloon:',
} as const;

const staticElements = {
  rulesListKey: [
    `**Key**: ${emojiKey.recommended} = recommended`,
    `${emojiKey.fixable} = fixable`,
    `${emojiKey.requiresTypeChecking} = requires type information`,
  ].join(', '),
  listHeaderRow: [
    'Name',
    'Description',
    emojiKey.recommended,
    emojiKey.fixable,
    emojiKey.requiresTypeChecking,
  ],
  listSpacerRow: Array(5).fill('-'),
};

const returnEmojiIfTrue = <TKey extends keyof typeof emojiKey>(
  key: TKey,
  obj: { [K in TKey]?: unknown },
): typeof emojiKey[TKey] | '' => (obj[key] ? emojiKey[key] : '');

const createRuleLink = (ruleName: string): string =>
  `[\`@typescript-eslint/${ruleName}\`](./docs/rules/${ruleName}.md)`;

const buildRuleRow = (rule: RuleDetails): RuleColumn => [
  createRuleLink(rule.name),
  rule.description,
  returnEmojiIfTrue('recommended', rule),
  returnEmojiIfTrue('fixable', rule),
  returnEmojiIfTrue('requiresTypeChecking', rule),
];

const buildRulesTable = (rules: RuleDetails[]): string[][] => [
  staticElements.listHeaderRow,
  staticElements.listSpacerRow,
  ...rules
    .sort(({ name: ruleNameA }, { name: ruleNameB }) =>
      ruleNameA.localeCompare(ruleNameB),
    )
    .map(buildRuleRow),
];

const generateRulesListMarkdown = (rules: RuleDetails[]): string =>
  [
    '',
    staticElements.rulesListKey,
    '',
    ...buildRulesTable(rules).map(column => [...column, ' '].join('|')),
    '',
  ].join('\n');

const updateRulesList = (
  listName: 'base' | 'extension',
  rules: RuleDetails[],
  markdown: string,
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
    generateRulesListMarkdown(rules), //
    markdown.substring(listEndIndex),
  ].join('\n');
};

const rulesDetails: RuleDetails[] = Object.entries(rules)
  .filter(([, rule]) => rule.meta.deprecated !== true)
  .map(([name, rule]) => ({
    name,
    description: rule.meta.docs?.description ?? '',
    recommended: !!rule.meta.docs?.recommended ?? false,
    fixable: !!rule.meta.fixable,
    requiresTypeChecking: rule.meta.docs?.requiresTypeChecking ?? false,
    extendsBaseRule: !!rule.meta.docs?.extendsBaseRule ?? false,
  }));

const baseRules = rulesDetails.filter(rule => !rule.extendsBaseRule);
const extensionRules = rulesDetails.filter(rule => rule.extendsBaseRule);

let readme = fs.readFileSync(path.resolve(__dirname, '../README.md'), 'utf8');

readme = updateRulesList('base', baseRules, readme);
readme = updateRulesList('extension', extensionRules, readme);

readme = prettier.format(readme, { parser: 'markdown' });

fs.writeFileSync(path.resolve(__dirname, '../README.md'), readme, 'utf8');
