import { fetch } from 'cross-fetch';
import { markdownTable } from 'markdown-table';

import type RulesFile from '../src/rules';

interface RulesObject {
  default: {
    default: typeof RulesFile;
  };
}

async function main(): Promise<void> {
  const {
    default: { default: rules },
  } =
    // @ts-expect-error -- We don't support ESM imports of local code yet.
    (await import('../dist/rules/index.js')) as RulesObject;

  // Annotate which rules are new since the last version
  async function getNewRulesAsOfMajorVersion(
    oldVersion: string,
  ): Promise<Set<string>> {
    // 1. Get the current list of rules (already done)
    const newRuleNames = Object.keys(rules);

    // 2. Retrieve the old version of typescript-eslint from unpkg
    const oldUrl = `https://unpkg.com/@typescript-eslint/eslint-plugin@${oldVersion}/dist/configs/all.js`;
    const oldFileText = await (await fetch(oldUrl)).text();
    const oldObjectText = oldFileText.substring(
      oldFileText.indexOf('{'),
      oldFileText.lastIndexOf('}') + 1,
    );
    // Normally we wouldn't condone using the 'eval' API...
    // But this is an internal-only script and it's the easiest way to convert
    // the JS raw text into a runtime object. 🤷
    let oldRulesObject!: { rules: typeof RulesFile };
    eval('oldRulesObject = ' + oldObjectText);
    const oldRuleNames = new Set(Object.keys(oldRulesObject.rules));

    // 3. Get the keys that exist in (1) (new version) and not (2) (old version)
    return new Set(
      newRuleNames.filter(
        newRuleName => !oldRuleNames.has(`@typescript-eslint/${newRuleName}`),
      ),
    );
  }

  const newRuleNames = await getNewRulesAsOfMajorVersion('5.0.0');

  console.log(`## Table Key

<table>
  <thead>
    <tr>
      <th>Column</th>
      <th>Description</th>
      <th>Emojis</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Status</td>
      <td>Being added, deprecated, or removed</td>
      <td>
        <ul>
          <li>🆕 = newly added to typescript-eslint</li>
          <li>🙅 = to be deprecated in the next major</li>
          <li>💀 = currently deprecated; to be removed in the next version</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>TC</td>
      <td>Requires type checking?</td>
      <td>
        <ul>
          <li>💭 = yes</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>Ext</td>
      <td>Extension rule?</td>
      <td>
        <ul>
          <li>🧱 = yes</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>Rec'd</td>
      <td>Recommended</td>
      <td>
        <ul>
          <li>➕ = add to recommended this version</li>
          <li>➖️ = remove from recommended this version</li>
          <li>🟩 = stays in recommended this version</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>Strict</td>
      <td>Strict</td>
      <td>
        <ul>
        <li>➕ = add to strict this version</li>
        <li>➖️ = remove from strict this version</li>
        <li>🔵 = stays in strict this version</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>Style</td>
      <td>Style</td>
      <td>
        <ul>
          <li>➕ = add to stylistic this version</li>
          <li>➖️ = remove from stylistic this version</li>
          <li>🔸 = stays in stylistic this version</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

## Recommendations Table

> Hint: search for 🆕 to find newly added rules, and ➕ or ➖ to see config changes.
`);

  console.log(
    markdownTable([
      ['Rule', 'Status', 'TC', 'Ext', "Rec'd", 'Strict', 'Style', 'Comment'],
      ...Object.entries(rules).map(([ruleName, { meta }]) => {
        const { deprecated } = meta;
        const { extendsBaseRule, recommended, requiresTypeChecking } =
          meta.docs!;

        return [
          `[\`${ruleName}\`](https://typescript-eslint.io/rules/${ruleName})`,
          newRuleNames.has(ruleName) ? '🆕' : deprecated ? '💀' : '',
          requiresTypeChecking ? '💭' : '',
          extendsBaseRule ? '🧱' : '',
          recommended === 'recommended' ? '🟩' : '',
          recommended === 'strict' ? '🔵' : '',
          recommended === 'stylistic' ? '🔸' : '',
          meta.type === 'layout' ? 'layout 💩' : '(todo)',
        ];
      }),
    ]),
  );
}

main().catch(error => {
  console.error(error);
});
