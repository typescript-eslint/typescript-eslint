import assert from 'node:assert/strict';

import eslintPlugin from '@typescript-eslint/eslint-plugin';
import tseslint from 'typescript-eslint';

assert.strictEqual(
  tseslint.plugin,
  eslintPlugin,
  'typescript-eslint exports a different plugin object',
);

let foundPluginReference = false;

for (const [configName, config] of Object.entries(tseslint.configs)) {
  const configEntries = Array.isArray(config) ? config : [config];

  for (const configEntry of configEntries) {
    const pluginReference = configEntry.plugins?.['@typescript-eslint'];

    if (pluginReference != null) {
      foundPluginReference = true;
      assert.strictEqual(
        pluginReference,
        eslintPlugin,
        `${configName} references a different plugin object`,
      );
    }
  }
}

assert.ok(foundPluginReference, 'No config references the plugin object');
