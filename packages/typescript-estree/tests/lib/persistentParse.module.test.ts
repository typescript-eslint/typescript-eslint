import {
  parseFile,
  setup,
  setupPersistentParseTests,
  writeFile,
} from '../test-utils/persistentParse';

setupPersistentParseTests();

describe('persistent parse', () => {
  describe('tsconfig with module set', () => {
    const moduleTypes = [
      'None',
      'CommonJS',
      'AMD',
      'System',
      'UMD',
      'ES6',
      'ES2015',
      'ESNext',
    ] as const;

    const testNames = ['object', 'number', 'string', 'foo'] as const;

    describe.for(moduleTypes)('module %s', module => {
      const tsConfigIncludeAll = {
        compilerOptions: { module },
        include: ['./**/*'],
      };

      it.for(testNames)(
        'first parse of %s should not throw',
        async (name, { expect }) => {
          const PROJECT_DIR = await setup(tsConfigIncludeAll);
          await writeFile(PROJECT_DIR, name);
          expect(() => parseFile(name, PROJECT_DIR)).not.toThrow();
        },
      );
    });
  });
});
