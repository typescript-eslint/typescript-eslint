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
   * @param fixturesSubPath the sub-path within the fixtures/ directory
   * @param config an optional configuration object with optional sub-paths to ignore and/or parse with sourceType: module
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
          .sync(fixture.pattern, {
            cwd: fixture.directory,
            absolute: true,
          })
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

tester.addFixturePatternConfig('javascript/basics');

tester.addFixturePatternConfig('comments');

tester.addFixturePatternConfig('javascript/templateStrings', {
  ignore: [
    /**
     * [BABEL ERRORED, BUT TS-ESTREE DID NOT]
     * SyntaxError: Invalid escape sequence in template
     */
    'error-octal-literal',
  ],
});

tester.addFixturePatternConfig('javascript/arrayLiteral');

tester.addFixturePatternConfig('javascript/simple-literals');

tester.addFixturePatternConfig('javascript/directives');

tester.addFixturePatternConfig('javascript/experimentalObjectRestSpread');

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
    'error-strict-default-param-eval',
    'error-strict-eval',
    'error-strict-eval-return',
    'error-strict-param-arguments',
    'error-strict-param-eval',
    'error-strict-param-names',
    'error-strict-param-no-paren-arguments',
    'error-strict-param-no-paren-eval',
  ],
});
tester.addFixturePatternConfig('javascript/function');

tester.addFixturePatternConfig('javascript/bigIntLiterals');
tester.addFixturePatternConfig('javascript/binaryLiterals');
tester.addFixturePatternConfig('javascript/blockBindings');

tester.addFixturePatternConfig('javascript/callExpression');

tester.addFixturePatternConfig('javascript/classes', {
  ignore: [
    /**
     * [BABEL ERRORED, BUT TS-ESTREE DID NOT]
     * super() is being used outside of constructor.
     * Other parsers (e.g. espree, acorn) do not error on this.
     */
    'class-one-method-super',
    /**
     * TS3.6 made computed constructors parse as actual constructors.
     */
    'class-two-methods-computed-constructor',
  ],
});

tester.addFixturePatternConfig('javascript/commaOperator');

tester.addFixturePatternConfig('javascript/defaultParams');

tester.addFixturePatternConfig('javascript/destructuring');
tester.addFixturePatternConfig('javascript/destructuring-and-arrowFunctions');
tester.addFixturePatternConfig('javascript/destructuring-and-blockBindings');
tester.addFixturePatternConfig('javascript/destructuring-and-defaultParams');
tester.addFixturePatternConfig('javascript/destructuring-and-forOf');
tester.addFixturePatternConfig('javascript/destructuring-and-spread');

tester.addFixturePatternConfig('javascript/experimentalAsyncIteration');
tester.addFixturePatternConfig('javascript/experimentalDynamicImport');
tester.addFixturePatternConfig('javascript/exponentiationOperators');
tester.addFixturePatternConfig('javascript/experimentalOptionalCatchBinding');

tester.addFixturePatternConfig('javascript/for');
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
     * TODO: Error 2405: `The left-hand side of a 'for...in' statement must be of type 'string' or 'any'."`
     */
    'for-in-with-bare-assigment',
  ],
});

tester.addFixturePatternConfig('javascript/forOf');
tester.addFixturePatternConfig('javascript/generators');
tester.addFixturePatternConfig('javascript/globalReturn');
tester.addFixturePatternConfig('javascript/hexLiterals');
tester.addFixturePatternConfig('javascript/importMeta');
tester.addFixturePatternConfig('javascript/labels');

tester.addFixturePatternConfig('javascript/modules', {
  ignore: [
    /**
     * [BABEL ERRORED, BUT TS-ESTREE DID NOT]
     * SyntaxError: Unexpected keyword 'default'.
     */
    'invalid-export-named-default',
  ],
  ignoreSourceType: [
    'error-function',
    'error-strict',
    'error-delete',
    'invalid-await',
    // babel does not recognize these as modules
    'export-named-as-default',
    'export-named-as-specifier',
    'export-named-as-specifiers',
    'export-named-specifier',
    'export-named-specifiers-comma',
    'export-named-specifiers',
    // babel treats declare as not a module
    'import-module',
  ],
});

tester.addFixturePatternConfig('javascript/newTarget');

tester.addFixturePatternConfig('javascript/objectLiteral');
tester.addFixturePatternConfig('javascript/objectLiteralComputedProperties');

