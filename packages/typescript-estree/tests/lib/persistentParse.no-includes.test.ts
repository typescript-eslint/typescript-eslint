import { clearCaches } from '../../src/clear-caches';
import {
  baseTests,
  parseFile,
  setup,
  setupPersistentParseTests,
  writeFile,
} from '../test-utils/persistentParse';

setupPersistentParseTests();

describe('persistent parse', () => {
  /*
  If there is no includes, then typescript will ask for a slightly different set of watchers.
  */
  describe.runIf(process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE !== 'true')(
    'tsconfig with no includes / files',
    () => {
      const tsConfigExcludeBar = {
        exclude: ['./src/bar.ts'],
      };
      const tsConfigIncludeAll = {};

      baseTests(tsConfigExcludeBar, tsConfigIncludeAll);

      it('handles tsconfigs with no includes/excludes (single level)', async () => {
        const PROJECT_DIR = await setup({}, false);

        // parse once to: assert the config as correct, and to make sure the program is setup
        expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
        expect(() => parseFile('bar', PROJECT_DIR)).toThrow();

        // write a new file and attempt to parse it
        await writeFile(PROJECT_DIR, 'bar');
        clearCaches();

        expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
        expect(() => parseFile('bar', PROJECT_DIR)).not.toThrow();
      });

      it('handles tsconfigs with no includes/excludes (nested)', async () => {
        const PROJECT_DIR = await setup({}, false);
        const bazSlashBar = 'baz/bar';

        // parse once to: assert the config as correct, and to make sure the program is setup
        expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
        expect(() => parseFile(bazSlashBar, PROJECT_DIR)).toThrow();

        // write a new file and attempt to parse it
        await writeFile(PROJECT_DIR, bazSlashBar);
        clearCaches();

        expect(() => parseFile('foo', PROJECT_DIR)).not.toThrow();
        expect(() => parseFile(bazSlashBar, PROJECT_DIR)).not.toThrow();
      });
    },
  );
});
