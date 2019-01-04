import glob from 'glob';
import fs from 'fs';
import path from 'path';

import jsxKnownIssues from '../jsx-known-issues';

interface Fixture {
  filename: string;
  jsx: boolean;
  ignoreSourceType: boolean;
}

interface FixturePatternConfig {
  pattern: string;
  jsx: boolean;
  ignoreSourceType: boolean;
}

interface CreateFixturePatternConfig {
  ignore?: string[];
  fileType?: string;
  ignoreSourceType?: string[];
}

const fixturesDirPath = path.join(__dirname, '../fixtures');

/**
 * JSX fixtures which have known issues for typescript-estree
 */
const jsxFilesWithKnownIssues = jsxKnownIssues.map(f => f.replace('jsx/', ''));

/**
 * Current random error difference on jsx/invalid-no-tag-name.src.js
 * TSEP - SyntaxError
 * Babel - RangeError
 *
 * Reported here: https://github.com/babel/babel/issues/6680
 */
jsxFilesWithKnownIssues.push('invalid-no-tag-name');

/**
 * Globally track which fixtures need to be parsed with sourceType: "module"
 * so that they can be added with the correct FixturePatternConfig
 */
let fixturesRequiringSourceTypeModule: FixturePatternConfig[] = [];

/**
 * Utility to generate a FixturePatternConfig object containing the glob pattern for specific subsections of the fixtures/ directory,
 * including the capability to ignore specific nested patterns.
 *
 * @param {string} fixturesSubPath the sub-path within the fixtures/ directory
 * @param {CreateFixturePatternConfig?} config an optional configuration object with optional sub-paths to ignore and/or parse with sourceType: module
 * @returns {FixturePatternConfig} an object containing the glob pattern and optional additional config
 */
function createFixturePatternConfigFor(
  fixturesSubPath: string,
  config?: CreateFixturePatternConfig
): FixturePatternConfig {
  if (!fixturesSubPath) {
    throw new Error(
      'fixtureSubPath was not provided for the current fixture pattern'
    );
  }
  if (!fs.existsSync(path.join(fixturesDirPath, fixturesSubPath))) {
    throw new Error(
      `Registered path '${path.join(__dirname, fixturesSubPath)}' was not found`
    );
  }

  config = config || ({} as CreateFixturePatternConfig);
  config.ignore = config.ignore || [];
  config.fileType = config.fileType || 'js';
  config.ignoreSourceType = config.ignoreSourceType || [];
  const jsx =
    config.fileType === 'js' ||
    config.fileType === 'jsx' ||
    config.fileType === 'tsx';

  /**
   * The TypeScript compiler gives us the "externalModuleIndicator" to allow typescript-estree do dynamically detect the "sourceType".
   * Babel has similar feature sourceType='unambiguous' but its not perfect, and in some specific cases we sill have to enforce it.
   *
   * First merge the fixtures which need to be parsed with sourceType: "module" into the
   * ignore list, and then add their full config into the global array.
   */
  if (config.ignoreSourceType.length) {
    config.ignore = ([] as string[]).concat(
      config.ignore,
      config.ignoreSourceType
    );
    for (const fixture of config.ignoreSourceType) {
      fixturesRequiringSourceTypeModule.push({
        // It needs to be the full path from within fixtures/ for the pattern
        pattern: `${fixturesSubPath}/${fixture}.src.${config.fileType}`,
        ignoreSourceType: true,
        jsx
      });
    }
  }
  return {
    pattern: `${fixturesSubPath}/!(${config.ignore.join('|')}).src.${
      config.fileType
    }`,
    ignoreSourceType: false,
    jsx
  };
}

/**
 * An array of FixturePatternConfigs
 */
