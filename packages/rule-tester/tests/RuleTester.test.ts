import type { TSESTree } from '@typescript-eslint/utils';
import type { RuleModule } from '@typescript-eslint/utils/ts-eslint';

import * as parser from '@typescript-eslint/parser';
import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';

import type { RuleTesterTestFrameworkFunctionBase } from '../src/TestFramework';

import { RuleTester } from '../src/RuleTester';
import * as dependencyConstraintsModule from '../src/utils/dependencyConstraints';

// we can't spy on the exports of an ES module - so we instead have to mock the entire module
jest.mock('../src/utils/dependencyConstraints', () => {
  const dependencyConstraints = jest.requireActual<
    typeof dependencyConstraintsModule
  >('../src/utils/dependencyConstraints');

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

jest.mock('@typescript-eslint/parser', () => {
  const actualParser = jest.requireActual<typeof parser>(
    '@typescript-eslint/parser',
  );
  return {
    ...actualParser,
    __esModule: true,
    clearCaches: jest.fn(),
  };
});

/* eslint-disable jest/prefer-spy-on --
     we need to specifically assign to the properties or else it will use the
     global value and register actual tests! */
const IMMEDIATE_CALLBACK: RuleTesterTestFrameworkFunctionBase = (_, cb) => cb();
RuleTester.afterAll =
  jest.fn(/* intentionally don't immediate callback here */);
RuleTester.describe = jest.fn(IMMEDIATE_CALLBACK);
RuleTester.describeSkip = jest.fn(IMMEDIATE_CALLBACK);
RuleTester.it = jest.fn(IMMEDIATE_CALLBACK);
RuleTester.itOnly = jest.fn(IMMEDIATE_CALLBACK);
RuleTester.itSkip = jest.fn(IMMEDIATE_CALLBACK);
/* eslint-enable jest/prefer-spy-on */

const mockedAfterAll = jest.mocked(RuleTester.afterAll);
const mockedDescribe = jest.mocked(RuleTester.describe);
const mockedDescribeSkip = jest.mocked(RuleTester.describeSkip);
const mockedIt = jest.mocked(RuleTester.it);
const _mockedItOnly = jest.mocked(RuleTester.itOnly);
const _mockedItSkip = jest.mocked(RuleTester.itSkip);
const mockedParserClearCaches = jest.mocked(parser.clearCaches);

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

describe('RuleTester', () => {
  const runRuleForItemSpy = jest.spyOn(
    RuleTester.prototype,
    // @ts-expect-error -- method is private
    'runRuleForItem',
  ) as jest.SpiedFunction<RuleTester['runRuleForItem']>;
  beforeEach(() => {
    jest.clearAllMocks();
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
      return { ...c[2], filename: c[2].filename?.replaceAll('\\', '/') };
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
            tsconfigRootDir: '/some/path/that/totally/exists/',
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
    expect(mockedAfterAll).toHaveBeenCalledTimes(0);
    new RuleTester({
      languageOptions: {
        parser,
        parserOptions: {
          project: 'tsconfig.json',
          tsconfigRootDir: '/some/path/that/totally/exists/',
        },
      },
    });
    expect(mockedAfterAll).toHaveBeenCalledTimes(1);

    // the provided callback should clear the caches
    const callback = mockedAfterAll.mock.calls[0][0];
    expect(typeof callback).toBe('function');
    expect(mockedParserClearCaches).not.toHaveBeenCalled();
    callback();
    expect(mockedParserClearCaches).toHaveBeenCalledTimes(1);
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
          tsconfigRootDir: '/some/path/that/totally/exists/',
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
      `"Do not set the parser at the test level unless you want to use a parser other than "@typescript-eslint/parser""`,
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
    jest.restoreAllMocks();
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

  it.each(['before', 'after'])(
    '%s should be called when assigned',
    hookName => {
      const hookForValid = jest.fn();
      const hookForInvalid = jest.fn();
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
      expect(hookForValid).toHaveBeenCalledTimes(1);
      expect(hookForInvalid).toHaveBeenCalledTimes(1);
    },
  );

  it.each(['before', 'after'])(
    '%s should cause test to fail when it throws error',
    hookName => {
      const hook = jest.fn(() => {
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

  it.each(['before', 'after'])(
    '%s should throw when not a function is assigned',
    hookName => {
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
    const hookBefore = jest.fn();
    const hookAfter = jest.fn();
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
    expect(hookBefore).toHaveBeenCalledTimes(1);
    expect(hookAfter).toHaveBeenCalledTimes(1);
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
    const hookBefore = jest.fn();
    const hookAfter = jest.fn();

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
    expect(hookBefore).toHaveBeenCalledTimes(1);
    expect(hookAfter).toHaveBeenCalledTimes(1);
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
    const hookBefore = jest.fn(() => {
      throw new Error('Something happened in before()');
    });
    const hookAfter = jest.fn();

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
    expect(hookBefore).toHaveBeenCalledTimes(1);
    expect(hookAfter).toHaveBeenCalledTimes(1);
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
    jest.restoreAllMocks();
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
