"use strict";

const path = require("path");
const glob = require("glob");

/**
 * JSX fixtures which have known issues for typescript-eslint-parser
 */
const jsxFilesWithKnownIssues = require("../jsx-known-issues").map(f => f.replace("jsx/", ""));

/**
 * Current random error difference on jsx/invalid-no-tag-name.src.js
 * TSEP - SyntaxError
 * Babylon - RangeError
 *
 * Reported here: https://github.com/babel/babylon/issues/674
 */
jsxFilesWithKnownIssues.push("invalid-no-tag-name");

/**
 * Custom constructs/concepts used in this file:
 *
 * type Pattern = string; // used for node-glob matching
 *
 * interface FixturePatternConfig {
 *   pattern: Pattern,
 *   config?: {
 *     babylonParserOptions: any,
 *     typeScriptESLintParserOptions: any
 *   }
 * }
 */

/**
 * Globally track which fixtures need to be parsed with sourceType: "module"
 * so that they can be added with the correct FixturePatternConfig
 */
let fixturesRequiringSourceTypeModule = [];

/**
 * Utility to generate a FixturePatternConfig object containing the glob pattern for specific subsections of the fixtures/ directory,
 * including the capability to ignore specific nested patterns.
 * 
 * @param {string} fixturesSubPath the sub-path within the fixtures/ directory
 * @param {Object?} config an optional configuration object with optional sub-paths to ignore and/or parse with sourceType: module
 * @returns {FixturePatternConfig} an object containing the glob pattern and optional additional config
 */
function createFixturePatternConfigFor(fixturesSubPath, config) {
    if (!fixturesSubPath) {
        return "";
    }
    config = config || {};
    config.ignore = config.ignore || [];
    config.fileType = config.fileType || "js";
    config.parseWithSourceTypeModule = config.parseWithSourceTypeModule || [];
    /**
     * The TypeScript compiler gives us the "externalModuleIndicator" to allow typescript-eslint-parser do dynamically detect the "sourceType".
     * Babylon does not have an equivalent feature (although perhaps it might come in the future https://github.com/babel/babylon/issues/440),
     * so we have to specify the "sourceType" we want to use.
     *
     * By default we have configured babylon to use "script", but for any fixtures specified in the parseWithSourceTypeModule array we need "module".
     *
     * First merge the fixtures which need to be parsed with sourceType: "module" into the
     * ignore list, and then add their full config into the global array.
     */
    if (config.parseWithSourceTypeModule.length) {
        config.ignore = [].concat(config.ignore, config.parseWithSourceTypeModule);
        fixturesRequiringSourceTypeModule = [].concat(fixturesRequiringSourceTypeModule, config.parseWithSourceTypeModule.map(
            fixture => ({
                // It needs to be the full path from within fixtures/ for the pattern
                pattern: `${fixturesSubPath}/${fixture}.src.${config.fileType}`,
                config: { babylonParserOptions: { sourceType: "module" } }
            })
        ));
    }
    return {
        pattern: `${fixturesSubPath}/!(${config.ignore.join("|")}).src.${config.fileType}`
    };
}

/**
 * An array of FixturePatternConfigs
 */
