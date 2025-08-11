import type { TSESTree } from '@typescript-eslint/utils';
import type { Linter, RuleModule } from '@typescript-eslint/utils/ts-eslint';
import type { MockInstance } from 'vitest';

import * as parser from '@typescript-eslint/parser';
import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import path from 'node:path';

import type { InvalidTestCase, RuleTesterConfig, ValidTestCase } from '../src';
import type { RuleTesterTestFrameworkFunctionBase } from '../src/TestFramework';

import { RuleTester } from '../src/RuleTester';
import * as dependencyConstraintsModule from '../src/utils/dependencyConstraints';

// we can't spy on the exports of an ES module - so we instead have to mock the entire module
vi.mock(
  import('../src/utils/dependencyConstraints.js'),
  async importOriginal => {
    const dependencyConstraints = await importOriginal();

    return {
      ...dependencyConstraints,
      __esModule: true,
      satisfiesAllDependencyConstraints: vi.fn(
        dependencyConstraints.satisfiesAllDependencyConstraints,
      ),
    };
  },
);

const satisfiesAllDependencyConstraintsMock = vi.mocked(
  dependencyConstraintsModule.satisfiesAllDependencyConstraints,
);

vi.mock('totally-real-dependency/package.json', () => ({
  version: '10.0.0',
}));

vi.mock('totally-real-dependency-prerelease/package.json', () => ({
  version: '10.0.0-rc.1',
}));

vi.mock(import('@typescript-eslint/parser'), async importOriginal => {
  const actualParser = await importOriginal();

  return {
    ...actualParser,
    __esModule: true,
    clearCaches: vi.fn(),
    default: actualParser.default,
    length: 1,
  };
});

/* eslint-disable vitest/prefer-spy-on --
     we need to specifically assign to the properties or else it will use the
     global value and register actual tests! */
const IMMEDIATE_CALLBACK: RuleTesterTestFrameworkFunctionBase = (_, cb) => cb();
RuleTester.afterAll = vi.fn(/* intentionally don't immediate callback here */);
RuleTester.describe = vi.fn(IMMEDIATE_CALLBACK);
RuleTester.describeSkip = vi.fn(IMMEDIATE_CALLBACK);
RuleTester.it = vi.fn(IMMEDIATE_CALLBACK);
RuleTester.itOnly = vi.fn(IMMEDIATE_CALLBACK);
RuleTester.itSkip = vi.fn(IMMEDIATE_CALLBACK);
/* eslint-enable vitest/prefer-spy-on */

const mockedAfterAll = vi.mocked(RuleTester.afterAll);
const mockedDescribe = vi.mocked(RuleTester.describe);
const mockedDescribeSkip = vi.mocked(RuleTester.describeSkip);
const mockedIt = vi.mocked(RuleTester.it);
const _mockedItOnly = vi.mocked(RuleTester.itOnly);
const _mockedItSkip = vi.mocked(RuleTester.itSkip);
const mockedParserClearCaches = vi.mocked(parser.clearCaches);

const EMPTY_PROGRAM: TSESTree.Program = {
  body: [],
  comments: [],
  loc: { end: { column: 0, line: 0 }, start: { column: 0, line: 0 } },
  range: [0, 0],
  sourceType: 'module',
  tokens: [],
  type: AST_NODE_TYPES.Program,
};

const NOOP_RULE: RuleModule<'error'> = {
  create() {
    return {};
  },
  defaultOptions: [],
  meta: {
    messages: {
      error: 'error',
    },
    schema: [],
    type: 'problem',
  },
};

function windowsToPosixPath(p: string): string {
  if (process.platform !== 'win32') {
    return p;
  }
  const parsed = path.parse(p);
  const hasDriveLetter = /^[a-zA-Z]:/.test(parsed.root);
  let rv = p;
  if (hasDriveLetter) {
    rv = rv.substring(2);
  }
  return rv.replaceAll('\\', '/');
}

