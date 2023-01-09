// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type RulesFile = typeof import('../src/rules');

interface RulesObject {
  default: RulesFile;
}

async function main(): Promise<void> {
  const {
    default: { default: rules },
  } =
    // @ts-expect-error -- We don't support ESM imports of local code yet.
    (await import('../dist/rules/index.js')) as RulesObject;
  const { markdownTable } = await import('markdown-table');
  const { fetch } = await import('cross-fetch');

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
          <li>🙅 = deprecated in the next major</li>
          <li>➖️ = to be removed from the plugin in the next version</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>Ext</td>
      <td>Extension rule?</td>
      <td>
        <ul>
          <li>☑️ = yes</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>R</td>
      <td>Recommended</td>
      <td>
        <ul>
          <li>➕ = add to recommended this version</li>
          <li>⚠️ = recommended as warning</li>
          <li>🛑 = recommended as an error</li>
          <li>➖️ = remove from recommended this version</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>RWT</td>
      <td>Recommended-requiring-type-checking</td>
      <td>
        <ul>
          <li>➕ = add to recommended-with-typechecking this version</li>
          <li>⚠️ = recommended as warning</li>
          <li>🛑 = recommended as an error</li>
          <li>➖️ = remove from recommended this version</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>Strict</td>
      <td>Strict</td>
      <td>
        <ul>
          <li>➕ = add to strict this version</li>
          <li>⚠️ = recommended as warning</li>
          <li>➖️ = remove from strict this version</li>
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
      ['Rule', 'Status', 'Ext', 'R', 'RWT', 'Strict', 'Comment'],
      ...Object.entries(rules).map(([ruleName, { meta }]) => {
        const { deprecated } = meta;
        const { extendsBaseRule, recommended, requiresTypeChecking } =
          meta.docs!;

        return [
          `[\`${ruleName}\`](https://typescript-eslint.io/rules/${ruleName})`,
          newRuleNames.has(ruleName) ? '🆕' : deprecated ? '🙅' : '',
          extendsBaseRule ? '☑️' : '',
          recommended &&
          ['error', 'warn'].includes(recommended) &&
          !requiresTypeChecking
            ? '🛑'
            : '',
          recommended &&
          ['error', 'warn'].includes(recommended) &&
          requiresTypeChecking
            ? '🛑'
            : '',
          recommended === 'strict' ? '⚠️' : '',
          meta.type === 'layout' ? 'layout 💩' : '(todo)',
        ];
      }),
    ]),
  );

  //  Annotate which rules are new since version 5.0.0
  async function getNewRulesAsOfMajorVersion(
    oldVersion: string,
  ): Promise<Set<string>> {
    // 1. Get the current list of rules (already done)
    const newRuleNames = Object.keys(rules);

    // 2. Use some CDN thing for the 5.X version of typescript-eslint
    const oldUrl = `https://unpkg.com/@typescript-eslint/eslint-plugin@${oldVersion}/dist/configs/all.js`;
    const oldFileText = await (await fetch(oldUrl)).text();
    const oldObjectText = oldFileText.substring(
      oldFileText.indexOf('{'),
      oldFileText.lastIndexOf('}') + 1,
    );
    // Normally we wouldn't condone using the 'eval' API...
    // But this is an internal-only script and it's the easiest way to convert
    // the JS raw text into a runtime object. 🤷
    let oldRulesObject!: { rules: RulesFile };
    eval('oldRulesObject = ' + oldObjectText);
    const oldRuleNames = new Set(Object.keys(oldRulesObject.rules));

    // 3. Get the keys that exist in (1) (new version) and not (2) (old version)
    return new Set(
      newRuleNames.filter(
        newRuleName => !oldRuleNames.has(`@typescript-eslint/${newRuleName}`),
      ),
    );
  }

  await getNewRulesAsOfMajorVersion('5.0.0');
}

main().catch(error => {
  console.error(error);
});
