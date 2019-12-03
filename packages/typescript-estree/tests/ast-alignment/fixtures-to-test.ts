import jsxKnownIssues from '@typescript-eslint/shared-fixtures/dist/jsx-known-issues';
import fs from 'fs';
import glob from 'glob';
import path from 'path';

import { isJSXFileType } from '../../tools/test-utils';

interface Fixture {
  filename: string;
  jsx: boolean;
  ignoreSourceType: boolean;
}

interface FixturePatternConfig {
  pattern: string;
  jsx: boolean;
  directory: string;
  ignoreSourceType: boolean;
}

interface CreateFixturePatternConfig {
  ignore?: string[];
  fileType?: string;
  ignoreSourceType?: string[];
}

const fixturesDirPath = path.join(__dirname, '../fixtures');
const sharedFixturesDirPath = path.join(
  __dirname,
  '../../../shared-fixtures/fixtures',
);

class FixturesTester {
  protected fixtures: FixturePatternConfig[] = [];

  /**
   * Utility to generate a FixturePatternConfig object containing the glob pattern for specific subsections of the fixtures/ directory,
   * including the capability to ignore specific nested patterns.
   *
   * @param {string} fixturesSubPath the sub-path within the fixtures/ directory
   * @param {CreateFixturePatternConfig?} config an optional configuration object with optional sub-paths to ignore and/or parse with sourceType: module
   */
  public addFixturePatternConfig(
    fixturesSubPath: string,
    config: CreateFixturePatternConfig = {},
  ): void {
    let _fixturesDirPath = fixturesDirPath;
    if (!fs.existsSync(path.join(fixturesDirPath, fixturesSubPath))) {
      _fixturesDirPath = sharedFixturesDirPath;
      if (!fs.existsSync(path.join(sharedFixturesDirPath, fixturesSubPath))) {
        throw new Error(
          `Registered path '${path.join(
            __dirname,
            fixturesSubPath,
          )}' was not found`,
        );
      }
    }

    const ignore = config.ignore ?? [];
    const fileType = config.fileType ?? 'js';
    const ignoreSourceType = config.ignoreSourceType ?? [];
    const jsx = isJSXFileType(fileType);

    /**
     * The TypeScript compiler gives us the "externalModuleIndicator" to allow typescript-estree do dynamically detect the "sourceType".
     * Babel has similar feature sourceType='unambiguous' but its not perfect, and in some specific cases we sill have to enforce it.
     * Known issues:
     * - https://github.com/babel/babel/issues/9213
     */
    if (ignoreSourceType.length) {
      ignore.push(...ignoreSourceType);
      for (const fixture of ignoreSourceType) {
        this.fixtures.push({
          // It needs to be the full path from within fixtures/ for the pattern
          pattern: `${fixturesSubPath}/${fixture}.src.${fileType}`,
          ignoreSourceType: true,
          directory: _fixturesDirPath,
          jsx,
        });
      }
    }

    this.fixtures.push({
      pattern: `${fixturesSubPath}/!(${ignore.join('|')}).src.${fileType}`,
      ignoreSourceType: false,
      directory: _fixturesDirPath,
      jsx,
    });
  }

  public getFixtures(): Fixture[] {
    return this.fixtures
      .map(fixture =>
        glob
          .sync(`${fixture.directory}/${fixture.pattern}`, {})
          .map(filename => ({
            filename,
            ignoreSourceType: fixture.ignoreSourceType,
            jsx: fixture.jsx,
          })),
      )
      .reduce((acc, x) => acc.concat(x), []);
  }
}

/**
 * An class with FixturePatternConfigs
 */
const tester = new FixturesTester();

/**
 * JSX fixtures which have known issues for typescript-estree
 */
const jsxFilesWithKnownIssues = jsxKnownIssues.map(f => f.replace('jsx/', ''));

/**
 * Current random error difference on jsx/invalid-no-tag-name.src.js
 * ts-estree - SyntaxError
 * Babel - RangeError
 *
 * Reported here: https://github.com/babel/babel/issues/6680
 */
