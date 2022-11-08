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

  console.log(`
<details>
<summary>Header Key</summary>

- New = new since version 5.0.0
  - 🆕 = newly added to TypeScript-ESLint
- Ext = extension rule
- Dep = deprecated
  - ☑️ = deprecated in the next major
  - 🗑️ = to be removed from the plugin in the next version
- R = recommended
  - ⚠️ = recommended as warning
  - 🛑  = recommended as an error
  - 🗑️  = remove from recommended this version
- RWT = recommended with typechecking
  - ⚠️ = recommended as warning
  - 🛑  = recommended as an error
  - 🗑️  = remove from recommended this version
- Str = strict
  - ⚠️ = recommended as warning
  - 🗑️  = remove from recommended this version

</details>
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