let fixturePatternConfigsToTest = [
  createFixturePatternConfigFor('javascript/basics'),

  createFixturePatternConfigFor('comments', {
    ignore: [
      /**
       * Template strings seem to also be affected by the difference in opinion between different parsers in:
       * https://github.com/babel/babel/issues/6681
       */
      'no-comment-template', // Purely AST diffs
      'template-string-block' // Purely AST diffs
    ]
  }),

  createFixturePatternConfigFor('javascript/templateStrings', {
    ignore: ['**/*']
  }),

  createFixturePatternConfigFor('javascript/simple-literals'),

  createFixturePatternConfigFor('javascript/directives'),

  createFixturePatternConfigFor('javascript/experimentalObjectRestSpread', {
    ignore: [
      /**
       * Trailing comma is not permitted after a "RestElement" in Babel
       */
      'invalid-rest-trailing-comma'
    ]
  }),

  createFixturePatternConfigFor('javascript/arrowFunctions', {
    ignore: [
      /**
       * Expected babel parse errors - all of these files below produce parse errors in espree
       * as well, but the TypeScript compiler is so forgiving during parsing that typescript-estree
       * does not actually error on them and will produce an AST.
       */
      'error-dup-params', // babel parse errors
      'error-strict-dup-params', // babel parse errors
      'error-strict-octal', // babel parse errors
      'error-two-lines' // babel parse errors
    ]
  }),

  createFixturePatternConfigFor('javascript/bigIntLiterals'),
  createFixturePatternConfigFor('javascript/binaryLiterals'),
  createFixturePatternConfigFor('javascript/blockBindings'),

  createFixturePatternConfigFor('javascript/classes', {
    ignore: [
      /**
       * super() is being used outside of constructor. Other parsers (e.g. espree, acorn) do not error on this.
       */
      'class-one-method-super', // babel parse errors
      /**
       * Expected babel parse errors - all of these files below produce parse errors in espree
       * as well, but the TypeScript compiler is so forgiving during parsing that typescript-estree
       * does not actually error on them and will produce an AST.
       */
      'invalid-class-declaration', // babel parse errors
      'invalid-class-setter-declaration' // babel parse errors
    ]
  }),

  createFixturePatternConfigFor('javascript/defaultParams'),

  createFixturePatternConfigFor('javascript/destructuring', {
    ignore: [
      /**
       * Expected babel parse errors - all of these files below produce parse errors in espree
       * as well, but the TypeScript compiler is so forgiving during parsing that typescript-estree
       * does not actually error on them and will produce an AST.
       */
      'invalid-defaults-object-assign' // babel parse errors
    ]
  }),

  createFixturePatternConfigFor('javascript/destructuring-and-arrowFunctions'),
  createFixturePatternConfigFor('javascript/destructuring-and-blockBindings'),
  createFixturePatternConfigFor('javascript/destructuring-and-defaultParams'),
  createFixturePatternConfigFor('javascript/destructuring-and-forOf'),

  createFixturePatternConfigFor('javascript/destructuring-and-spread', {
    ignore: [
      /**
       * Expected babel parse errors - all of these files below produce parse errors in espree
       * as well, but the TypeScript compiler is so forgiving during parsing that typescript-estree
       * does not actually error on them and will produce an AST.
       */
      'error-complex-destructured-spread-first', // babel parse errors
      'not-final-array' // babel parse errors
    ]
  }),

  createFixturePatternConfigFor('javascript/experimentalAsyncIteration'),
  createFixturePatternConfigFor('javascript/experimentalDynamicImport'),
  createFixturePatternConfigFor('javascript/exponentiationOperators'),
  createFixturePatternConfigFor('javascript/experimentalOptionalCatchBinding'),

  createFixturePatternConfigFor('javascript/for'),
  createFixturePatternConfigFor('javascript/forIn', {
    ignore: [
      /**
       * Error: AST difference
       * tsep: AssignmentExpression
       * babel: AssignmentPattern
       */
      'for-in-with-bare-assigment',
      /**
       * Expected babel parse errors - all of these files below produce parse errors in espree
       * as well, but the TypeScript compiler is so forgiving during parsing that typescript-estree
       * does not actually error on them and will produce an AST.
       */
      'for-in-with-assigment' // babel parse errors
    ]
  }),
  createFixturePatternConfigFor('javascript/forOf', {
    ignore: [
      /**
       * TypeScript, espree and acorn parse this fine - esprima, flow and babel do not...
       */
      'for-of-with-function-initializer' // babel parse errors
    ]
  }),

  createFixturePatternConfigFor('javascript/generators'),
  createFixturePatternConfigFor('javascript/globalReturn'),

  createFixturePatternConfigFor('javascript/modules', {
    ignore: [
      /**
       * Expected babel parse errors - all of these files below produce parse errors in espree
       * as well, but the TypeScript compiler is so forgiving during parsing that typescript-estree
       * does not actually error on them and will produce an AST.
       */
      'invalid-export-named-default', // babel parse errors
      'invalid-import-default-module-specifier', // babel parse errors
      'invalid-import-module-specifier' // babel parse errors
    ],
    ignoreSourceType: ['error-function', 'error-strict', 'error-delete']
  }),

  createFixturePatternConfigFor('javascript/newTarget', {
    ignore: [
      /**
       * Expected babel parse errors - all of these files below produce parse errors in espree
       * as well, but the TypeScript compiler is so forgiving during parsing that typescript-estree
       * does not actually error on them and will produce an AST.
       */
      'invalid-new-target', // babel parse errors
      'invalid-unknown-property' // babel parse errors
    ]
  }),

  createFixturePatternConfigFor('javascript/objectLiteral'),
  createFixturePatternConfigFor('javascript/objectLiteralComputedProperties'),

  createFixturePatternConfigFor('javascript/objectLiteralDuplicateProperties', {
    ignore: [
      /**
       * Expected babel parse errors - all of these files below produce parse errors in espree
       * as well, but the TypeScript compiler is so forgiving during parsing that typescript-estree
       * does not actually error on them and will produce an AST.
       */
      'error-proto-property', // babel parse errors
      'error-proto-string-property' // babel parse errors
    ]
  }),

  createFixturePatternConfigFor('javascript/objectLiteralShorthandMethods'),
  createFixturePatternConfigFor('javascript/objectLiteralShorthandProperties'),
  createFixturePatternConfigFor('javascript/octalLiterals'),
  createFixturePatternConfigFor('javascript/regex'),
  createFixturePatternConfigFor('javascript/regexUFlag'),
  createFixturePatternConfigFor('javascript/regexYFlag'),

  createFixturePatternConfigFor('javascript/restParams', {
    ignore: [
      /**
       * Expected babel parse errors - all of these files below produce parse errors in espree
       * as well, but the TypeScript compiler is so forgiving during parsing that typescript-estree
       * does not actually error on them and will produce an AST.
       */
      'error-no-default', // babel parse errors
      'error-not-last' // babel parse errors
    ]
  }),

  createFixturePatternConfigFor('javascript/spread'),
  createFixturePatternConfigFor('javascript/unicodeCodePointEscapes'),

  /* ================================================== */

  createFixturePatternConfigFor('jsx', {
    ignore: jsxFilesWithKnownIssues
  }),
  createFixturePatternConfigFor('jsx-useJSXTextNode'),

  /* ================================================== */

  /**
   * TSX-SPECIFIC FILES
   */

  createFixturePatternConfigFor('tsx', {
    fileType: 'tsx'
  }),

  /* ================================================== */

  /**
   * TYPESCRIPT-SPECIFIC FILES
   */

  createFixturePatternConfigFor('typescript/babylon-convergence', {
    fileType: 'ts'
  }),

  createFixturePatternConfigFor('typescript/basics', {
    fileType: 'ts',
    ignore: [
      /**
       * Other babel parse errors relating to invalid syntax.
       */
      'abstract-class-with-abstract-constructor', // babel parse errors
      'class-with-export-parameter-properties', // babel parse errors
      'class-with-implements-and-extends', // babel parse errors
      'class-with-optional-methods', // babel parse errors
      'class-with-static-parameter-properties', // babel parse errors
      'interface-with-all-property-types', // babel parse errors
      'interface-with-construct-signature-with-parameter-accessibility', // babel parse errors
      /**
       * typescript-estree erroring, but babel not.
       */
      'arrow-function-with-type-parameters', // typescript-estree parse errors
      /**
       * Babel: ClassDeclaration + abstract: true
       * tsep: TSAbstractClassDeclaration
       */
      'abstract-class-with-abstract-properties',
      /**
       * Babel: ClassProperty + abstract: true
       * tsep: TSAbstractClassProperty
       */
      'abstract-class-with-abstract-readonly-property',
      /**
       * Babel: TSExpressionWithTypeArguments
       * tsep: ClassImplements
       */
      'class-with-implements-generic-multiple',
      'class-with-implements-generic',
      'class-with-implements',
      'class-with-extends-and-implements',
      /**
       * Other major AST differences (e.g. fundamentally different node types)
       */
      'class-with-mixin',
      'function-with-types-assignation',
      'interface-extends-multiple',
      'interface-extends',
      'interface-type-parameters',
      'interface-with-extends-type-parameters',
      'interface-with-generic',
      'interface-with-jsdoc',
      'interface-with-optional-properties',
      'interface-without-type-annotation',
      'typed-this',
      'export-type-function-declaration',
      'abstract-interface',
      /**
       * Babel bug for optional or abstract methods?
       */
      'abstract-class-with-abstract-method', // babel parse errors
      'abstract-class-with-optional-method', // babel parse errors
      'declare-class-with-optional-method', // babel parse errors
      /**
       * Awaiting feedback on Babel issue https://github.com/babel/babel/issues/6679
       */
      'class-with-private-parameter-properties',
      'class-with-protected-parameter-properties',
      'class-with-public-parameter-properties',
      'class-with-readonly-parameter-properties',
      /**
       * Not yet supported in Babel https://github.com/babel/babel/issues/7749
       */
      'import-type',
      'import-type-with-type-parameters-in-type-reference',
      /**
       * babel is not supporting it yet https://github.com/babel/babel/pull/9230
       * Babel: TSTypeReference -> Identifier
       * tsep: TSBigIntKeyword
       */
      'typed-keyword-bigint',
      /**
       * Not yet supported in Babel https://github.com/babel/babel/issues/9228
       * Directive field is not added to module and namespace
       */
      'directive-in-module',
      /**
       * Not yet supported in Babel https://github.com/babel/babel/issues/9228
       * Directive field is not added to module and namespace
       */
      'directive-in-namespace',
      /**
       * there is difference in range between babel and tsep
       */
      'type-assertion'
    ],
    ignoreSourceType: [
      // https://github.com/babel/babel/issues/9213
      'export-assignment',
      'import-equal-declaration',
      'import-export-equal-declaration'
    ]
  }),

  createFixturePatternConfigFor('typescript/decorators/accessor-decorators', {
    fileType: 'ts'
  }),
  createFixturePatternConfigFor('typescript/decorators/class-decorators', {
    fileType: 'ts'
  }),
  createFixturePatternConfigFor('typescript/decorators/method-decorators', {
    fileType: 'ts'
  }),
  createFixturePatternConfigFor('typescript/decorators/parameter-decorators', {
    fileType: 'ts'
  }),
  createFixturePatternConfigFor('typescript/decorators/property-decorators', {
    fileType: 'ts'
  }),

  createFixturePatternConfigFor('typescript/expressions', {
    fileType: 'ts',
    ignore: [
      /**
       * there is difference in range between babel and tsep
       */
      'tagged-template-expression-type-arguments'
    ]
  }),

  createFixturePatternConfigFor('typescript/errorRecovery', {
    fileType: 'ts',
    ignore: [
      /**
       * AST difference
       */
      'interface-empty-extends',
      /**
       * TypeScript-specific tests taken from "errorRecovery". Babel is not being as forgiving as the TypeScript compiler here.
       */
      'class-empty-extends-implements', // babel parse errors
      'class-empty-extends', // babel parse errors
      'decorator-on-enum-declaration', // babel parse errors
      'decorator-on-interface-declaration', // babel parse errors
      'interface-property-modifiers', // babel parse errors
      'enum-with-keywords', // babel parse errors
      'solo-const' // babel parse errors
    ]
  }),

  createFixturePatternConfigFor('typescript/types', {
    fileType: 'ts'
  }),

  createFixturePatternConfigFor('typescript/declare', {
    fileType: 'ts',
    ignore: [
      /**
       * AST difference
       * tsep: heritage = []
       * babel: heritage = undefined
       */
      'interface',
      /**
       * AST difference
       * tsep: TSAbstractClassDeclaration
       * babel: ClassDeclaration[abstract=true]
       */
      'abstract-class'
    ]
  }),

  createFixturePatternConfigFor('typescript/namespaces-and-modules', {
    fileType: 'ts',
    ignore: [
      /**
       * Minor AST difference
       */
      'nested-internal-module',
      /**
       * Babel: TSDeclareFunction
       * tsep: TSNamespaceFunctionDeclaration
       */
      'declare-namespace-with-exported-function'
    ],
    ignoreSourceType: [
      'module-with-default-exports',
      'ambient-module-declaration-with-import'
    ]
  })
];

/**
 * Add in all the fixtures which need to be parsed with sourceType: "module"
 */
fixturePatternConfigsToTest = ([] as FixturePatternConfig[]).concat(
  fixturePatternConfigsToTest,
  fixturesRequiringSourceTypeModule
);

const fixturesToTest: Fixture[] = [];

/**
 * Resolve the glob patterns into actual Fixture files that we can run assertions for...
 */
fixturePatternConfigsToTest.forEach(fixturePatternConfig => {
  /**
   * Find the fixture files which match the given pattern
   */
  const matchingFixtures = glob.sync(
    `${fixturesDirPath}/${fixturePatternConfig.pattern}`,
    {}
  );
  matchingFixtures.forEach(filename => {
    fixturesToTest.push({
      filename,
      ignoreSourceType: fixturePatternConfig.ignoreSourceType,
      jsx: fixturePatternConfig.jsx
    });
  });
});

export { fixturesToTest };