let fixturePatternConfigsToTest = [
    createFixturePatternConfigFor("basics"),

    createFixturePatternConfigFor("comments", {
        ignore: [
            "export-default-anonymous-class", // needs to be parsed with `sourceType: "module"`
            /**
             * Template strings seem to also be affected by the difference in opinion between different parsers in:
             * https://github.com/babel/babylon/issues/673
             */
            "no-comment-template", // Purely AST diffs
            "template-string-block" // Purely AST diffs
        ]
    }),

    createFixturePatternConfigFor("ecma-features/templateStrings", {
        ignore: [
            "**/*"
        ]
    }),

    createFixturePatternConfigFor("ecma-features/experimentalObjectRestSpread", {
        ignore: [
            /**
             * "ExperimentalSpreadProperty" in espree/typescript-eslint-parser vs "SpreadElement" in Babylon
             * comes up a lot in this section
             */
            "**/*"
        ]
    }),

    createFixturePatternConfigFor("ecma-features/arrowFunctions", {
        ignore: [
            /**
             * Expected babylon parse errors - all of these files below produce parse errors in espree
             * as well, but the TypeScript compiler is so forgiving during parsing that typescript-eslint-parser
             * does not actually error on them and will produce an AST.
             */
            "error-dup-params", // babylon parse errors
            "error-dup-params", // babylon parse errors
            "error-strict-dup-params", // babylon parse errors
            "error-strict-octal", // babylon parse errors
            "error-two-lines" // babylon parse errors
        ]
    }),

    createFixturePatternConfigFor("ecma-features/binaryLiterals"),
    createFixturePatternConfigFor("ecma-features/blockBindings"),

    createFixturePatternConfigFor("ecma-features/classes", {
        ignore: [
            /**
             * super() is being used outside of constructor. Other parsers (e.g. espree, acorn) do not error on this.
             */
            "class-one-method-super", // babylon parse errors
            /**
             * Expected babylon parse errors - all of these files below produce parse errors in espree
             * as well, but the TypeScript compiler is so forgiving during parsing that typescript-eslint-parser
             * does not actually error on them and will produce an AST.
             */
            "invalid-class-declaration", // babylon parse errors
            "invalid-class-setter-declaration" // babylon parse errors
        ]
    }),

    createFixturePatternConfigFor("ecma-features/defaultParams"),

    createFixturePatternConfigFor("ecma-features/destructuring", {
        ignore: [
            /**
             * Expected babylon parse errors - all of these files below produce parse errors in espree
             * as well, but the TypeScript compiler is so forgiving during parsing that typescript-eslint-parser
             * does not actually error on them and will produce an AST.
             */
            "invalid-defaults-object-assign" // babylon parse errors
        ]
    }),

    createFixturePatternConfigFor("ecma-features/destructuring-and-arrowFunctions"),
    createFixturePatternConfigFor("ecma-features/destructuring-and-blockBindings"),
    createFixturePatternConfigFor("ecma-features/destructuring-and-defaultParams"),
    createFixturePatternConfigFor("ecma-features/destructuring-and-forOf"),

    createFixturePatternConfigFor("ecma-features/destructuring-and-spread", {
        ignore: [
            /**
             * Expected babylon parse errors - all of these files below produce parse errors in espree
             * as well, but the TypeScript compiler is so forgiving during parsing that typescript-eslint-parser
             * does not actually error on them and will produce an AST.
             */
            "error-complex-destructured-spread-first" // babylon parse errors
        ]
    }),

    createFixturePatternConfigFor("ecma-features/experimentalAsyncIteration"),
    createFixturePatternConfigFor("ecma-features/experimentalDynamicImport"),
    createFixturePatternConfigFor("ecma-features/exponentiationOperators"),

    createFixturePatternConfigFor("ecma-features/forOf", {
        ignore: [
            /**
             * TypeScript, espree and acorn parse this fine - esprima, flow and babylon do not...
             */
            "for-of-with-function-initializer" // babylon parse errors
        ]
    }),

    createFixturePatternConfigFor("ecma-features/generators"),
    createFixturePatternConfigFor("ecma-features/globalReturn"),

    createFixturePatternConfigFor("ecma-features/modules", {
        ignore: [
            /**
             * TypeScript, flow and babylon parse this fine - esprima, espree and acorn do not...
             */
            "invalid-export-default", // typescript-eslint-parser parse errors
            /**
             * Expected babylon parse errors - all of these files below produce parse errors in espree
             * as well, but the TypeScript compiler is so forgiving during parsing that typescript-eslint-parser
             * does not actually error on them and will produce an AST.
             */
            "invalid-export-named-default", // babylon parse errors
            "invalid-import-default-module-specifier", // babylon parse errors
            "invalid-import-module-specifier", // babylon parse errors
            /**
             * Deleting local variable in strict mode
             */
            "error-delete", // babylon parse errors
            /**
             * 'with' in strict mode
             */
            "error-strict" // babylon parse errors
        ],
        parseWithSourceTypeModule: [
            "export-default-array",
            "export-default-class",
            "export-default-expression",
            "export-default-function",
            "export-default-named-class",
            "export-default-named-function",
            "export-default-number",
            "export-default-object",
            "export-default-value",
            "export-from-batch",
            "export-from-default",
            "export-from-named-as-default",
            "export-from-named-as-specifier",
            "export-from-named-as-specifiers",
            "export-from-specifier",
            "export-from-specifiers",
            "export-function",
            "export-named-as-default",
            "export-named-as-specifier",
            "export-named-as-specifiers",
            "export-named-class",
            "export-named-empty",
            "export-named-specifier",
            "export-named-specifiers-comma",
            "export-named-specifiers",
            "export-var-anonymous-function",
            "export-var-number",
            "export-var",
            "import-default-and-named-specifiers",
            "import-default-and-namespace-specifiers",
            "import-default-as",
            "import-default",
            "import-jquery",
            "import-module",
            "import-named-as-specifier",
            "import-named-as-specifiers",
            "import-named-empty",
            "import-named-specifier",
            "import-named-specifiers-comma",
            "import-named-specifiers",
            "import-namespace-specifier",
            "import-null-as-nil",
            "invalid-await",
            "invalid-class"
        ]
    }),

    createFixturePatternConfigFor("ecma-features/newTarget", {
        ignore: [
            /**
             * Expected babylon parse errors - all of these files below produce parse errors in espree
             * as well, but the TypeScript compiler is so forgiving during parsing that typescript-eslint-parser
             * does not actually error on them and will produce an AST.
             */
            "invalid-new-target", // babylon parse errors
            "invalid-unknown-property" // babylon parse errors
        ]
    }),

    createFixturePatternConfigFor("ecma-features/objectLiteralComputedProperties"),

    createFixturePatternConfigFor("ecma-features/objectLiteralDuplicateProperties", {
        ignore: [
            /**
             * Expected babylon parse errors - all of these files below produce parse errors in espree
             * as well, but the TypeScript compiler is so forgiving during parsing that typescript-eslint-parser
             * does not actually error on them and will produce an AST.
             */
            "error-proto-property", // babylon parse errors
            "error-proto-string-property" // babylon parse errors
        ]
    }),

    createFixturePatternConfigFor("ecma-features/objectLiteralShorthandMethods"),
    createFixturePatternConfigFor("ecma-features/objectLiteralShorthandProperties"),
    createFixturePatternConfigFor("ecma-features/octalLiterals"),
    createFixturePatternConfigFor("ecma-features/regex"),
    createFixturePatternConfigFor("ecma-features/regexUFlag"),
    createFixturePatternConfigFor("ecma-features/regexYFlag"),

    createFixturePatternConfigFor("ecma-features/restParams", {
        ignore: [
            /**
             * Expected babylon parse errors - all of these files below produce parse errors in espree
             * as well, but the TypeScript compiler is so forgiving during parsing that typescript-eslint-parser
             * does not actually error on them and will produce an AST.
             */
            "error-no-default", // babylon parse errors
            "error-not-last" // babylon parse errors
        ]
    }),

    createFixturePatternConfigFor("ecma-features/spread"),
    createFixturePatternConfigFor("ecma-features/unicodeCodePointEscapes"),
    createFixturePatternConfigFor("jsx", { ignore: jsxFilesWithKnownIssues }),
    createFixturePatternConfigFor("jsx-useJSXTextNode"),

    /* ================================================== */

    /**
     * TSX-SPECIFIC FILES
     */

    createFixturePatternConfigFor("tsx", {
        fileType: "tsx",
        ignore: [
            /**
             * AST difference
             */
            "react-typed-props"
        ]
    }),

    /* ================================================== */

    /**
     * TYPESCRIPT-SPECIFIC FILES
     */

    createFixturePatternConfigFor("typescript/babylon-convergence", { fileType: "ts" }),

    createFixturePatternConfigFor("typescript/basics", {
        fileType: "ts",
        ignore: [
            /**
             * Other babylon parse errors relating to invalid syntax.
             */
            "abstract-class-with-abstract-constructor", // babylon parse errors
            "class-with-export-parameter-properties", // babylon parse errors
            "class-with-optional-methods", // babylon parse errors
            "class-with-static-parameter-properties", // babylon parse errors
            "interface-with-all-property-types", // babylon parse errors
            "interface-with-construct-signature-with-parameter-accessibility", // babylon parse errors
            "class-with-implements-and-extends", // babylon parse errors
            /**
             * typescript-eslint-parser erroring, but babylon not.
             */
            "arrow-function-with-type-parameters", // typescript-eslint-parser parse errors
            /**
             * Babylon: ClassDeclaration + abstract: true
             * tsep: TSAbstractClassDeclaration
             */
            "abstract-class-with-abstract-properties",
            /**
             * Babylon: ClassProperty + abstract: true
             * tsep: TSAbstractClassProperty
             */
            "abstract-class-with-abstract-readonly-property",
            /**
             * Babylon: TSExpressionWithTypeArguments
             * tsep: ClassImplements
             */
            "class-with-implements-generic-multiple",
            "class-with-implements-generic",
            "class-with-implements",
            "class-with-extends-and-implements",
            /**
             * Babylon: TSDeclareFunction + declare: true
             * tsep: DeclareFunction
             */
            "declare-function",
            /**
             * Other major AST differences (e.g. fundamentally different node types)
             */
            "class-with-mixin",
            "function-with-types-assignation",
            "interface-extends-multiple",
            "interface-extends",
            "interface-type-parameters",
            "interface-with-extends-type-parameters",
            "interface-with-generic",
            "interface-with-jsdoc",
            "interface-with-optional-properties",
            "interface-without-type-annotation",
            "type-alias-declaration-with-constrained-type-parameter",
            "type-alias-declaration",
            "type-alias-object-without-annotation",
            "typed-this",
            "class-with-optional-properties",
            "class-with-optional-property-undefined",
            "export-type-function-declaration",
            "export-type-class-declaration",
            "abstract-interface",
            "export-type-alias-declaration",
            /**
             * tsep bug - Program.body[0].expression.left.properties[0].value.right is currently showing up
             * as `ArrayPattern`, babylon, acorn and espree say it should be `ArrayExpression`
             * TODO: Fix this
             */
            "destructuring-assignment",
            /**
             * Babylon bug for optional or abstract methods?
             */
            "abstract-class-with-abstract-method", // babylon parse errors
            "abstract-class-with-optional-method", // babylon parse errors
            "declare-class-with-optional-method", // babylon parse errors
            /**
             * Awaiting feedback on Babylon issue https://github.com/babel/babylon/issues/700
             */
            "class-with-private-parameter-properties",
            "class-with-protected-parameter-properties",
            "class-with-public-parameter-properties",
            "class-with-readonly-parameter-properties"
        ],
        parseWithSourceTypeModule: [
            "export-named-enum",
            "export-assignment",
            "export-default-class-with-generic",
            "export-default-class-with-multiple-generics",
            "export-named-class-with-generic",
            "export-named-class-with-multiple-generics"
        ]
    }),

    createFixturePatternConfigFor("typescript/decorators/accessor-decorators", { fileType: "ts" }),
    createFixturePatternConfigFor("typescript/decorators/class-decorators", { fileType: "ts" }),
    createFixturePatternConfigFor("typescript/decorators/method-decorators", { fileType: "ts" }),
    createFixturePatternConfigFor("typescript/decorators/parameter-decorators", { fileType: "ts" }),
    createFixturePatternConfigFor("typescript/decorators/property-decorators", { fileType: "ts" }),

    createFixturePatternConfigFor("typescript/expressions", { fileType: "ts" }),

    createFixturePatternConfigFor("typescript/errorRecovery", {
        fileType: "ts",
        ignore: [
            /**
             * AST difference
             */
            "interface-empty-extends",
            /**
             * TypeScript-specific tests taken from "errorRecovery". Babylon is not being as forgiving as the TypeScript compiler here.
             */
            "class-empty-extends-implements", // babylon parse errors
            "class-empty-extends", // babylon parse errors
            "decorator-on-enum-declaration", // babylon parse errors
            "interface-property-modifiers", // babylon parse errors
            "enum-with-keywords" // babylon parse errors
        ]
    }),

    createFixturePatternConfigFor("typescript/namespaces-and-modules", {
        fileType: "ts",
        ignore: [
            /**
             * Minor AST difference
             */
            "nested-internal-module",
            /**
             * Babylon: TSDeclareFunction
             * tsep: TSNamespaceFunctionDeclaration
             */
            "declare-namespace-with-exported-function",
            /**
             * Babylon: FunctionDeclaration
             * tsep: TSNamespaceFunctionDeclaration
             */
            "module-with-default-exports"
        ]
    })
];

/**
 * Add in all the fixtures which need to be parsed with sourceType: "module"
 */
fixturePatternConfigsToTest = [].concat(fixturePatternConfigsToTest, fixturesRequiringSourceTypeModule);

/**
 * interface Fixture {
 *   filename: string,
 *   config?: any
 * }
 */
const fixturesToTest = [];
const fixturesDirPath = path.join(__dirname, "../fixtures");

/**
 * Resolve the glob patterns into actual Fixture files that we can run assertions for...
 */
fixturePatternConfigsToTest.forEach(fixturePatternConfig => {
    /**
     * Find the fixture files which match the given pattern
     */
    const matchingFixtures = glob.sync(`${fixturesDirPath}/${fixturePatternConfig.pattern}`, {});
    matchingFixtures.forEach(filename => {
        fixturesToTest.push({
            filename,
            config: fixturePatternConfig.config
        });
    });
});

module.exports = fixturesToTest;