jsxFilesWithKnownIssues.push('invalid-no-tag-name');

tester.addFixturePatternConfig('javascript/basics', {
  ignore: [
    /**
     * TS 3.7 feature changes
     * TODO: remove me when babel adds support
     */
    // optional chaining
    'delete-expression',
    'new-with-member-expression',
    'update-expression',
  ],
});

tester.addFixturePatternConfig('comments', {
  ignore: [
    /**
     * Template strings seem to also be affected by the difference in opinion between different parsers in:
     * https://github.com/babel/babel/issues/6681
     */
    'no-comment-template', // Purely AST diffs
    'template-string-block', // Purely AST diffs
    /**
     * TS 3.7 feature changes
     * TODO: remove me when babel adds support
     */
    // optional chaining
    'block-trailing-comment',
    'jsx-with-greather-than',
    'jsx-with-operators',
    'surrounding-call-comments',
    'switch-fallthrough-comment-in-function',
    'switch-fallthrough-comment',
    'switch-no-default-comment-in-nested-functions',
  ],
});

tester.addFixturePatternConfig('javascript/templateStrings', {
  ignore: ['**/*'],
});

tester.addFixturePatternConfig('javascript/arrayLiteral', {
  ignore: [
    /**
     * TS 3.7 feature changes
     * TODO: remove me when babel adds support
     */
    // optional chaining
    'array-literal-in-lhs',
  ],
});

tester.addFixturePatternConfig('javascript/simple-literals');

tester.addFixturePatternConfig('javascript/directives');

tester.addFixturePatternConfig('javascript/experimentalObjectRestSpread', {
  ignore: [
    /**
     * TS 3.7 feature changes
     * TODO: remove me when babel adds support
     */
    // optional chaining
    'property-spread',
  ],
});

tester.addFixturePatternConfig('javascript/arrowFunctions', {
  ignore: [
    /**
     * Expected babel parse errors - all of these files below produce parse errors in espree
     * as well, but the TypeScript compiler is so forgiving during parsing that typescript-estree
     * does not actually error on them and will produce an AST.
     *
     * We are also unable to leverage diagnostics effectively here. The relevant TypeScript diagnostic is:
     *
     * (ts 3.2) 2300 "Duplicate identifier '{0}'."
     *
     * ...but this is heavily overloaded. It will also report an error for an object with two properties
     * with the same name, for example.
     */
    'error-dup-params', // babel parse errors
    'error-strict-dup-params', // babel parse errors
    /**
     * typescript reports TS1100 and babel errors on this
     * TS1100: "Invalid use of '{0}' in strict mode."
     * TODO: do we want TS1100 error code?
     */
    'error-strict-eval', // babel parse errors
    'error-strict-default-param-eval',
    'error-strict-eval-return',
    'error-strict-param-arguments',
    'error-strict-param-eval',
    'error-strict-param-names',
    'error-strict-param-no-paren-arguments',
    'error-strict-param-no-paren-eval',
    /**
     * TS 3.7 feature changes
     * TODO: remove me when babel adds support
     */
    // optional chaining
    'as-param-with-params',
    'as-param',
  ],
});
tester.addFixturePatternConfig('javascript/function', {
  ignore: [
    /**
     * Babel has invalid end range of multiline SequenceExpression
     * TODO: report it to babel
     */
    'return-multiline-sequence',
  ],
});

tester.addFixturePatternConfig('javascript/bigIntLiterals');
tester.addFixturePatternConfig('javascript/binaryLiterals');
tester.addFixturePatternConfig('javascript/blockBindings');

tester.addFixturePatternConfig('javascript/callExpression', {
  ignore: [
    /**
     * TS 3.7 feature changes
     * TODO: remove me when babel adds support
     */
    // optional chaining
    'call-expression-with-array',
    'call-expression-with-object',
    'mixed-expression',
  ],
});

