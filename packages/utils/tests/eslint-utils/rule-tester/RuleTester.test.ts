import eslintPackageJson from 'eslint/package.json';

import * as dependencyConstraintsModule from '../../../src/eslint-utils/rule-tester/dependencyConstraints';
import { RuleTester } from '../../../src/eslint-utils/rule-tester/RuleTester';
import type { RuleModule } from '../../../src/ts-eslint';
import { RuleTester as BaseRuleTester } from '../../../src/ts-eslint';

// we can't spy on the exports of an ES module - so we instead have to mock the entire module
jest.mock('../../../src/eslint-utils/rule-tester/dependencyConstraints', () => {
  const dependencyConstraints = jest.requireActual<
    typeof dependencyConstraintsModule
  >('../../../src/eslint-utils/rule-tester/dependencyConstraints');

  return {
    ...dependencyConstraints,
    __esModule: true,
    satisfiesAllDependencyConstraints: jest.fn(
      dependencyConstraints.satisfiesAllDependencyConstraints,
    ),
  };
});
const satisfiesAllDependencyConstraintsMock = jest.mocked(
  dependencyConstraintsModule.satisfiesAllDependencyConstraints,
);

jest.mock(
  'totally-real-dependency/package.json',
  () => ({
    version: '10.0.0',
  }),
  {
    // this is not a real module that will exist
    virtual: true,
  },
);
jest.mock(
  'totally-real-dependency-prerelease/package.json',
  () => ({
    version: '10.0.0-rc.1',
  }),
  {
    // this is not a real module that will exist
    virtual: true,
  },
);

// mock the eslint package.json so that we can manipulate the version in the test
jest.mock('eslint/package.json', () => {
  return {
    // make the version a getter so we can spy on it and change the return value
    get version(): string {
      // fix the version so the test is stable on older ESLint versions
      return '8.0.0';
    },
  };
});

const mockedDescribe = jest.fn();
const mockedIt = jest.fn();
const mockedItOnly = jest.fn();
const mockedAfterAll = jest.fn();
const runSpy = jest.spyOn(BaseRuleTester.prototype, 'run');

const eslintVersionSpy = jest.spyOn(eslintPackageJson, 'version', 'get');

RuleTester.afterAll = mockedAfterAll;
RuleTester.describe = mockedDescribe;
RuleTester.it = mockedIt;
RuleTester.itOnly = mockedItOnly;

beforeEach(() => {
  jest.clearAllMocks();
});

const NOOP_RULE: RuleModule<'error', []> = {
  meta: {
    messages: {
      error: 'error',
    },
    type: 'problem',
    schema: {},
  },
  defaultOptions: [],
  create() {
    return {};
  },
};

