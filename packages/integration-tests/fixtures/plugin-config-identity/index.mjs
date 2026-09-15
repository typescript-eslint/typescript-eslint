import assert from 'node:assert/strict';
import eslintPlugin from '@typescript-eslint/eslint-plugin';
import tseslint from 'typescript-eslint';

assert.strictEqual(
  tseslint.plugin,
  eslintPlugin,
  'typescript-eslint exports a different plugin object',
);

for (const [configName, config] of Object.entries(tseslint.configs)) {
  const configEntries = Array.isArray(config) ? config : [config];
  const pluginReferences = configEntries
    .map(configEntry => configEntry.plugins?.['@typescript-eslint'])
    .filter(pluginReference => pluginReference != null);

  for (const pluginReference of pluginReferences) {
    assert.strictEqual(
      pluginReference,
      eslintPlugin,
      `'typescript-eslint/${configName}' config references a different plugin object than '@typescript-eslint/eslint-plugin'`,
    );
  }
}