tester.addFixturePatternConfig('javascript/classes', {
  ignore: [
    /**
     * super() is being used outside of constructor. Other parsers (e.g. espree, acorn) do not error on this.
     */
    'class-one-method-super', // babel parse errors
    /**
     * TS3.6 made computed constructors parse as actual constructors.
     */
    'class-two-methods-computed-constructor',
  ],
});

tester.addFixturePatternConfig('javascript/commaOperator');

tester.addFixturePatternConfig('javascript/defaultParams');

tester.addFixturePatternConfig('javascript/destructuring', {
  ignore: [
    /**
     * TS 3.7 feature changes
     * TODO: remove me when babel adds support
     */
    // optional chaining
    'array-member',
    'call-expression-destruction-array',
    'call-expression-destruction-object',
  ],
});
tester.addFixturePatternConfig('javascript/destructuring-and-arrowFunctions');
tester.addFixturePatternConfig('javascript/destructuring-and-blockBindings');
tester.addFixturePatternConfig('javascript/destructuring-and-defaultParams');
tester.addFixturePatternConfig('javascript/destructuring-and-forOf');
tester.addFixturePatternConfig('javascript/destructuring-and-spread');

tester.addFixturePatternConfig('javascript/experimentalAsyncIteration');
tester.addFixturePatternConfig('javascript/experimentalDynamicImport', {
  ignore: [
    /**
     * TS 3.7 feature changes
     * TODO: remove me when babel adds support
     */
    // optional chaining
    'dynamic-import',
  ],
});
tester.addFixturePatternConfig('javascript/exponentiationOperators');
tester.addFixturePatternConfig('javascript/experimentalOptionalCatchBinding');

tester.addFixturePatternConfig('javascript/for', {
  ignore: [
    /**
     * TS 3.7 feature changes
     * TODO: remove me when babel adds support
     */
    // optional chaining
    'for-with-function',
  ],
});
tester.addFixturePatternConfig('javascript/forIn', {
  ignore: [
    /**
     * Babel correctly errors on this file, and we can report on it via:
     * TS 1189 (ts 3.2) "The variable declaration of a 'for...in' statement cannot have an initializer."
     *
     * However, if we enable that, we get a lot of cases which ts-estree errors on, but Babel doesn't.
     * Therefore, leaving this as the one ignored case for now.
     *
     * TODO: Investigate this in more detail
     */
    'for-in-with-assigment', // babel parse errors
    /**
     * [BABEL ERRORED, BUT TS-ESTREE DID NOT]
     * SyntaxError: Invalid left-hand side in for-loop
     */
    'for-in-with-bare-assigment',
    /**
     * TS 3.7 feature changes
     * TODO: remove me when babel adds support
     */
    // optional chaining
    'for-in-with-const',
    'for-in-with-var',
  ],
});

tester.addFixturePatternConfig('javascript/forOf', {
  ignore: [
    /**
     * TS 3.7 feature changes
     * TODO: remove me when babel adds support
     */
    // optional chaining
    'for-of-array',
    'for-of-object',
    'for-of-with-var-and-braces',
    'for-of-with-var-and-no-braces',
    'invalid-for-of-with-const-and-no-braces',
    'invalid-for-of-with-let-and-no-braces',
  ],
});
tester.addFixturePatternConfig('javascript/generators', {
  ignore: [
    /**
     * TS 3.7 feature changes
     * TODO: remove me when babel adds support
     */
    // optional chaining
    'async-generator-method',
    'yield-without-value-in-call',
  ],
});
tester.addFixturePatternConfig('javascript/globalReturn');
tester.addFixturePatternConfig('javascript/hexLiterals');
tester.addFixturePatternConfig('javascript/importMeta', {
  ignore: [
    /**
     * TS 3.7 feature changes
     * TODO: remove me when babel adds support
     */
    // optional chaining
    'simple-import-meta',
  ],
});
tester.addFixturePatternConfig('javascript/labels');

