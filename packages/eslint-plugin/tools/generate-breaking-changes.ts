async function main(): Promise<void> {
  const {
    default: { default: rules },
  } =
    // @ts-expect-error -- We don't support ESM imports of local code yet.
    (await import('../dist/rules/index.js')) as {
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      default: typeof import('../src/rules');
    };
  const { markdownTable } = await import('markdown-table');

  console.log(`
<details>
<summary>Header Key</summary>

- New = new since version 5.0.0
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
      ['Rule', 'New', 'Ext', 'Dep', 'R', 'RWT', 'Strict', 'Comment'],
      ...Object.entries(rules).map(([ruleName, { meta }]) => {
        const { deprecated } = meta;
        const { recommended, requiresTypeChecking } = meta.docs!;

        return [
          ruleName,
          '',
          meta.docs?.extendsBaseRule ? '☑️' : '',
          deprecated ? '☑️' : '',
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
          '(todo)',
        ];
      }),
    ]),
  );
}

main().catch(error => {
  console.error(error);
});
