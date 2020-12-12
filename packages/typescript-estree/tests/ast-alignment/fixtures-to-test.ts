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

tester.addFixturePatternConfig('javascript/directives', {
  ignore: [
    /**
     * Babel errors on accessors:
     * https://github.com/babel/babel/issues/12335
     */
    'directive-in-class',
  ],
});

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
    'error-strict-eval', // babel parse errors
    'error-strict-default-param-eval',
    'error-strict-eval-return',
    'error-strict-param-arguments',
    'error-strict-param-eval',
    'error-strict-param-names',
    'error-strict-param-no-paren-arguments',
    'error-strict-param-no-paren-eval',
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

tester.addFixturePatternConfig('javascript/callExpression');

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
    /**
     * Babel errors on accessors:
     * https://github.com/babel/babel/issues/12335
     */
    'class-accessor-properties',
    'class-static-methods-and-accessor-properties',
    'invalid-class-setter-declaration',
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
  ignoreSourceType: [
    'error-function',
    'error-strict',
    'error-delete',
    'invalid-await',
    'invalid-export-named-default',
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
tester.addFixturePatternConfig('javascript/objectLiteralComputedProperties', {
  ignore: [
    /**
     * Babel errors on accessors:
     * https://github.com/babel/babel/issues/12335
     */
    'computed-getter-and-setter',
  ],
});

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
tester.addFixturePatternConfig('javascript/spread');
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
     * TODO: report it to babel
     */
    'interface-with-extends-member-expression',
    /**
     * Was expected to be fixed by PR into Babel: https://github.com/babel/babel/pull/9302
     * But not fixed in Babel 7.3
     * TODO: Investigate differences
     */
    'type-import-type',
    'type-import-type-with-type-parameters-in-type-reference',
    /**
     * Not yet supported in Babel https://github.com/babel/babel/issues/9228
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
     * TODO: report this to babel
     */
    'export-named-enum-computed-string',
    /**
     * Babel: TSTypePredicate includes `:` statement in range
     * ts-estree: TSTypePredicate does not include `:` statement in range
     * TODO: report this to babel
     */
    'type-assertion-in-arrow-function',
    'type-assertion-in-function',
    'type-assertion-in-interface',
    'type-assertion-in-method',
    'type-assertion-with-guard-in-arrow-function',
    'type-assertion-with-guard-in-function',
    'type-assertion-with-guard-in-interface',
    'type-assertion-with-guard-in-method',
    'type-guard-in-arrow-function',
    'type-guard-in-function',
    'type-guard-in-interface',
    /**
     * TS 3.7: declare class properties
     * Babel: declare is not allowed with accessibility modifiers
     * TODO: report this to babel
     */
    'abstract-class-with-declare-properties',
    'class-with-declare-properties',
    /**
     * [BABEL ERRORED, BUT TS-ESTREE DID NOT]
     * This is intentional; we don't error on semantic problems for these cases
     */
    'class-with-constructor-and-type-parameters',
    'class-with-two-methods-computed-constructor',
    'catch-clause-with-invalid-annotation',
    'export-type-star-from',
    'import-type-error',
    /**
     * Babel reports incorrect location
     * https://github.com/babel/babel/issues/11939
     */
    'catch-clause-with-annotation',
    /**
     * Babel errors on accessors:
     * https://github.com/babel/babel/issues/12335
     */
    'object-with-typed-methods',
  ],
  ignoreSourceType: [
    /**
     * Babel reports sourceType script
     * https://github.com/babel/babel/issues/9213
     */
    'export-assignment',
    'import-equal-declaration',
    'import-export-equal-declaration',
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
  ],
});

tester.addFixturePatternConfig('typescript/decorators/accessor-decorators', {
  fileType: 'ts',
  ignore: [
    /**
     * Babel errors on accessors:
     * https://github.com/babel/babel/issues/12335
     */
    'accessor-decorator-factory-instance-member',
    'accessor-decorator-factory-static-member',
    'accessor-decorator-instance-member',
    'accessor-decorator-static-member',
  ],
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
    'template-literal-type-1',
    'template-literal-type-2',
    'template-literal-type-3',
    'template-literal-type-4',
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