tester.addFixturePatternConfig('javascript/modules', {
  ignore: [
    /**
     * Expected babel parse errors - ts-estree is not currently throwing
     */
    'invalid-export-named-default', // babel parse errors

    // babel does not recognise these as modules
    'export-named-as-default',
    'export-named-as-specifier',
    'export-named-as-specifiers',
    'export-named-specifier',
    'export-named-specifiers-comma',
    'export-named-specifiers',
    /**
     * TS 3.7 feature changes
     * TODO: remove me when babel adds support
     */
    // optional chaining
    'error-strict',
  ],
  ignoreSourceType: [
    'error-function',
    // 'error-strict',
    'error-delete',
    'invalid-await',
  ],
});

tester.addFixturePatternConfig('javascript/newTarget');

tester.addFixturePatternConfig('javascript/objectLiteral', {
  ignore: [
    /**
     * TS 3.7 feature changes
     * TODO: remove me when babel adds support
     */
    // optional chaining
    'object-literal-in-lhs',
  ],
});
tester.addFixturePatternConfig('javascript/objectLiteralComputedProperties');

tester.addFixturePatternConfig('javascript/objectLiteralDuplicateProperties', {
  ignore: [
    /**
     * Babel throws SyntaxError: Redefinition of __proto__ property
     *
     * TypeScript reports it via the overloaded TS 2300 "Duplicate identifier '{0}'.", which we
     * do not currently enable as per the notes above.
     */
    'error-proto-string-property', // babel parse errors
    /**
     * ts-estree throws thanks to TS 1117 (ts 3.2 at time of writing)
     * "An object literal cannot have multiple properties with the same name in strict mode."
     *
     * Babel does not throw for some reason...
     */
    'strict-duplicate-properties', // ts-estree parse errors
  ],
});

tester.addFixturePatternConfig('javascript/objectLiteralShorthandMethods');
tester.addFixturePatternConfig('javascript/objectLiteralShorthandProperties');
tester.addFixturePatternConfig('javascript/octalLiterals', {
  ignore: [
    /**
     * Old-style octal literals are not supported in typescript
     * @see https://github.com/Microsoft/TypeScript/issues/10101
     */
    'legacy',
  ],
});
tester.addFixturePatternConfig('javascript/regex');
tester.addFixturePatternConfig('javascript/regexUFlag');
tester.addFixturePatternConfig('javascript/regexYFlag');
tester.addFixturePatternConfig('javascript/restParams');
tester.addFixturePatternConfig('javascript/spread', {
  ignore: [
    /**
     * TS 3.7 feature changes
     * TODO: remove me when babel adds support
     */
    // optional chaining
    'multi-function-call',
    'not-final-param',
    'simple-function-call',
  ],
});
tester.addFixturePatternConfig('javascript/unicodeCodePointEscapes');

/* ================================================== */

tester.addFixturePatternConfig('jsx', {
  ignore: jsxFilesWithKnownIssues,
});
tester.addFixturePatternConfig('jsx-useJSXTextNode');

/* ================================================== */

/**
 * TSX-SPECIFIC FILES
 */

tester.addFixturePatternConfig('tsx', {
  fileType: 'tsx',
  ignore: [
    /**
     * TS 3.7 feature changes
     * TODO: remove me when babel adds support
     */
    // optional chaining
    'react-typed-props',
  ],
});

/* ================================================== */

/**
 * TYPESCRIPT-SPECIFIC FILES
 */

tester.addFixturePatternConfig('typescript/babylon-convergence', {
  fileType: 'ts',
});