describe(RuleTester, () => {
  const runRuleForItemSpy: MockInstance<
    (
      ruleName: string,
      rule: unknown,
      item: InvalidTestCase<string, unknown[]> | ValidTestCase<unknown[]>,
    ) => {
      afterAST: TSESTree.Program;
      beforeAST: TSESTree.Program;
      config: RuleTesterConfig;
      filename?: string;
      messages: Linter.LintMessage[];
      outputs: string[];
    }
  > = vi.spyOn(
    RuleTester.prototype,
    // @ts-expect-error -- method is private
    'runRuleForItem',
  );
  beforeEach(() => {
    vi.clearAllMocks();
  });
  runRuleForItemSpy.mockImplementation((_1, _2, testCase) => {
    return {
      afterAST: EMPTY_PROGRAM,
      beforeAST: EMPTY_PROGRAM,
      config: {},
      messages:
        'errors' in testCase
          ? [
              {
                column: 0,
                line: 0,
                message: 'error',
                messageId: 'error',
                nodeType: AST_NODE_TYPES.Program,
                ruleId: 'my-rule',
                severity: 2,
                source: null,
              },
            ]
          : [],
      outputs: [testCase.code],
    };
  });

  function getTestConfigFromCall(): unknown[] {
    return runRuleForItemSpy.mock.calls.map(c => {
      // structuredClone cannot be used since it has functions and such
      const rv = { ...c[2] };
      if (rv.filename) {
        rv.filename = windowsToPosixPath(rv.filename);
      }

      if (rv.languageOptions?.parserOptions?.tsconfigRootDir) {
        rv.languageOptions = { ...rv.languageOptions };

        // @ts-expect-error readonly-ness
        rv.languageOptions.parserOptions = {
          ...rv.languageOptions.parserOptions,
        };
        // @ts-expect-error readonly-ness
        rv.languageOptions.parserOptions.tsconfigRootDir = windowsToPosixPath(
          rv.languageOptions.parserOptions.tsconfigRootDir!,
        );
      }

      return rv;
    });
  }

  describe('filenames', () => {
    it('automatically sets the filename for tests', () => {
      const ruleTester = new RuleTester({
        languageOptions: {
          parser,
          parserOptions: {
            project: 'tsconfig.json',
            tsconfigRootDir: '/some/path/that/totally/exists/',
          },
        },
      });

      ruleTester.run('my-rule', NOOP_RULE, {
        invalid: [
          {
            code: 'invalid tests should work as well',
            errors: [{ messageId: 'error' }],
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
            languageOptions: {
              parserOptions: {
                ecmaFeatures: {
                  jsx: true,
                },
              },
            },
          },
          {
            code: 'type-aware parser options should override the constructor config',
            languageOptions: {
              parserOptions: {
                project: 'tsconfig.test-specific.json',
                tsconfigRootDir: '/set/in/the/test/',
              },
            },
          },
        ],
      });

      expect(getTestConfigFromCall()).toMatchInlineSnapshot(`
        [
          {
            "code": "string based valid test",
            "filename": "/some/path/that/totally/exists/file.ts",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
              },
            },
          },
          {
            "code": "object based valid test",
            "filename": "/some/path/that/totally/exists/file.ts",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
              },
            },
          },
          {
            "code": "explicit filename shouldn't be overwritten",
            "filename": "/some/path/that/totally/exists/set/in/the/test.ts",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
              },
            },
          },
          {
            "code": "jsx should have the correct filename",
            "filename": "/some/path/that/totally/exists/react.tsx",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
                "ecmaFeatures": {
                  "jsx": true,
                },
              },
            },
          },
          {
            "code": "type-aware parser options should override the constructor config",
            "filename": "/set/in/the/test/file.ts",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
                "project": "tsconfig.test-specific.json",
                "tsconfigRootDir": "/set/in/the/test/",
              },
            },
          },
          {
            "code": "invalid tests should work as well",
            "errors": [
              {
                "messageId": "error",
              },
            ],
            "filename": "/some/path/that/totally/exists/file.ts",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
              },
            },
          },
        ]
      `);
    });

    it('allows the automated filenames to be overridden in the constructor', () => {
      const ruleTester = new RuleTester({
        defaultFilenames: {
          ts: 'set-in-constructor.ts',
          tsx: 'react-set-in-constructor.tsx',
        },
        languageOptions: {
          parser,
          parserOptions: {
            project: 'tsconfig.json',
            tsconfigRootDir: path.resolve('/some/path/that/totally/exists/'),
          },
        },
      });

      ruleTester.run('my-rule', NOOP_RULE, {
        invalid: [],
        valid: [
          {
            code: 'normal',
          },
          {
            code: 'jsx',
            languageOptions: {
              parserOptions: {
                ecmaFeatures: {
                  jsx: true,
                },
              },
            },
          },
        ],
      });

      expect(getTestConfigFromCall()).toMatchInlineSnapshot(`
        [
          {
            "code": "normal",
            "filename": "/some/path/that/totally/exists/set-in-constructor.ts",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
              },
            },
          },
          {
            "code": "jsx",
            "filename": "/some/path/that/totally/exists/react-set-in-constructor.tsx",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
                "ecmaFeatures": {
                  "jsx": true,
                },
              },
            },
          },
        ]
      `);
    });
  });

  it('schedules the parser caches to be cleared afterAll', () => {
    // it should schedule the afterAll
    expect(mockedAfterAll).not.toHaveBeenCalled();
    new RuleTester({
      languageOptions: {
        parser,
        parserOptions: {
          project: 'tsconfig.json',
          tsconfigRootDir: path.resolve('/some/path/that/totally/exists/'),
        },
      },
    });
    expect(mockedAfterAll).toHaveBeenCalledOnce();

    // the provided callback should clear the caches
    const callback = mockedAfterAll.mock.calls[0][0];
    expect(callback).toBeTypeOf('function');
    expect(mockedParserClearCaches).not.toHaveBeenCalled();
    callback();
    // FIXME: We should not have to call this. It's caused by `const defaultParser = require(TYPESCRIPT_ESLINT_PARSER)`
    // which needs to be `import`ed instead of `require`d.
    mockedParserClearCaches();
    expect(mockedParserClearCaches).toHaveBeenCalledOnce();
  });

  it('provided linterOptions should be respected', () => {
    const ruleTester = new RuleTester({
      linterOptions: {
        reportUnusedDisableDirectives: 0,
      },
    });

    expect(() => {
      ruleTester.run('my-rule', NOOP_RULE, {
        invalid: [],
        valid: ['// eslint-disable-next-line'],
      });
    }).not.toThrow();
  });

  it('throws an error if you attempt to set the parser to ts-eslint at the test level', () => {
    const ruleTester = new RuleTester({
      languageOptions: {
        parser,
        parserOptions: {
          project: 'tsconfig.json',
          tsconfigRootDir: path.resolve('/some/path/that/totally/exists/'),
        },
      },
    });

    expect(() =>
      ruleTester.run('my-rule', NOOP_RULE, {
        invalid: [],

        valid: [
          {
            code: 'object based valid test',
            languageOptions: { parser },
          },
        ],
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Do not set the parser at the test level unless you want to use a parser other than "@typescript-eslint/parser"]`,
    );
  });

  describe('checks dependencies as specified', () => {
    it('does not check dependencies if there are no dependency constraints', () => {
      const ruleTester = new RuleTester({
        languageOptions: { parser },
      });

      ruleTester.run('my-rule', NOOP_RULE, {
        invalid: [],
        valid: [
          'const x = 1;',
          { code: 'const x = 2;' },
          // empty object is ignored
          { code: 'const x = 3;', dependencyConstraints: {} },
        ],
      });

      expect(satisfiesAllDependencyConstraintsMock).not.toHaveBeenCalled();
    });

    describe('does not check dependencies if is an "only" manually set', () => {
      it('in the valid section', () => {
        const ruleTester = new RuleTester({
          languageOptions: { parser },
        });

        ruleTester.run('my-rule', NOOP_RULE, {
          invalid: [],
          valid: [
            'const x = 1;',
            { code: 'const x = 2;' },
            {
              code: 'const x = 3;',
              only: true,
            },
            {
              code: 'const x = 4;',
              dependencyConstraints: {
                'totally-real-dependency': '999',
              },
            },
          ],
        });

        expect(satisfiesAllDependencyConstraintsMock).not.toHaveBeenCalled();
      });

      it('in the invalid section', () => {
        const ruleTester = new RuleTester({
          languageOptions: { parser },
        });

        ruleTester.run('my-rule', NOOP_RULE, {
          invalid: [
            {
              code: 'const x = 3;',
              errors: [{ messageId: 'error' }],
              only: true,
            },
          ],
          valid: [
            'const x = 1;',
            { code: 'const x = 2;' },
            {
              code: 'const x = 4;',
              dependencyConstraints: {
                'totally-real-dependency': '999',
              },
            },
          ],
        });

        expect(satisfiesAllDependencyConstraintsMock).not.toHaveBeenCalled();
      });
    });

    it('correctly handles string-based at-least', () => {
      satisfiesAllDependencyConstraintsMock.mockReturnValueOnce(true);
      satisfiesAllDependencyConstraintsMock.mockReturnValueOnce(true);
      satisfiesAllDependencyConstraintsMock.mockReturnValueOnce(true);
      satisfiesAllDependencyConstraintsMock.mockReturnValueOnce(false);
      satisfiesAllDependencyConstraintsMock.mockReturnValueOnce(false);
      satisfiesAllDependencyConstraintsMock.mockReturnValueOnce(false);
      const ruleTester = new RuleTester({
        languageOptions: { parser },
      });

      ruleTester.run('my-rule', NOOP_RULE, {
        invalid: [
          {
            code: 'failing - major',
            dependencyConstraints: {
              'totally-real-dependency': '999',
            },
            errors: [{ messageId: 'error' }],
          },
          {
            code: 'failing - major.minor',
            dependencyConstraints: {
              'totally-real-dependency': '999.0',
            },
            errors: [{ messageId: 'error' }],
          },
          {
            code: 'failing - major.minor.patch',
            dependencyConstraints: {
              'totally-real-dependency': '999.0.0',
            },
            errors: [{ messageId: 'error' }],
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

      expect(getTestConfigFromCall()).toMatchInlineSnapshot(`
        [
          {
            "code": "passing - major",
            "dependencyConstraints": {
              "totally-real-dependency": "10",
            },
            "filename": "file.ts",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
              },
            },
            "skip": false,
          },
          {
            "code": "passing - major.minor",
            "dependencyConstraints": {
              "totally-real-dependency": "10.0",
            },
            "filename": "file.ts",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
              },
            },
            "skip": false,
          },
          {
            "code": "passing - major.minor.patch",
            "dependencyConstraints": {
              "totally-real-dependency": "10.0.0",
            },
            "filename": "file.ts",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
              },
            },
            "skip": false,
          },
          {
            "code": "failing - major",
            "dependencyConstraints": {
              "totally-real-dependency": "999",
            },
            "errors": [
              {
                "messageId": "error",
              },
            ],
            "filename": "file.ts",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
              },
            },
            "skip": true,
          },
          {
            "code": "failing - major.minor",
            "dependencyConstraints": {
              "totally-real-dependency": "999.0",
            },
            "errors": [
              {
                "messageId": "error",
              },
            ],
            "filename": "file.ts",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
              },
            },
            "skip": true,
          },
          {
            "code": "failing - major.minor.patch",
            "dependencyConstraints": {
              "totally-real-dependency": "999.0.0",
            },
            "errors": [
              {
                "messageId": "error",
              },
            ],
            "filename": "file.ts",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
              },
            },
            "skip": true,
          },
        ]
      `);
    });

    it('correctly handles object-based semver', () => {
      satisfiesAllDependencyConstraintsMock.mockReturnValueOnce(true);
      satisfiesAllDependencyConstraintsMock.mockReturnValueOnce(true);
      satisfiesAllDependencyConstraintsMock.mockReturnValueOnce(false);
      satisfiesAllDependencyConstraintsMock.mockReturnValueOnce(false);
      satisfiesAllDependencyConstraintsMock.mockReturnValueOnce(false);
      const ruleTester = new RuleTester({
        languageOptions: { parser },
      });

      ruleTester.run('my-rule', NOOP_RULE, {
        invalid: [
          {
            code: 'failing - major',
            dependencyConstraints: {
              'totally-real-dependency': {
                range: '^999',
              },
            },
            errors: [{ messageId: 'error' }],
          },
          {
            code: 'failing - major.minor',
            dependencyConstraints: {
              'totally-real-dependency': {
                range: '>=999.0',
              },
            },
            errors: [{ messageId: 'error' }],
          },

          {
            code: 'failing with options',
            dependencyConstraints: {
              'totally-real-dependency-prerelease': {
                options: {
                  includePrerelease: false,
                },
                range: '^10',
              },
            },
            errors: [{ messageId: 'error' }],
          },
        ],
        valid: [
          {
            code: 'passing - major',
            dependencyConstraints: {
              'totally-real-dependency': {
                range: '^10',
              },
            },
          },
          {
            code: 'passing - major.minor',
            dependencyConstraints: {
              'totally-real-dependency': {
                range: '<999',
              },
            },
          },
        ],
      });

      expect(getTestConfigFromCall()).toMatchInlineSnapshot(`
        [
          {
            "code": "passing - major",
            "dependencyConstraints": {
              "totally-real-dependency": {
                "range": "^10",
              },
            },
            "filename": "file.ts",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
              },
            },
            "skip": false,
          },
          {
            "code": "passing - major.minor",
            "dependencyConstraints": {
              "totally-real-dependency": {
                "range": "<999",
              },
            },
            "filename": "file.ts",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
              },
            },
            "skip": false,
          },
          {
            "code": "failing - major",
            "dependencyConstraints": {
              "totally-real-dependency": {
                "range": "^999",
              },
            },
            "errors": [
              {
                "messageId": "error",
              },
            ],
            "filename": "file.ts",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
              },
            },
            "skip": true,
          },
          {
            "code": "failing - major.minor",
            "dependencyConstraints": {
              "totally-real-dependency": {
                "range": ">=999.0",
              },
            },
            "errors": [
              {
                "messageId": "error",
              },
            ],
            "filename": "file.ts",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
              },
            },
            "skip": true,
          },
          {
            "code": "failing with options",
            "dependencyConstraints": {
              "totally-real-dependency-prerelease": {
                "options": {
                  "includePrerelease": false,
                },
                "range": "^10",
              },
            },
            "errors": [
              {
                "messageId": "error",
              },
            ],
            "filename": "file.ts",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
              },
            },
            "skip": true,
          },
        ]
      `);
    });

    it('tests without versions should always be run', () => {
      satisfiesAllDependencyConstraintsMock.mockReturnValueOnce(true);
      satisfiesAllDependencyConstraintsMock.mockReturnValueOnce(true);
      satisfiesAllDependencyConstraintsMock.mockReturnValueOnce(true);
      satisfiesAllDependencyConstraintsMock.mockReturnValueOnce(true);
      satisfiesAllDependencyConstraintsMock.mockReturnValueOnce(true);
      satisfiesAllDependencyConstraintsMock.mockReturnValueOnce(true);
      satisfiesAllDependencyConstraintsMock.mockReturnValueOnce(false);
      const ruleTester = new RuleTester({
        languageOptions: { parser },
      });

      ruleTester.run('my-rule', NOOP_RULE, {
        invalid: [
          {
            code: 'no constraints is always run',
            errors: [{ messageId: 'error' }],
          },
          {
            code: 'empty object is always run',
            dependencyConstraints: {},
            errors: [{ messageId: 'error' }],
          },
          {
            code: 'failing constraint',
            dependencyConstraints: {
              'totally-real-dependency': '99999',
            },
            errors: [{ messageId: 'error' }],
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

      expect(getTestConfigFromCall()).toMatchInlineSnapshot(`
        [
          {
            "code": "string based is always run",
            "filename": "file.ts",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
              },
            },
            "skip": false,
          },
          {
            "code": "no constraints is always run",
            "filename": "file.ts",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
              },
            },
            "skip": false,
          },
          {
            "code": "empty object is always run",
            "dependencyConstraints": {},
            "filename": "file.ts",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
              },
            },
            "skip": false,
          },
          {
            "code": "passing constraint",
            "dependencyConstraints": {
              "totally-real-dependency": "10",
            },
            "filename": "file.ts",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
              },
            },
            "skip": false,
          },
          {
            "code": "no constraints is always run",
            "errors": [
              {
                "messageId": "error",
              },
            ],
            "filename": "file.ts",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
              },
            },
            "skip": false,
          },
          {
            "code": "empty object is always run",
            "dependencyConstraints": {},
            "errors": [
              {
                "messageId": "error",
              },
            ],
            "filename": "file.ts",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
              },
            },
            "skip": false,
          },
          {
            "code": "failing constraint",
            "dependencyConstraints": {
              "totally-real-dependency": "99999",
            },
            "errors": [
              {
                "messageId": "error",
              },
            ],
            "filename": "file.ts",
            "languageOptions": {
              "parserOptions": {
                "disallowAutomaticSingleRunInference": true,
              },
            },
            "skip": true,
          },
        ]
      `);
    });

    describe('constructor constraints', () => {
      it('skips all tests if a constructor constraint is not satisifed', () => {
        satisfiesAllDependencyConstraintsMock.mockReturnValueOnce(false);
        const ruleTester = new RuleTester({
          dependencyConstraints: {
            'totally-real-dependency': '999',
          },
          languageOptions: { parser },
        });

        ruleTester.run('my-rule', NOOP_RULE, {
          invalid: [
            {
              code: 'failing - major',
              errors: [{ messageId: 'error' }],
            },
          ],
          valid: [
            {
              code: 'passing - major',
            },
          ],
        });

        // trigger the describe block
        expect(mockedDescribeSkip.mock.calls).toHaveLength(1);
        expect(mockedIt.mock.lastCall).toMatchInlineSnapshot(`
          [
            "All tests skipped due to unsatisfied constructor dependency constraints",
            [Function],
          ]
        `);
      });

      it('does not skip all tests if a constructor constraint is satisifed', () => {
        satisfiesAllDependencyConstraintsMock.mockReturnValueOnce(true);
        const ruleTester = new RuleTester({
          dependencyConstraints: {
            'totally-real-dependency': '10',
          },
          languageOptions: { parser },
        });

        ruleTester.run('my-rule', NOOP_RULE, {
          invalid: [
            {
              code: 'invalid',
              errors: [{ messageId: 'error' }],
            },
          ],
          valid: [
            {
              code: 'valid',
            },
          ],
        });

        // trigger the describe block
        expect(mockedDescribe.mock.calls).toHaveLength(3);
        expect(mockedDescribeSkip.mock.calls).toHaveLength(0);
        // expect(mockedIt.mock.lastCall).toMatchInlineSnapshot(`undefined`);
      });

      it('does not call describe with valid if no valid tests are provided', () => {
        const ruleTester = new RuleTester();

        ruleTester.run('my-rule', NOOP_RULE, {
          invalid: [
            {
              code: 'invalid',
              errors: [{ messageId: 'error' }],
            },
          ],
          valid: [],
        });

        expect(mockedDescribe.mock.calls).toMatchInlineSnapshot(`
          [
            [
              "my-rule",
              [Function],
            ],
            [
              "invalid",
              [Function],
            ],
          ]
        `);
      });

      it('does not call describe with invalid if no invalid tests are provided', () => {
        const ruleTester = new RuleTester();

        ruleTester.run('my-rule', NOOP_RULE, {
          invalid: [],
          valid: [
            {
              code: 'valid',
            },
          ],
        });

        expect(mockedDescribe.mock.calls).toMatchInlineSnapshot(`
          [
            [
              "my-rule",
              [Function],
            ],
            [
              "valid",
              [Function],
            ],
          ]
        `);
      });
    });
  });
});

describe('RuleTester - hooks', () => {
  beforeAll(() => {
    vi.restoreAllMocks();
  });

  const noFooRule: RuleModule<'error'> = {
    create(context) {
      return {
        'Identifier[name=foo]'(node): void {
          context.report({
            messageId: 'error',
            node,
          });
        },
      };
    },
    defaultOptions: [],
    meta: {
      messages: {
        error: 'error',
      },
      schema: [],
      type: 'problem',
    },
  };

  const ruleTester = new RuleTester();

  it.for(['before', 'after'] as const)(
    '%s should be called when assigned',
    (hookName, { expect }) => {
      const hookForValid = vi.fn();
      const hookForInvalid = vi.fn();
      ruleTester.run('no-foo', noFooRule, {
        invalid: [
          {
            code: 'foo',
            errors: [{ messageId: 'error' }],
            [hookName]: hookForInvalid,
          },
        ],
        valid: [
          {
            code: 'bar',
            [hookName]: hookForValid,
          },
        ],
      });
      expect(hookForValid).toHaveBeenCalledOnce();
      expect(hookForInvalid).toHaveBeenCalledOnce();
    },
  );

  it.for(['before', 'after'] as const)(
    '%s should cause test to fail when it throws error',
    (hookName, { expect }) => {
      const hook = vi.fn(() => {
        throw new Error('Something happened');
      });
      expect(() =>
        ruleTester.run('no-foo', noFooRule, {
          invalid: [
            {
              code: 'foo',
              errors: [{ messageId: 'error' }],
              [hookName]: hook,
            },
          ],
          valid: [],
        }),
      ).toThrow('Something happened');
      expect(() =>
        ruleTester.run('no-foo', noFooRule, {
          invalid: [],
          valid: [
            {
              code: 'bar',
              [hookName]: hook,
            },
          ],
        }),
      ).toThrow('Something happened');
    },
  );

  it.for(['before', 'after'] as const)(
    '%s should throw when not a function is assigned',
    (hookName, { expect }) => {
      expect(() =>
        ruleTester.run('no-foo', noFooRule, {
          invalid: [],
          valid: [
            {
              code: 'bar',
              [hookName]: 42,
            },
          ],
        }),
      ).toThrow(`Optional test case property '${hookName}' must be a function`);
      expect(() =>
        ruleTester.run('no-foo', noFooRule, {
          invalid: [
            {
              code: 'foo',
              errors: [{ messageId: 'error' }],
              [hookName]: 42,
            },
          ],
          valid: [],
        }),
      ).toThrow(`Optional test case property '${hookName}' must be a function`);
    },
  );

  it('should call both before() and after() hooks even when the case failed', () => {
    const hookBefore = vi.fn();
    const hookAfter = vi.fn();
    expect(() =>
      ruleTester.run('no-foo', noFooRule, {
        invalid: [],
        valid: [
          {
            after: hookAfter,
            before: hookBefore,
            code: 'foo',
          },
        ],
      }),
    ).toThrow();
    expect(hookBefore).toHaveBeenCalledOnce();
    expect(hookAfter).toHaveBeenCalledOnce();
    expect(() =>
      ruleTester.run('no-foo', noFooRule, {
        invalid: [
          {
            after: hookAfter,
            before: hookBefore,
            code: 'bar',
            errors: [{ messageId: 'error' }],
          },
        ],
        valid: [],
      }),
    ).toThrow();
    expect(hookBefore).toHaveBeenCalledTimes(2);
    expect(hookAfter).toHaveBeenCalledTimes(2);
  });

  it('should call both before() and after() hooks regardless of syntax errors', () => {
    const hookBefore = vi.fn();
    const hookAfter = vi.fn();

    expect(() =>
      ruleTester.run('no-foo', noFooRule, {
        invalid: [],
        valid: [
          {
            after: hookAfter,
            before: hookBefore,
            code: 'invalid javascript code',
          },
        ],
      }),
    ).toThrow(/parsing error/);
    expect(hookBefore).toHaveBeenCalledOnce();
    expect(hookAfter).toHaveBeenCalledOnce();
    expect(() =>
      ruleTester.run('no-foo', noFooRule, {
        invalid: [
          {
            after: hookAfter,
            before: hookBefore,
            code: 'invalid javascript code',
            errors: [{ messageId: 'error' }],
          },
        ],
        valid: [],
      }),
    ).toThrow(/parsing error/);
    expect(hookBefore).toHaveBeenCalledTimes(2);
    expect(hookAfter).toHaveBeenCalledTimes(2);
  });

  it('should call after() hook even when before() throws', () => {
    const hookBefore = vi.fn(() => {
      throw new Error('Something happened in before()');
    });
    const hookAfter = vi.fn();

    expect(() =>
      ruleTester.run('no-foo', noFooRule, {
        invalid: [],
        valid: [
          {
            after: hookAfter,
            before: hookBefore,
            code: 'bar',
          },
        ],
      }),
    ).toThrow('Something happened in before()');
    expect(hookBefore).toHaveBeenCalledOnce();
    expect(hookAfter).toHaveBeenCalledOnce();
    expect(() =>
      ruleTester.run('no-foo', noFooRule, {
        invalid: [
          {
            after: hookAfter,
            before: hookBefore,
            code: 'foo',
            errors: [{ messageId: 'error' }],
          },
        ],
        valid: [],
      }),
    ).toThrow('Something happened in before()');
    expect(hookBefore).toHaveBeenCalledTimes(2);
    expect(hookAfter).toHaveBeenCalledTimes(2);
  });
});

describe('RuleTester - multipass fixer', () => {
  beforeAll(() => {
    vi.restoreAllMocks();
  });

  describe('without fixes', () => {
    const ruleTester = new RuleTester();
    const rule: RuleModule<'error'> = {
      create(context) {
        return {
          'Identifier[name=foo]'(node): void {
            context.report({
              messageId: 'error',
              node,
            });
          },
        };
      },
      defaultOptions: [],
      meta: {
        messages: {
          error: 'error',
        },
        schema: [],
        type: 'problem',
      },
    };

    it('passes with no output', () => {
      expect(() => {
        ruleTester.run('my-rule', rule, {
          invalid: [
            {
              code: 'foo',
              errors: [{ messageId: 'error' }],
            },
          ],
          valid: [],
        });
      }).not.toThrow();
    });

    it('passes with null output', () => {
      expect(() => {
        ruleTester.run('my-rule', rule, {
          invalid: [
            {
              code: 'foo',
              errors: [{ messageId: 'error' }],
              output: null,
            },
          ],
          valid: [],
        });
      }).not.toThrow();
    });

    it('throws with string output', () => {
      expect(() => {
        ruleTester.run('my-rule', rule, {
          invalid: [
            {
              code: 'foo',
              errors: [{ messageId: 'error' }],
              output: 'bar',
            },
          ],
          valid: [],
        });
      }).toThrow('Expected autofix to be suggested.');
    });

    it('throws with array output', () => {
      expect(() => {
        ruleTester.run('my-rule', rule, {
          invalid: [
            {
              code: 'foo',
              errors: [{ messageId: 'error' }],
              output: ['bar', 'baz'],
            },
          ],
          valid: [],
        });
      }).toThrow('Expected autofix to be suggested.');
    });
  });

  describe('with single fix', () => {
    const ruleTester = new RuleTester();
    const rule: RuleModule<'error'> = {
      create(context) {
        return {
          'Identifier[name=foo]'(node): void {
            context.report({
              fix: fixer => fixer.replaceText(node, 'bar'),
              messageId: 'error',
              node,
            });
          },
        };
      },
      defaultOptions: [],
      meta: {
        fixable: 'code',
        messages: {
          error: 'error',
        },
        schema: [],
        type: 'problem',
      },
    };

    it('passes with correct string output', () => {
      expect(() => {
        ruleTester.run('my-rule', rule, {
          invalid: [
            {
              code: 'foo',
              errors: [{ messageId: 'error' }],
              output: 'bar',
            },
          ],
          valid: [],
        });
      }).not.toThrow();
    });

    it('passes with correct array output', () => {
      expect(() => {
        ruleTester.run('my-rule', rule, {
          invalid: [
            {
              code: 'foo',
              errors: [{ messageId: 'error' }],
              output: ['bar'],
            },
          ],
          valid: [],
        });
      }).not.toThrow();
    });

    it('throws with no output', () => {
      expect(() => {
        ruleTester.run('my-rule', rule, {
          invalid: [
            {
              code: 'foo',
              errors: [{ messageId: 'error' }],
            },
          ],
          valid: [],
        });
      }).toThrow("The rule fixed the code. Please add 'output' property.");
    });

    it('throws with null output', () => {
      expect(() => {
        ruleTester.run('my-rule', rule, {
          invalid: [
            {
              code: 'foo',
              errors: [{ messageId: 'error' }],
              output: null,
            },
          ],
          valid: [],
        });
      }).toThrow('Expected no autofixes to be suggested.');
    });

    it('throws with incorrect array output', () => {
      expect(() => {
        ruleTester.run('my-rule', rule, {
          invalid: [
            {
              code: 'foo',
              errors: [{ messageId: 'error' }],
              output: ['bar', 'baz'],
            },
          ],
          valid: [],
        });
      }).toThrow('Outputs do not match.');
    });

    it('throws with incorrect string output', () => {
      expect(() => {
        ruleTester.run('my-rule', rule, {
          invalid: [
            {
              code: 'foo',
              errors: [{ messageId: 'error' }],
              output: 'baz',
            },
          ],
          valid: [],
        });
      }).toThrow('Output is incorrect.');
    });
  });

  describe('with multiple fixes', () => {
    const ruleTester = new RuleTester();
    const rule: RuleModule<'error'> = {
      create(context) {
        return {
          'Identifier[name=bar]'(node): void {
            context.report({
              fix: fixer => fixer.replaceText(node, 'baz'),
              messageId: 'error',
              node,
            });
          },
          'Identifier[name=foo]'(node): void {
            context.report({
              fix: fixer => fixer.replaceText(node, 'bar'),
              messageId: 'error',
              node,
            });
          },
        };
      },
      defaultOptions: [],
      meta: {
        fixable: 'code',
        messages: {
          error: 'error',
        },
        schema: [],
        type: 'problem',
      },
    };

    it('passes with correct array output', () => {
      expect(() => {
        ruleTester.run('my-rule', rule, {
          invalid: [
            {
              code: 'foo',
              errors: [{ messageId: 'error' }],
              output: ['bar', 'baz'],
            },
          ],
          valid: [],
        });
      }).not.toThrow();
    });

    it('throws with string output', () => {
      expect(() => {
        ruleTester.run('my-rule', rule, {
          invalid: [
            {
              code: 'foo',
              errors: [{ messageId: 'error' }],
              output: 'bar',
            },
          ],
          valid: [],
        });
      }).toThrow(
        'Multiple autofixes are required due to overlapping fix ranges - please use the array form of output to declare all of the expected autofix passes.',
      );
    });

    it('throws with incorrect array output', () => {
      expect(() => {
        ruleTester.run('my-rule', rule, {
          invalid: [
            {
              code: 'foo',
              errors: [{ messageId: 'error' }],
              output: ['bar'],
            },
          ],
          valid: [],
        });
      }).toThrow('Outputs do not match.');
    });

    it('throws with incorrectly ordered array output', () => {
      expect(() => {
        ruleTester.run('my-rule', rule, {
          invalid: [
            {
              code: 'foo',
              errors: [{ messageId: 'error' }],
              output: ['baz', 'bar'],
            },
          ],
          valid: [],
        });
      }).toThrow('Outputs do not match.');
    });
  });
});

describe('RuleTester - run types', () => {
  beforeAll(() => {
    vi.restoreAllMocks();
  });

  const ruleTester = new RuleTester();
  const ruleModule: RuleModule<
    'customErrorBar' | 'customErrorFoo',
    [{ flag: 'bar' | 'foo' }?]
  > = {
    create(context) {
      const [{ flag } = {}] = context.options;
      return {
        Identifier(node) {
          if (node.name === 'foo' && flag === 'foo') {
            context.report({ messageId: 'customErrorFoo', node });
          }
          if (node.name === 'bar' && flag === 'bar') {
            context.report({ messageId: 'customErrorBar', node });
          }
        },
      };
    },
    defaultOptions: [],
    meta: {
      messages: {
        customErrorBar: 'Error custom Bar',
        customErrorFoo: 'Error custom Foo',
      },
      schema: [
        {
          additionalProperties: false,
          properties: {
            flag: { enum: ['foo', 'bar'], type: 'string' },
          },
          type: 'object',
        },
      ],
      type: 'suggestion',
    },
  };

  describe('infer from `rule` parameter', () => {
    it('should correctly infer `options` or `messageIds` types from the `rule` paramter', () => {
      expect(() =>
        ruleTester.run('my-rule', ruleModule, {
          invalid: [],
          valid: [{ code: 'test', options: [{ flag: 'bar' }] }],
        }),
      ).not.toThrow();

      expect(() =>
        ruleTester.run('my-rule', ruleModule, {
          invalid: [
            {
              code: 'foo',
              errors: [{ messageId: 'customErrorFoo' }],
              options: [{ flag: 'foo' }],
            },
            {
              code: 'bar',
              errors: [{ messageId: 'customErrorBar' }],
              options: [{ flag: 'bar' }],
            },
          ],
          valid: [],
        }),
      ).not.toThrow();
    });

    it('should throw both runtime and type error when `options` or `messageId` are not assignable to rule inferred types', () => {
      expect(() =>
        ruleTester.run('my-rule', ruleModule, {
          invalid: [
            {
              code: 'foo',
              errors: [{ messageId: 'customErrorFoo' }],
              // @ts-expect-error - `flags` is specified inside options
              options: [{ flags: 'foo' }],
            },
            {
              code: 'bar',
              options: [{ flag: 'bar' }],
              // @ts-expect-error - `customErrorBaz` is not assignable to `customErrorFoo` | `customErrorBar`
              errors: [{ messageId: 'customErrorBaz' }],
            },
          ],
          valid: [
            // @ts-expect-error - `bar2` is not assignable to `foo` | `bar`
            { code: 'test', options: [{ flag: 'bar2' }] },
          ],
        }),
      ).toThrow();
    });
  });

  it('should not infer types from functions and if the signature is not compatible should report a type error', () => {
    function generateValidTestCase(): ValidTestCase<[{ flag: 'foo' }]> {
      return { code: 'valid' };
    }
    function generateIncompatibleValidTestCase(): ValidTestCase<unknown[]> {
      return { code: 'validIncompatible' };
    }

    function generateInvalidTestCase(): InvalidTestCase<
      'customErrorBar',
      [{ flag: 'bar' }]
    > {
      return {
        code: 'bar',
        errors: [{ messageId: 'customErrorBar' }],
        options: [{ flag: 'bar' }],
      };
    }
    function generateIncompatibleInvalidTestCase(): InvalidTestCase<
      'customErrorBar' | 'customErrorBaz',
      unknown[]
    > {
      return {
        code: 'let bar',
        errors: [{ messageId: 'customErrorBar' }],
        options: [{ flag: 'bar' }],
      };
    }

    expect(() =>
      ruleTester.run('my-rule', ruleModule, {
        invalid: [
          generateInvalidTestCase(),

          // @ts-expect-error the InvalidTestCase returned by this function
          // is not assignable to the one of the rule
          generateIncompatibleInvalidTestCase(),
        ],
        valid: [
          generateValidTestCase(),

          // @ts-expect-error the ValidTestCase returned by this function
          // is not assignable to the one of the rule
          generateIncompatibleValidTestCase(),
        ],
      }),
    ).not.toThrow();
  });
});
