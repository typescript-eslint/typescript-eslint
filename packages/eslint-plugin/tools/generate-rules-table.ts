#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';

import rules from '../src/rules';

const rulesData = Object.entries(rules);

function createRuleLink(ruleName: string): string {
  return `[\`@typescript-eslint/${ruleName}\`](./docs/rules/${ruleName}.md)`;
}

interface RuleInfo {
  name: string;
  link: string;
  description: string;
  recommended: boolean;
  fixable: boolean;
  requiresTypeChecking: boolean;
}

const emojiKey = {
  recommended: ':heavy_check_mark:',
  fixable: ':wrench:',
  requiresTypeChecking: ':thought_balloon:',
};

const returnEmojiOrSpaces = <TKey extends keyof typeof emojiKey>(
  key: TKey,
  obj: { [K in TKey]?: unknown },
): string => (!!obj[key] ? emojiKey[key] : ''.padEnd(emojiKey[key].length));

const collectRuleInfos = (): RuleInfo[] => {
  const notDeprecated = rulesData.filter(
    ([, rule]) => rule.meta.deprecated !== true,
  );
  const ruleInfos: RuleInfo[] = [];

  for (const [ruleName, rule] of notDeprecated) {
    ruleInfos.push({
      name: ruleName,
      link: createRuleLink(ruleName),
      description: rule.meta.docs.description,
      recommended: !!rule.meta.docs.recommended,
      fixable: !!rule.meta.fixable,
      requiresTypeChecking: !!rule.meta.docs.requiresTypeChecking,
    });
  }

  return ruleInfos.sort((a, b) => a.name.localeCompare(b.name));
};

const ruleInfos = collectRuleInfos();

const firstColumnLength = ruleInfos.reduce(
  (size, ruleInfo) =>
    ruleInfo.link.length > size ? ruleInfo.link.length : size,
  0,
);

const secondColumnLength = ruleInfos.reduce(
  (size, ruleInfo) =>
    ruleInfo.description.length > size ? ruleInfo.description.length : size,
  0,
);

const joinWithPipes = (columns: string[]): string =>
  [' ', ...columns, ' '].join(' | ').trim();

const ruleColumns: string[] = ruleInfos.map(ruleInfo =>
  joinWithPipes([
    ruleInfo.link.padEnd(firstColumnLength, ' '),
    ruleInfo.description.padEnd(secondColumnLength, ' '),
    returnEmojiOrSpaces('recommended', ruleInfo),
    returnEmojiOrSpaces('fixable', ruleInfo),
    returnEmojiOrSpaces('requiresTypeChecking', ruleInfo),
  ]),
);

const RULES_TABLE_HEADER = joinWithPipes([
  'Name'.padEnd(firstColumnLength, ' '),
  'Description'.padEnd(secondColumnLength, ' '),
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
    firstColumnLength,
    secondColumnLength,
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
  ...ruleColumns,
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