tester.addFixturePatternConfig('typescript/basics', {
  fileType: 'ts',
  ignore: [
    /**
     * babel error: https://github.com/babel/babel/issues/9305
     * TypeScript does not report any diagnostics for this file, but Babel throws:
     * [SyntaxError: Unexpected token, expected "{" (2:8)
      1 | class Foo {
    > 2 |   foo?();
        |         ^
      3 |   bar?(): string;
      4 |   private baz?(): string;
      5 | }]
     */
    'class-with-optional-methods', // babel parse errors
    /**
     * There are number of things that can be reported in this file, so it's not great
     * for comparison purposes.
     *
     * Nevertheless, Babel appears to throw on syntax that TypeScript doesn't report on directly.
     *
     * TODO: Investigate in more depth, potentially split up different parts of the interface
     */
    'interface-with-all-property-types', // babel parse errors
    /**
     * Babel parses it as TSQualifiedName
     * ts parses it as MemberExpression
     * TODO: report it to babel
     */
    'interface-with-extends-member-expression',
    /**
     * Babel bug for optional or abstract methods
     * https://github.com/babel/babel/issues/9305
     */
    'abstract-class-with-abstract-method', // babel parse errors
    'abstract-class-with-optional-method', // babel parse errors
    'declare-class-with-optional-method', // babel parse errors
    /**
     * Was expected to be fixed by PR into Babel: https://github.com/babel/babel/pull/9302
     * But not fixed in Babel 7.3
     * TODO: Investigate differences
     */
    'import-type',
    'import-type-with-type-parameters-in-type-reference',
    /**
     * Not yet supported in Babel https://github.com/babel/babel/issues/9228
     * Directive field is not added to module and namespace
     */
    'directive-in-module',
    'directive-in-namespace',
    /**
     * Babel parses this incorrectly
     * https://github.com/babel/babel/issues/9324
     */
    'type-assertion-arrow-function',
    /**
     * PR for optional parameters in arrow function has been merged into Babel: https://github.com/babel/babel/pull/9463
     * TODO: remove me in next babel > 7.3.2
     */
    'arrow-function-with-optional-parameter',
    /**
     * [BABEL ERRORED, BUT TS-ESTREE DID NOT]
     */
    'const-assertions',
    'readonly-arrays',
    'readonly-tuples',
    /**
     * [TS-ESTREE ERRORED, BUT BABEL DID NOT]
     * SyntaxError: 'abstract' modifier can only appear on a class, method, or property declaration.
     */
    'abstract-class-with-abstract-constructor',
    /**
     * TS 3.7 feature changes
     * TODO: remove me when babel adds support
     */
    // optional chaining
    'optional-chain',
    'optional-chain-with-parens',
    'optional-chain-call',
    'optional-chain-call-with-parens',
    'optional-chain-element-access',
    'optional-chain-element-access-with-parens',
    'async-function-expression',
    'class-with-accessibility-modifiers',
    'class-with-mixin',
    'global-this',
    'never-type-param',
    'non-null-assertion-operator',
    'type-parameters-comments',
    // type assertion function
    'type-assertion-in-function',
    'type-assertion-in-arrow-function',
    'type-assertion-in-interface',
    'type-assertion-in-method',
    'type-guard-in-arrow-function',
    'type-guard-in-function',
    'type-guard-in-interface',
    'type-guard-in-method',
    'type-assertion-with-guard-in-arrow-function',
    'type-assertion-with-guard-in-function',
    'type-assertion-with-guard-in-interface',
    'type-assertion-with-guard-in-method',
    // declare class properties
    'abstract-class-with-abstract-properties',
    'abstract-class-with-abstract-readonly-property',
    'abstract-class-with-declare-properties',
    'class-with-declare-properties',
    'class-with-definite-assignment',
    'class-with-optional-computed-property',
    'class-with-optional-properties',
    'class-with-optional-property-undefined',
    'class-with-property-function',
    'class-with-property-values',
    'class-with-readonly-property',
    'object-with-escaped-properties',
    'type-reference-comments',
  ],
  ignoreSourceType: [
    /**
     * Babel reports sourceType script
     * https://github.com/babel/babel/issues/9213
     */
    'export-assignment',
    'import-equal-declaration',
    'import-export-equal-declaration',
  ],
});

