import { defineConfig } from 'eslint/config';

import plugin from '../src/index';

describe("The plugin object should work with eslint defineConfig's stringly typed extends array", () => {
  it('should not error when explicitly referencing the flat version', () => {
    defineConfig({
      extends: ['ts/flat/strict'],
      plugins: {
        // @ts-expect-error -- types aren't compatible.
        ts: plugin,
      },
    });
  });

  it('should not error when implicitly referencing the flat version', () => {
    defineConfig({
      extends: ['ts/strict'],
      plugins: {
        // @ts-expect-error -- types aren't compatible.
        ts: plugin,
      },
    });
  });
});