describe('RuleTester', () => {
  it('automatically sets the filename for tests', () => {
    const ruleTester = new RuleTester({
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: '/some/path/that/totally/exists/',
      },
    });

    ruleTester.run('my-rule', NOOP_RULE, {
      invalid: [
        {
          code: 'invalid tests should work as well',
          errors: [],
        },
      ],
      valid: [
        'string based valid test',
        {
          code: 'object based valid test',
        },
        {
          code: "explicit filename shouldn't be overwritten",
          filename: '/set/in/the/test.ts',
        },
        {
          code: 'jsx should have the correct filename',
          parserOptions: {
            ecmaFeatures: {
              jsx: true,
            },
          },
        },
        {
          code: 'type-aware parser options should override the constructor config',
          parserOptions: {
            project: 'tsconfig.test-specific.json',
            tsconfigRootDir: '/set/in/the/test/',
          },
        },
      ],
    });

    expect(runSpy.mock.lastCall?.[2]).toMatchInlineSnapshot(`
      {
        "invalid": [
          {
            "code": "invalid tests should work as well",
            "errors": [],
            "filename": "/some/path/that/totally/exists/file.ts",
          },
        ],
        "valid": [
          {
            "code": "string based valid test",
            "filename": "/some/path/that/totally/exists/file.ts",
          },
          {
            "code": "object based valid test",
            "filename": "/some/path/that/totally/exists/file.ts",
          },
          {
            "code": "explicit filename shouldn't be overwritten",
            "filename": "/set/in/the/test.ts",
          },
          {
            "code": "jsx should have the correct filename",
            "filename": "/some/path/that/totally/exists/file.tsx",
            "parserOptions": {
              "ecmaFeatures": {
                "jsx": true,
              },
            },
          },
          {
            "code": "type-aware parser options should override the constructor config",
            "filename": "/set/in/the/test/file.ts",
            "parserOptions": {
              "project": "tsconfig.test-specific.json",
              "tsconfigRootDir": "/set/in/the/test/",
            },
          },
        ],
      }
    `);
  });

  describe('checks dependencies as specified', () => {
    it('does not check dependencies if there are no dependency constraints', () => {
      const ruleTester = new RuleTester({
        parser: '@typescript-eslint/parser',
      });

      ruleTester.run('my-rule', NOOP_RULE, {
        valid: [
          'const x = 1;',
          { code: 'const x = 2;' },
          // empty object is ignored
          { code: 'const x = 3;', dependencyConstraints: {} },
        ],
        invalid: [],
      });

      expect(satisfiesAllDependencyConstraintsMock).not.toHaveBeenCalled();
    });

    describe('at-least', () => {
      it('correctly handles string-based at-least', () => {
        const ruleTester = new RuleTester({
          parser: '@typescript-eslint/parser',
        });

        ruleTester.run('my-rule', NOOP_RULE, {
          invalid: [
            {
              code: 'failing - major',
              errors: [],
              dependencyConstraints: {
                'totally-real-dependency': '999',
              },
            },
            {
              code: 'failing - major.minor',
              errors: [],
              dependencyConstraints: {
                'totally-real-dependency': '999.0',
              },
            },
            {
              code: 'failing - major.minor.patch',
              errors: [],
              dependencyConstraints: {
                'totally-real-dependency': '999.0.0',
              },
            },
          ],
          valid: [
            {
              code: 'passing - major',
              dependencyConstraints: {
                'totally-real-dependency': '10',
              },
            },
            {
              code: 'passing - major.minor',
              dependencyConstraints: {
                'totally-real-dependency': '10.0',
              },
            },
            {
              code: 'passing - major.minor.patch',
              dependencyConstraints: {
                'totally-real-dependency': '10.0.0',
              },
            },
          ],
        });

        expect(runSpy.mock.lastCall?.[2]).toMatchInlineSnapshot(`
          {
            "invalid": [
              {
                "code": "failing - major",
                "dependencyConstraints": {
                  "totally-real-dependency": "999",
                },
                "errors": [],
                "filename": "file.ts",
                "only": false,
              },
              {
                "code": "failing - major.minor",
                "dependencyConstraints": {
                  "totally-real-dependency": "999.0",
                },
                "errors": [],
                "filename": "file.ts",
                "only": false,
              },
              {
                "code": "failing - major.minor.patch",
                "dependencyConstraints": {
                  "totally-real-dependency": "999.0.0",
                },
                "errors": [],
                "filename": "file.ts",
                "only": false,
              },
            ],
            "valid": [
              {
                "code": "passing - major",
                "dependencyConstraints": {
                  "totally-real-dependency": "10",
                },
                "filename": "file.ts",
                "only": true,
              },
              {
                "code": "passing - major.minor",
                "dependencyConstraints": {
                  "totally-real-dependency": "10.0",
                },
                "filename": "file.ts",
                "only": true,
              },
              {
                "code": "passing - major.minor.patch",
                "dependencyConstraints": {
                  "totally-real-dependency": "10.0.0",
                },
                "filename": "file.ts",
                "only": true,
              },
            ],
          }
        `);
      });

      it('correctly handles object-based at-least', () => {
        const ruleTester = new RuleTester({
          parser: '@typescript-eslint/parser',
        });

        ruleTester.run('my-rule', NOOP_RULE, {
          invalid: [
            {
              code: 'failing - major',
              errors: [],
              dependencyConstraints: {
                'totally-real-dependency': {
                  type: 'at-least',
                  version: '999',
                },
              },
            },
            {
              code: 'failing - major.minor',
              errors: [],
              dependencyConstraints: {
                'totally-real-dependency': {
                  type: 'at-least',
                  version: '999.0',
                },
              },
            },
            {
              code: 'failing - major.minor.patch',
              errors: [],
              dependencyConstraints: {
                'totally-real-dependency': {
                  type: 'at-least',
                  version: '999.0.0',
                },
              },
            },
          ],
          valid: [
            {
              code: 'passing - major',
              dependencyConstraints: {
                'totally-real-dependency': {
                  type: 'at-least',
                  version: '10',
                },
              },
            },
            {
              code: 'passing - major.minor',
              dependencyConstraints: {
                'totally-real-dependency': {
                  type: 'at-least',
                  version: '10.0',
                },
              },
            },
            {
              code: 'passing - major.minor.patch',
              dependencyConstraints: {
                'totally-real-dependency': {
                  type: 'at-least',
                  version: '10.0.0',
                },
              },
            },
          ],
        });

        expect(runSpy.mock.lastCall?.[2]).toMatchInlineSnapshot(`
          {
            "invalid": [
              {
                "code": "failing - major",
                "dependencyConstraints": {
                  "totally-real-dependency": {
                    "type": "at-least",
                    "version": "999",
                  },
                },
                "errors": [],
                "filename": "file.ts",
                "only": false,
              },
              {
                "code": "failing - major.minor",
                "dependencyConstraints": {
                  "totally-real-dependency": {
                    "type": "at-least",
                    "version": "999.0",
                  },
                },
                "errors": [],
                "filename": "file.ts",
                "only": false,
              },
              {
                "code": "failing - major.minor.patch",
                "dependencyConstraints": {
                  "totally-real-dependency": {
                    "type": "at-least",
                    "version": "999.0.0",
                  },
                },
                "errors": [],
                "filename": "file.ts",
                "only": false,
              },
            ],
            "valid": [
              {
                "code": "passing - major",
                "dependencyConstraints": {
                  "totally-real-dependency": {
                    "type": "at-least",
                    "version": "10",
                  },
                },
                "filename": "file.ts",
                "only": true,
              },
              {
                "code": "passing - major.minor",
                "dependencyConstraints": {
                  "totally-real-dependency": {
                    "type": "at-least",
                    "version": "10.0",
                  },
                },
                "filename": "file.ts",
                "only": true,
              },
              {
                "code": "passing - major.minor.patch",
                "dependencyConstraints": {
                  "totally-real-dependency": {
                    "type": "at-least",
                    "version": "10.0.0",
                  },
                },
                "filename": "file.ts",
                "only": true,
              },
            ],
          }
        `);
      });
    });

    describe('semver', () => {
      it('correctly handles object-based at-least', () => {
        const ruleTester = new RuleTester({
          parser: '@typescript-eslint/parser',
        });

        ruleTester.run('my-rule', NOOP_RULE, {
          invalid: [
            {
              code: 'failing - major',
              errors: [],
              dependencyConstraints: {
                'totally-real-dependency': {
                  type: 'semver',
                  range: '^999',
                },
              },
            },
            {
              code: 'failing - major.minor',
              errors: [],
              dependencyConstraints: {
                'totally-real-dependency': {
                  type: 'semver',
                  range: '>=999.0',
                },
              },
            },

            {
              code: 'failing with options',
              errors: [],
              dependencyConstraints: {
                'totally-real-dependency-prerelease': {
                  type: 'semver',
                  range: '^10',
                  options: {
                    includePrerelease: false,
                  },
                },
              },
            },
          ],
          valid: [
            {
              code: 'passing - major',
              dependencyConstraints: {
                'totally-real-dependency': {
                  type: 'semver',
                  range: '^10',
                },
              },
            },
            {
              code: 'passing - major.minor',
              dependencyConstraints: {
                'totally-real-dependency': {
                  type: 'semver',
                  range: '<999',
                },
              },
            },
          ],
        });

        expect(runSpy.mock.lastCall?.[2]).toMatchInlineSnapshot(`
          {
            "invalid": [
              {
                "code": "failing - major",
                "dependencyConstraints": {
                  "totally-real-dependency": {
                    "range": "^999",
                    "type": "semver",
                  },
                },
                "errors": [],
                "filename": "file.ts",
                "only": false,
              },
              {
                "code": "failing - major.minor",
                "dependencyConstraints": {
                  "totally-real-dependency": {
                    "range": ">=999.0",
                    "type": "semver",
                  },
                },
                "errors": [],
                "filename": "file.ts",
                "only": false,
              },
              {
                "code": "failing with options",
                "dependencyConstraints": {
                  "totally-real-dependency-prerelease": {
                    "options": {
                      "includePrerelease": false,
                    },
                    "range": "^10",
                    "type": "semver",
                  },
                },
                "errors": [],
                "filename": "file.ts",
                "only": false,
              },
            ],
            "valid": [
              {
                "code": "passing - major",
                "dependencyConstraints": {
                  "totally-real-dependency": {
                    "range": "^10",
                    "type": "semver",
                  },
                },
                "filename": "file.ts",
                "only": true,
              },
              {
                "code": "passing - major.minor",
                "dependencyConstraints": {
                  "totally-real-dependency": {
                    "range": "<999",
                    "type": "semver",
                  },
                },
                "filename": "file.ts",
                "only": true,
              },
            ],
          }
        `);
      });
    });

    it('tests without versions should always be run', () => {
      const ruleTester = new RuleTester({
        parser: '@typescript-eslint/parser',
      });

      ruleTester.run('my-rule', NOOP_RULE, {
        invalid: [
          {
            code: 'no constraints is always run',
            errors: [],
          },
          {
            code: 'empty object is always run',
            errors: [],
            dependencyConstraints: {},
          },
          {
            code: 'failing constraint',
            errors: [],
            dependencyConstraints: {
              'totally-real-dependency': '99999',
            },
          },
        ],
        valid: [
          'string based is always run',
          {
            code: 'no constraints is always run',
          },
          {
            code: 'empty object is always run',
            dependencyConstraints: {},
          },
          {
            code: 'passing constraint',
            dependencyConstraints: {
              'totally-real-dependency': '10',
            },
          },
        ],
      });

      expect(runSpy.mock.lastCall?.[2]).toMatchInlineSnapshot(`
        {
          "invalid": [
            {
              "code": "no constraints is always run",
              "errors": [],
              "filename": "file.ts",
              "only": true,
            },
            {
              "code": "empty object is always run",
              "dependencyConstraints": {},
              "errors": [],
              "filename": "file.ts",
              "only": true,
            },
            {
              "code": "failing constraint",
              "dependencyConstraints": {
                "totally-real-dependency": "99999",
              },
              "errors": [],
              "filename": "file.ts",
              "only": false,
            },
          ],
          "valid": [
            {
              "code": "string based is always run",
              "filename": "file.ts",
              "only": true,
            },
            {
              "code": "no constraints is always run",
              "filename": "file.ts",
              "only": true,
            },
            {
              "code": "empty object is always run",
              "dependencyConstraints": {},
              "filename": "file.ts",
              "only": true,
            },
            {
              "code": "passing constraint",
              "dependencyConstraints": {
                "totally-real-dependency": "10",
              },
              "filename": "file.ts",
              "only": true,
            },
          ],
        }
      `);
    });

    it('uses filter instead of "only" for old ESLint versions', () => {
      // need it twice because ESLint internally fetches this value once :(
      eslintVersionSpy.mockReturnValueOnce('1.0.0');
      eslintVersionSpy.mockReturnValueOnce('1.0.0');

      const ruleTester = new RuleTester({
        parser: '@typescript-eslint/parser',
      });

      ruleTester.run('my-rule', NOOP_RULE, {
        invalid: [
          {
            code: 'failing',
            errors: [],
            dependencyConstraints: {
              'totally-real-dependency': '999',
            },
          },
          {
            code: 'passing',
            errors: [],
            dependencyConstraints: {
              'totally-real-dependency': '10',
            },
          },
        ],
        valid: [
          'always passing string test',
          {
            code: 'failing',
            dependencyConstraints: {
              'totally-real-dependency': '999',
            },
          },
          {
            code: 'passing',
            dependencyConstraints: {
              'totally-real-dependency': '10',
            },
          },
        ],
      });

      expect(runSpy.mock.lastCall?.[2]).toMatchInlineSnapshot(`
        {
          "invalid": [
            {
              "code": "passing",
              "dependencyConstraints": {
                "totally-real-dependency": "10",
              },
              "errors": [],
              "filename": "file.ts",
            },
          ],
          "valid": [
            {
              "code": "always passing string test",
              "filename": "file.ts",
            },
            {
              "code": "passing",
              "dependencyConstraints": {
                "totally-real-dependency": "10",
              },
              "filename": "file.ts",
            },
          ],
        }
      `);
    });
  });
});