tester.addFixturePatternConfig('javascript/objectLiteralDuplicateProperties', {
  ignore: [
    /**
     * ts-estree throws thanks to TS 1117 (ts 3.2 at time of writing)
     * "An object literal cannot have multiple properties with the same name in strict mode."
     *
     * Babel does not throw for some reason...
     */
    'strict-duplicate-properties', // ts-estree parse errors
    'strict-duplicate-string-properties',
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
tester.addFixturePatternConfig('javascript/spread');
tester.addFixturePatternConfig('javascript/unicodeCodePointEscapes');

/* ================================================== */

tester.addFixturePatternConfig('jsx', {
  ignore: [
    /**
     * JSX fixtures which have known issues for typescript-estree
     * https://github.com/Microsoft/TypeScript/issues/7410
     */
    'embedded-tags',
    /**
     * [BABEL ERRORED, BUT TS-ESTREE DID NOT]
     * SyntaxError: Unexpected token
     * TODO: investigate if this code is valid as there is no typescript error
     */
    'invalid-namespace-value-with-dots',
  ],
});
tester.addFixturePatternConfig('jsx-useJSXTextNode');

/* ================================================== */

/**
 * TSX-SPECIFIC FILES
 */

tester.addFixturePatternConfig('tsx', {
  fileType: 'tsx',
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
     * Babel parses it as TSQualifiedName
     * ts parses it as MemberExpression
     * @see https://github.com/babel/babel/issues/12884
     */
    'interface-with-extends-member-expression',
    /**
     * @see https://github.com/typescript-eslint/typescript-eslint/issues/2998
     */
    'type-import-type',
    'type-import-type-with-type-parameters-in-type-reference',
    /**
     * Not yet supported in Babel
     * Directive field is not added to module and namespace
     */
    'directive-in-module',
    'directive-in-namespace',
    /**
     * [BABEL ERRORED, BUT TS-ESTREE DID NOT]
     * TODO: validate error code TS2451 Cannot redeclare block-scoped variable '{0}'.
     */
    'const-assertions',
    /**
     * [TS-ESTREE ERRORED, BUT BABEL DID NOT]
     * SyntaxError: 'abstract' modifier can only appear on a class, method, or property declaration.
     */
    'abstract-class-with-abstract-constructor',
    /**
     * [BABEL ERRORED, BUT TS-ESTREE DID NOT]
     * babel hard fails on computed string enum members, but TS doesn't
     * @see https://github.com/babel/babel/issues/12683
     */
    'export-named-enum-computed-string',
    /**
     * [BABEL ERRORED, BUT TS-ESTREE DID NOT]
     * This is intentional; we don't error on semantic problems for these cases
     */
    'class-with-constructor-and-type-parameters',
    'class-with-two-methods-computed-constructor',
    'export-type-star-from',
    'import-type-error',
    /**
     * [TS-ESTREE ERRORED, BUT BABEL DID NOT]
     * This is intentional; babel is not checking types
     */
    'catch-clause-with-invalid-annotation',
    /**
     * [BABEL ERRORED, BUT TS-ESTREE DID NOT]
     * TODO: enforce that accessibility is not allowed on a private identifier
     */
    'class-private-identifier-field-with-accessibility-error',
    /**
     * [TS-ESTREE ERRORED, BUT BABEL DID NOT]
     * TypeScript 4.4 new feature
     * @see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html#abstract-properties-do-not-allow-initializers
     */
    'abstract-class-with-override-property',
    /**
     * [BABEL ERRORED, BUT TS-ESTREE DID NOT]
     * SyntaxError: Missing initializer in const declaration.
     */
    'var-with-definite-assignment',
    /**
     * [BABEL ERRORED, BUT TS-ESTREE DID NOT]
     * SyntaxError: A JSON module can only be imported with `default`.
     */
    'export-with-import-assertions',
  ],
  ignoreSourceType: [
    /**
     * Babel reports sourceType script
     * @see https://github.com/babel/babel/issues/9213
     */
    'export-assignment',
    'import-equal-declaration',
    'import-export-equal-declaration',
    'import-equal-type-declaration',
    'import-export-equal-type-declaration',
    // babel treats declare and types as not a module
    'export-declare-const-named-enum',
    'export-declare-named-enum',
    'type-alias-declaration-export-function-type',
    'type-alias-declaration-export-object-type',
    'type-alias-declaration-export',
    // babel treats type import/export as not a module
    'export-type',
    'export-type-as',
    'export-type-from',
    'export-type-from-as',
    'import-type-default',
    'import-type-named',
    'import-type-named-as',
    'import-type-star-as-ns',
    'keyword-variables',
  ],
});

tester.addFixturePatternConfig('typescript/decorators/accessor-decorators', {
  fileType: 'ts',
});
tester.addFixturePatternConfig('typescript/decorators/class-decorators', {
  fileType: 'ts',
});
tester.addFixturePatternConfig('typescript/decorators/method-decorators', {
  fileType: 'ts',
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
  ],
});
tester.addFixturePatternConfig('typescript/decorators/property-decorators', {
  fileType: 'ts',
});

tester.addFixturePatternConfig('typescript/expressions', {
  fileType: 'ts',
  ignore: [
    /**
     * Babel produces incorrect structure for TSInstantiationExpression and optional ChainExpression
     * @see https://github.com/babel/babel/issues/14613
     */
    'instantiation-expression',
  ],
});

tester.addFixturePatternConfig('typescript/errorRecovery', {
  fileType: 'ts',
  ignore: [
    /**
     * [BABEL ERRORED, BUT TS-ESTREE DID NOT]
     * TODO: enable error code TS1019: An index signature parameter cannot have a question mark.
     */
    'interface-with-optional-index-signature',
    /**
     * Babel correctly errors on this
     * TODO: enable error code TS1024: 'readonly' modifier can only appear on a property declaration or index signature.
     */
    'interface-method-readonly',
  ],
});

tester.addFixturePatternConfig('typescript/types', {
  fileType: 'ts',
  ignore: [
    /**
     * TS Template Literal Types
     *
     * Babel uses a representation much further from TS's representation.
     * They produce TSTypeLiteral -> TemplateLiteral, and then force override the expression parser to parse types
     * We instead just emit TSTemplateLiteralType.
     */
    'template-literal-type-2',
    'template-literal-type-3',
    'template-literal-type-4',
    /**
     * Reported range differs between ts-estree and Babel
     * @see https://github.com/babel/babel/issues/14589
     */
    'optional-variance-in',
    'optional-variance-out',
    'optional-variance-in-out',
    'optional-variance-in-and-out',
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

export const fixturesToTest = tester.getFixtures();