tester.addFixturePatternConfig('typescript/decorators/accessor-decorators', {
  fileType: 'ts',
  ignore: [
    /**
     * TS 3.7 feature changes
     * TODO: remove me when babel adds support
     */
    // optional chaining
    'accessor-decorator-factory-instance-member',
    'accessor-decorator-factory-static-member',
    'accessor-decorator-instance-member',
    'accessor-decorator-static-member',
  ],
});
tester.addFixturePatternConfig('typescript/decorators/class-decorators', {
  fileType: 'ts',
  ignore: [
    /**
     * TS 3.7 feature changes
     * TODO: remove me when babel adds support
     */
    // optional chaining
    'class-decorator-factory',
  ],
});
tester.addFixturePatternConfig('typescript/decorators/method-decorators', {
  fileType: 'ts',
  ignore: [
    /**
     * TS 3.7 feature changes
     * TODO: remove me when babel adds support
     */
    // optional chaining
    'method-decorator-factory-instance-member',
    'method-decorator-factory-static-member',
  ],
});
tester.addFixturePatternConfig('typescript/decorators/parameter-decorators', {
  fileType: 'ts',
  ignore: [
    /**
     * babel does not support decorators on array and rest parameters
     * TODO: report this to babel
     */
    'parameter-array-pattern-decorator',
    'parameter-rest-element-decorator',
    /**
     * TS 3.7 feature changes
     * TODO: remove me when babel adds support
     */
    // optional chaining
    'parameter-decorator-constructor',
    'parameter-decorator-decorator-instance-member',
    'parameter-decorator-decorator-static-member',
    'parameter-object-pattern-decorator',
  ],
});
tester.addFixturePatternConfig('typescript/decorators/property-decorators', {
  fileType: 'ts',
  ignore: [
    /**
     * TS 3.7 feature changes
     * TODO: remove me when babel adds support
     */
    // optional chaining
    'property-decorator-factory-instance-member',
    'property-decorator-factory-static-member',
    // declare class properties
    'property-decorator-instance-member',
    'property-decorator-static-member',
  ],
});

tester.addFixturePatternConfig('typescript/expressions', {
  fileType: 'ts',
  ignore: [
    /**
     * there is difference in range between babel and ts-estree
     */
    'tagged-template-expression-type-arguments',
    /**
     * TS 3.7 feature changes
     * TODO: remove me when babel adds support
     */
    // optional chaining
    'call-expression-type-arguments',
  ],
});

tester.addFixturePatternConfig('typescript/errorRecovery', {
  fileType: 'ts',
  ignore: [
    /**
     * Expected error on empty type arguments and type parameters
     * TypeScript report diagnostics correctly but babel not
     * https://github.com/babel/babel/issues/9462
     */
    'empty-type-arguments',
    'empty-type-arguments-in-call-expression',
    'empty-type-arguments-in-new-expression',
    'empty-type-parameters',
    'empty-type-parameters-in-arrow-function',
    'empty-type-parameters-in-constructor',
    'empty-type-parameters-in-function-expression',
    'empty-type-parameters-in-method',
    'empty-type-parameters-in-method-signature',
    /**
     * Babel correctly errors on this
     * TODO: enable error code TS1024
     */
    'interface-method-readonly',
  ],
});

tester.addFixturePatternConfig('typescript/types', {
  fileType: 'ts',
  ignore: [
    /**
     * AST difference
     */
    'literal-number-negative',
    /**
     * Babel parse error: https://github.com/babel/babel/pull/9431
     */
    'function-with-array-destruction',
    /**
     * TS 3.7 feature changes
     * TODO: remove me when babel adds support
     */
    // optional chaining
    'this-type-expanded',
  ],
});

tester.addFixturePatternConfig('typescript/declare', {
  fileType: 'ts',
});

tester.addFixturePatternConfig('typescript/namespaces-and-modules', {
  fileType: 'ts',
  ignoreSourceType: [
    'nested-internal-module',
    'module-with-default-exports',
    'ambient-module-declaration-with-import',
    'declare-namespace-with-exported-function',
  ],
});

const fixturesToTest = tester.getFixtures();

export { fixturesToTest };
