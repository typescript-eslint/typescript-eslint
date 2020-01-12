#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';

import rules from '../src/rules';

const rulesData = Object.entries(rules);

function createRuleLink(ruleName: string): string {
  return `[\`@typescript-eslint/${ruleName}\`](./docs/rules/${ruleName}.md)`;
}

const emojiKey = {
  recommended: ':heavy_check_mark:',
  fixable: ':wrench:',
  requiresTypeChecking: ':thought_balloon:',
};

const returnEmojiOrSpaces = <TKey extends keyof typeof emojiKey>(
  key: TKey,
  obj: { [K in TKey]?: unknown },
): string => (obj[key] ? emojiKey[key] : ''.padEnd(emojiKey[key].length));

const joinWithPipes = (columns: string[]): string =>
  [' ', ...columns, ' '].join(' | ').trim();

const ruleColumns = rulesData
  .filter(([, rule]) => rule.meta.deprecated !== true)
  .sort(([ruleNameA], [ruleNameB]) => ruleNameA.localeCompare(ruleNameB))
  .map(([ruleName, rule]) => [
    createRuleLink(ruleName),
    rule.meta.docs.description,
    returnEmojiOrSpaces('recommended', rule.meta.docs),
    returnEmojiOrSpaces('fixable', rule.meta),
    returnEmojiOrSpaces('requiresTypeChecking', rule.meta.docs),
  ]);

const [nameColumnLength, descriptionColumnLength] = ruleColumns.reduce(
  ([nameColumnSize, descColumnSize], [nameStr, descStr]) => [
    nameStr.length > nameColumnSize ? nameStr.length : nameColumnSize,
    descStr.length > descColumnSize ? descStr.length : descColumnSize,
  ],
  [0, 0],
);

const RULES_TABLE_HEADER = joinWithPipes([
  'Name'.padEnd(nameColumnLength, ' '),
  'Description'.padEnd(descriptionColumnLength, ' '),
  emojiKey.recommended,
  emojiKey.fixable,
  emojiKey.requiresTypeChecking,
]);

const markerRulesListBegin = '<!-- begin rule list -->';
const markerPrettierIgnore = '<!-- prettier-ignore -->';
const markerRulesListEnd = '<!-- end rule list -->';
const rulesListKey = [
  `**Key**: ${emojiKey.recommended} = recommended`,
  `${emojiKey.fixable} = fixable`,
  `${emojiKey.requiresTypeChecking} = requires type information`,
].join(', ');
const separator = joinWithPipes(
  [
    nameColumnLength,
    descriptionColumnLength,
    emojiKey.recommended.length,
    emojiKey.fixable.length,
    emojiKey.requiresTypeChecking.length,
  ].map(n => '-'.repeat(n)),
);

const allTogetherNow = [
  markerRulesListBegin,
  '',
  rulesListKey,
  '',
  markerPrettierIgnore,
  RULES_TABLE_HEADER,
  separator,
  ...ruleColumns.map(([name, description, ...rest]) =>
    joinWithPipes([
      name.padEnd(nameColumnLength, ' '),
      description.padEnd(descriptionColumnLength, ' '),
      ...rest,
    ]),
  ),
  '',
].join('\n');

const readmeRaw = fs.readFileSync(
  path.resolve(__dirname, '../README.md'),
  'utf8',
);

const rulesListStartIndex = readmeRaw.indexOf(markerRulesListBegin);
const rulesListEndIndex = readmeRaw.indexOf(markerRulesListEnd);

if (rulesListStartIndex === -1 || rulesListEndIndex === -1) {
  throw new Error('cannot find start or end of table');
}

const readmeUpdated = [
  readmeRaw.substring(0, rulesListStartIndex - 1),
  allTogetherNow, //
  readmeRaw.substring(rulesListEndIndex),
].join('\n');

fs.writeFileSync(
  path.resolve(__dirname, '../README.md'),
  readmeUpdated,
  'utf8',
);
