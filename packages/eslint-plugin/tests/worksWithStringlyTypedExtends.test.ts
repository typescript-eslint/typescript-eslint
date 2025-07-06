import { defineConfig } from 'eslint/config';

import plugin from '../src/index.js';

describe("The plugin object should work with eslint defineConfig's stringly typed extends array", () => {
  it('should not error when explicitly referencing the flat version', () => {
    expect(() => {
      defineConfig({
        extends: ['ts/flat/strict'],
        plugins: {
          // @ts-expect-error -- types aren't compatible.
          ts: plugin,
        },
      });
    }).not.toThrow();
  });

  it('should not error when implicitly referencing the flat version', () => {
    expect(() => {
      defineConfig({
        extends: ['ts/strict'],
        plugins: {
          // @ts-expect-error -- types aren't compatible.
          ts: plugin,
        },
      });
    }).not.toThrow();
  });
});
