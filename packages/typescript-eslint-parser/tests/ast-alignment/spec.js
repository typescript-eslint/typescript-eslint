"use strict";

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const parse = require("./parse");
const parseUtils = require("./utils");

/**
 * JSX fixtures which have known issues for typescript-eslint-parser
 */
const jsxFilesWithKnownIssues = require("../jsx-known-issues");

/**
 * Current random error difference on jsx/invalid-no-tag-name.src.js
 * TSEP - SyntaxError
 * Babylon - RangeError
 *
 * Reported here: https://github.com/babel/babylon/issues/674
 */
jsxFilesWithKnownIssues.push("jsx/invalid-no-tag-name");

const jsxPattern = `jsx/!(${jsxFilesWithKnownIssues.map(f => f.replace("jsx/", "")).join("|")}).src.js`;

const fixturesDirPath = path.join(__dirname, "../fixtures");

// Either a string of the pattern, or an object containing the pattern and some additional config
const fixturePatternsToTest = [
    "basics/**/*.src.js",

    "comments/block-trailing-comment.src.js",
    "comments/comment-within-condition.src.js",
    "comments/jsx-block-comment.src.js",
    "comments/jsx-tag-comments.src.js",
    "comments/line-comment-with-block-syntax.src.js",
    "comments/mix-line-and-block-comments.src.js",
    "comments/no-comment-regex.src.js",
    "comments/surrounding-call-comments.src.js",
    "comments/surrounding-debugger-comments.src.js",
    "comments/surrounding-return-comments.src.js",
    "comments/surrounding-throw-comments.src.js",
    "comments/surrounding-while-loop-comments.src.js",
    "comments/switch-fallthrough-comment-in-function.src.js",
    "comments/switch-fallthrough-comment.src.js",
    "comments/switch-no-default-comment-in-function.src.js",
    "comments/switch-no-default-comment-in-nested-functions.src.js",
    "comments/switch-no-default-comment.src.js",

    "ecma-features/arrowFunctions/as-param-with-params.src.js",
    "ecma-features/arrowFunctions/as-param.src.js",
    "ecma-features/arrowFunctions/basic.src.js",
    "ecma-features/arrowFunctions/basic-in-binary-expression.src.js",
    "ecma-features/arrowFunctions/block-body-not-object.src.js",
    "ecma-features/arrowFunctions/block-body.src.js",
    "ecma-features/arrowFunctions/error-missing-paren.src.js",
    "ecma-features/arrowFunctions/error-not-arrow.src.js",
    "ecma-features/arrowFunctions/error-numeric-param-multi.src.js",
    "ecma-features/arrowFunctions/error-numeric-param.src.js",
    "ecma-features/arrowFunctions/error-reverse-arrow.src.js",
    "ecma-features/arrowFunctions/error-strict-default-param-eval.src.js",
    "ecma-features/arrowFunctions/error-strict-eval-return.src.js",
    "ecma-features/arrowFunctions/error-strict-eval.src.js",
    "ecma-features/arrowFunctions/error-strict-param-arguments.src.js",
    "ecma-features/arrowFunctions/error-strict-param-eval.src.js",
    "ecma-features/arrowFunctions/error-strict-param-names.src.js",
    "ecma-features/arrowFunctions/error-strict-param-no-paren-arguments.src.js",
    "ecma-features/arrowFunctions/error-strict-param-no-paren-eval.src.js",
    "ecma-features/arrowFunctions/error-wrapped-param.src.js",
    "ecma-features/arrowFunctions/expression.src.js",
    "ecma-features/arrowFunctions/iife.src.js",
    "ecma-features/arrowFunctions/multiple-params.src.js",
    "ecma-features/arrowFunctions/no-auto-return.src.js",
    "ecma-features/arrowFunctions/not-strict-arguments.src.js",
    "ecma-features/arrowFunctions/not-strict-eval-params.src.js",
    "ecma-features/arrowFunctions/not-strict-eval.src.js",
    "ecma-features/arrowFunctions/not-strict-octal.src.js",
    "ecma-features/arrowFunctions/return-arrow-function.src.js",
    "ecma-features/arrowFunctions/return-sequence.src.js",
    "ecma-features/arrowFunctions/single-param-parens.src.js",
    "ecma-features/arrowFunctions/single-param-return-identifier.src.js",
    "ecma-features/arrowFunctions/single-param.src.js",
    "ecma-features/binaryLiterals/**/*.src.js",
    "ecma-features/blockBindings/**/*.src.js",
    "ecma-features/classes/class-accessor-properties.src.js",
    "ecma-features/classes/class-computed-static-method.src.js",
    "ecma-features/classes/class-expression.src.js",
    "ecma-features/classes/class-method-named-prototype.src.js",
    "ecma-features/classes/class-method-named-static.src.js",
    "ecma-features/classes/class-method-named-with-space.src.js",
    "ecma-features/classes/class-one-method.src.js",
    "ecma-features/classes/class-static-method-named-prototype.src.js",
    "ecma-features/classes/class-static-method-named-static.src.js",
    "ecma-features/classes/class-static-method.src.js",
    "ecma-features/classes/class-static-methods-and-accessor-properties.src.js",
    "ecma-features/classes/class-two-computed-static-methods.src.js",
    "ecma-features/classes/class-two-methods-computed-constructor.src.js",
    "ecma-features/classes/class-two-methods-semi.src.js",
    "ecma-features/classes/class-two-methods-three-semi.src.js",
    "ecma-features/classes/class-two-methods-two-semi.src.js",
    "ecma-features/classes/class-two-methods.src.js",
    "ecma-features/classes/class-two-static-methods-named-constructor.src.js",
    "ecma-features/classes/class-with-constructor-parameters.src.js",
    "ecma-features/classes/class-with-constructor-with-space.src.js",
    "ecma-features/classes/class-with-constructor.src.js",
    "ecma-features/classes/derived-class-assign-to-var.src.js",
    "ecma-features/classes/derived-class-expression.src.js",
    "ecma-features/classes/empty-class-double-semi.src.js",
    "ecma-features/classes/empty-class-semi.src.js",
    "ecma-features/classes/empty-class.src.js",
    "ecma-features/classes/empty-literal-derived-class.src.js",
    "ecma-features/classes/named-class-expression.src.js",
    "ecma-features/classes/named-derived-class-expression.src.js",
    "ecma-features/defaultParams/**/*.src.js",
    "ecma-features/destructuring/array-member.src.js",
    "ecma-features/destructuring/array-to-array.src.js",
    "ecma-features/destructuring/array-var-undefined.src.js",
    "ecma-features/destructuring/class-constructor-params-array.src.js",
    "ecma-features/destructuring/class-constructor-params-defaults-array.src.js",
    "ecma-features/destructuring/class-constructor-params-defaults-object.src.js",
    "ecma-features/destructuring/class-constructor-params-object.src.js",
    "ecma-features/destructuring/class-method-params-array.src.js",
    "ecma-features/destructuring/class-method-params-defaults-array.src.js",
    "ecma-features/destructuring/class-method-params-defaults-object.src.js",
    "ecma-features/destructuring/class-method-params-object.src.js",
    "ecma-features/destructuring/defaults-array-all.src.js",
    "ecma-features/destructuring/defaults-array-longform-nested-multi.src.js",
    "ecma-features/destructuring/defaults-array-multi.src.js",
    "ecma-features/destructuring/defaults-array-nested-all.src.js",
    "ecma-features/destructuring/defaults-array-nested-multi.src.js",
    "ecma-features/destructuring/defaults-array.src.js",
    "ecma-features/destructuring/defaults-object-all.src.js",
    "ecma-features/destructuring/defaults-object-longform-all.src.js",
    "ecma-features/destructuring/defaults-object-longform-multi.src.js",
    "ecma-features/destructuring/defaults-object-longform.src.js",
    "ecma-features/destructuring/defaults-object-mixed-multi.src.js",
    "ecma-features/destructuring/defaults-object-multi.src.js",
    "ecma-features/destructuring/defaults-object-nested-all.src.js",
    "ecma-features/destructuring/defaults-object-nested-multi.src.js",
    "ecma-features/destructuring/defaults-object.src.js",
    "ecma-features/destructuring/destructured-array-catch.src.js",
    "ecma-features/destructuring/destructured-object-catch.src.js",
    "ecma-features/destructuring/named-param.src.js",
    "ecma-features/destructuring/nested-array.src.js",
    "ecma-features/destructuring/nested-object.src.js",
    "ecma-features/destructuring/object-var-named.src.js",
    "ecma-features/destructuring/object-var-undefined.src.js",
    "ecma-features/destructuring/param-defaults-array.src.js",
    "ecma-features/destructuring/param-defaults-object-nested.src.js",
    "ecma-features/destructuring/param-defaults-object.src.js",
    "ecma-features/destructuring/params-array-wrapped.src.js",
    "ecma-features/destructuring/params-array.src.js",
    "ecma-features/destructuring/params-multi-object.src.js",
    "ecma-features/destructuring/params-nested-array.src.js",
    "ecma-features/destructuring/params-nested-object.src.js",
    "ecma-features/destructuring/params-object-wrapped.src.js",
    "ecma-features/destructuring/params-object.src.js",
    "ecma-features/destructuring/sparse-array.src.js",
    "ecma-features/destructuring-and-arrowFunctions/**/*.src.js",
    "ecma-features/destructuring-and-blockBindings/**/*.src.js",
    "ecma-features/destructuring-and-defaultParams/**/*.src.js",
    "ecma-features/destructuring-and-forOf/**/*.src.js",
    "ecma-features/destructuring-and-spread/complex-destructured.src.js",
    "ecma-features/destructuring-and-spread/destructured-array-literal.src.js",
    "ecma-features/destructuring-and-spread/destructuring-param.src.js",
    "ecma-features/destructuring-and-spread/multi-destructured.src.js",
    "ecma-features/destructuring-and-spread/single-destructured.src.js",
    "ecma-features/destructuring-and-spread/var-complex-destructured.src.js",
    "ecma-features/destructuring-and-spread/var-destructured-array-literal.src.js",
    "ecma-features/destructuring-and-spread/var-multi-destructured.src.js",
    "ecma-features/destructuring-and-spread/var-single-destructured.src.js",
    "ecma-features/experimentalAsyncIteration/**/*.src.js",
    "ecma-features/experimentalDynamicImport/**/*.src.js",
    "ecma-features/exponentiationOperators/**/*.src.js",
    "ecma-features/forOf/for-of-with-var-and-braces.src.js",
    "ecma-features/forOf/for-of-with-var-and-no-braces.src.js",
    "ecma-features/forOf/invalid-for-of-with-const-and-no-braces.src.js",
    "ecma-features/forOf/invalid-for-of-with-let-and-no-braces.src.js",
    "ecma-features/generators/**/*.src.js",
    "ecma-features/globalReturn/**/*.src.js",
    "ecma-features/modules/error-function.src.js",
    "ecma-features/modules/invalid-export-batch-missing-from-clause.src.js",
    "ecma-features/modules/invalid-export-batch-token.src.js",
    "ecma-features/modules/invalid-export-default-equal.src.js",
    "ecma-features/modules/invalid-export-default-token.src.js (1ms)",
    "ecma-features/modules/invalid-export-named-extra-comma.src.js",
    "ecma-features/modules/invalid-export-named-middle-comma.src.js",
    "ecma-features/modules/invalid-import-default-after-named-after-default.src.js",
    "ecma-features/modules/invalid-import-default-after-named.src.js",
    "ecma-features/modules/invalid-import-default-missing-module-specifier.src.js",
    "ecma-features/modules/invalid-import-default.src.js (1ms)",
    "ecma-features/modules/invalid-import-missing-module-specifier.src.js",
    "ecma-features/modules/invalid-import-named-after-named.src.js",
    "ecma-features/modules/invalid-import-named-after-namespace.src.js",
    "ecma-features/modules/invalid-import-named-as-missing-from.src.js",
    "ecma-features/modules/invalid-import-named-extra-comma.src.js",
    "ecma-features/modules/invalid-import-named-middle-comma.src.js (1ms)",
    "ecma-features/modules/invalid-import-namespace-after-named.src.js",
    "ecma-features/modules/invalid-import-namespace-missing-as.src.js",
    "ecma-features/newTarget/simple-new-target.src.js",
    "ecma-features/objectLiteralComputedProperties/**/*.src.js",
    "ecma-features/objectLiteralDuplicateProperties/strict-duplicate-properties.src.js",
    "ecma-features/objectLiteralDuplicateProperties/strict-duplicate-string-properties.src.js",
    "ecma-features/objectLiteralShorthandMethods/**/*.src.js",
    "ecma-features/objectLiteralShorthandProperties/**/*.src.js",
    "ecma-features/octalLiterals/**/*.src.js",
    "ecma-features/regex/**/*.src.js",
    "ecma-features/regexUFlag/**/*.src.js",
    "ecma-features/regexYFlag/**/*.src.js",
    "ecma-features/restParams/basic-rest.src.js",
    "ecma-features/restParams/class-constructor.src.js",
    "ecma-features/restParams/class-method.src.js",
    "ecma-features/restParams/func-expression-multi.src.js",
    "ecma-features/restParams/func-expression.src.js",
    "ecma-features/restParams/invalid-rest-param.src.js",
    "ecma-features/restParams/single-rest.src.js",
    "ecma-features/spread/**/*.src.js",
    "ecma-features/unicodeCodePointEscapes/**/*.src.js",

    jsxPattern,

    "jsx-useJSXTextNode/**/*.src.js",

    /**
     * The TypeScript compiler gives us the "externalModuleIndicator" to allow typescript-eslint-parser do dynamically detect the "sourceType".
     * Babylon does not have an equivalent feature (although perhaps it might come in the future https://github.com/babel/babylon/issues/440),
     * so we have to specify the "sourceType" we want to use.
     *
     * By default we have configured babylon to use "script", but for the examples below we need "module".
     * Maybe fixed by https://github.com/babel/babylon/commit/00ad6d8310ce826dcdd59c7a819dbd50955058d7?
     */
    {
        pattern: "comments/export-default-anonymous-class.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-default-array.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-default-class.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-default-expression.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-default-function.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-default-named-class.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-default-named-function.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-default-number.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-default-object.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-default-value.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-from-batch.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-from-default.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-from-named-as-default.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-from-named-as-specifier.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-from-named-as-specifiers.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-from-specifier.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-from-specifiers.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-function.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-named-as-default.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-named-as-specifier.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-named-as-specifiers.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-named-class.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-named-empty.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-named-specifier.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-named-specifiers-comma.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-named-specifiers.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-var-anonymous-function.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-var-number.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/export-var.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/import-default-and-named-specifiers.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/import-default-and-namespace-specifiers.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/import-default-as.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/import-default.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/import-jquery.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/import-module.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/import-named-as-specifier.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/import-named-as-specifiers.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/import-named-empty.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/import-named-specifier.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/import-named-specifiers-comma.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/import-named-specifiers.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/import-namespace-specifier.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/import-null-as-nil.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/invalid-await.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "ecma-features/modules/invalid-class.src.js",
        config: { babylonParserOptions: { sourceType: "module" } }
    },

    /* ================================================== */

    /**
     * TYPESCRIPT-SPECIFIC FILES
     */

    /**
     * No issues
     */
    "typescript/basics/async-function-expression.src.ts",
    "typescript/basics/async-function-with-var-declaration.src.ts",
    "typescript/basics/function-with-await.src.ts",
    "typescript/errorRecovery/class-extends-empty-implements.src.ts",
    "typescript/basics/const-enum.src.ts",

    {
        pattern: "typescript/basics/export-named-enum.src.ts",
        config: { babylonParserOptions: { sourceType: "module" } }
    },
    {
        pattern: "typescript/basics/export-assignment.src.ts",
        config: { babylonParserOptions: { sourceType: "module" } }
    }

    /**
     * TypeScript-specific tests taken from "errorRecovery". Babylon is not being as forgiving as the TypeScript compiler here.
     */
    // "typescript/errorRecovery/class-empty-extends-implements.src.ts", // babylon parse errors
    // "typescript/errorRecovery/class-empty-extends.src.ts", // babylon parse errors
    // "typescript/errorRecovery/decorator-on-enum-declaration.src.ts", // babylon parse errors
    // "typescript/errorRecovery/interface-property-modifiers.src.ts", // babylon parse errors
    // "typescript/errorRecovery/enum-with-keywords.src.ts" // babylon parse errors

    /**
     * Other babylon parse errors. TODO: Need to coordinate with TS Team.
     */
    // "typescript/basics/abstract-class-with-abstract-constructor.src.ts", // babylon parse errors
    // "typescript/basics/abstract-class-with-abstract-method.src.ts", // babylon parse errors
    // "typescript/basics/abstract-class-with-optional-method.src.ts", // babylon parse errors
    // "typescript/basics/abstract-interface.src.ts", // babylon parse errors
    // "typescript/basics/class-with-export-parameter-properties.src.ts", // babylon parse errors
    // "typescript/basics/class-with-optional-methods.src.ts", // babylon parse errors
    // "typescript/basics/class-with-static-parameter-properties.src.ts", // babylon parse errors
    // "typescript/basics/declare-class-with-optional-method.src.ts", // babylon parse errors
    // "typescript/basics/export-type-alias-declaration.src.ts", // babylon parse errors
    // "typescript/basics/export-type-class-declaration.src.ts", // babylon parse errors
    // "typescript/basics/export-type-function-declaration.src.ts", // babylon parse errors
    // "typescript/basics/interface-with-all-property-types.src.ts", // babylon parse errors
    // "typescript/basics/interface-with-construct-signature-with-parameter-accessibility.src.ts", // babylon parse errors

    /**
     * typescript-eslint-parser erroring, but babylon not.
     */
    // "typescript/basics/arrow-function-with-type-parameters.src.ts" // typescript-eslint-parser parse errors

    /**
     * TypeScript AST differences which need to be resolved
     */
    // "typescript/babylon-convergence/type-parameters.src.ts",
    // "typescript/basics/abstract-class-with-abstract-properties.src.ts",
    // "typescript/basics/abstract-class-with-abstract-readonly-property.src.ts",
    // "typescript/basics/class-with-accessibility-modifiers.src.ts",
    // "typescript/basics/class-with-extends-generic-multiple.src.ts",
    // "typescript/basics/class-with-extends-generic.src.ts",
    // "typescript/basics/class-with-generic-method-default.src.ts",
    // "typescript/basics/class-with-generic-method.src.ts",
    // "typescript/basics/class-with-implements-generic-multiple.src.ts",
    // "typescript/basics/class-with-implements-generic.src.ts",
    // "typescript/basics/class-with-implements.src.ts",
    // "typescript/basics/class-with-mixin.src.ts",
    // "typescript/basics/class-with-optional-computed-property.src.ts",
    // "typescript/basics/class-with-optional-properties.src.ts",
    // "typescript/basics/class-with-optional-property-undefined.src.ts",
    // "typescript/basics/class-with-private-parameter-properties.src.ts",
    // "typescript/basics/class-with-protected-parameter-properties.src.ts",
    // "typescript/basics/class-with-public-parameter-properties.src.ts",
    // "typescript/basics/class-with-readonly-parameter-properties.src.ts",
    // "typescript/basics/class-with-readonly-property.src.ts",
    // "typescript/basics/class-with-type-parameter-default.src.ts",
    // "typescript/basics/class-with-type-parameter-underscore.src.ts",
    // "typescript/basics/class-with-type-parameter.src.ts",
    // "typescript/basics/declare-function.src.ts",
    // "typescript/basics/destructuring-assignment.src.ts",
    // "typescript/basics/export-default-class-with-generic.src.ts",
    // "typescript/basics/export-default-class-with-multiple-generics.src.ts",
    // "typescript/basics/export-named-class-with-generic.src.ts",
    // "typescript/basics/export-named-class-with-multiple-generics.src.ts",
    // "typescript/basics/function-with-object-type-with-optional-properties.src.ts",
    // "typescript/basics/function-with-object-type-without-annotation.src.ts",
    // "typescript/basics/function-with-type-parameters-that-have-comments.src.ts",
    // "typescript/basics/function-with-type-parameters-with-constraint.src.ts",
    // "typescript/basics/function-with-type-parameters.src.ts",
    // "typescript/basics/function-with-types-assignation.src.ts",
    // "typescript/basics/function-with-types.src.ts",
    // "typescript/basics/interface-extends-multiple.src.ts",
    // "typescript/basics/interface-extends.src.ts",
    // "typescript/basics/interface-type-parameters.src.ts",
    // "typescript/basics/interface-with-extends-type-parameters.src.ts",
    // "typescript/basics/interface-with-generic.src.ts",
    // "typescript/basics/interface-with-jsdoc.src.ts",
    // "typescript/basics/interface-with-optional-properties.src.ts",
    // "typescript/basics/interface-without-type-annotation.src.ts",
    // "typescript/basics/nested-type-arguments.src.ts",
    // "typescript/basics/non-null-assertion-operator.src.ts",
    // "typescript/basics/null-and-undefined-type-annotations.src.ts",
    // "typescript/basics/object-with-escaped-properties.src.ts",
    // "typescript/basics/type-alias-declaration-with-constrained-type-parameter.src.ts",
    // "typescript/basics/type-alias-declaration.src.ts",
    // "typescript/basics/type-alias-object-without-annotation.src.ts",
    // "typescript/basics/type-guard.src.ts",
    // "typescript/basics/type-parameters-comments.src.ts",
    // "typescript/basics/typed-this.src.ts",
    // "typescript/basics/var-with-dotted-type.src.ts",
    // "typescript/basics/var-with-type.src.ts",
    // "typescript/basics/variable-declaration-type-annotation-spacing.src.ts",
    // "typescript/decorators/accessor-decorators/accessor-decorator-factory-instance-member.src.ts",
    // "typescript/decorators/accessor-decorators/accessor-decorator-factory-static-member.src.ts",
    // "typescript/decorators/accessor-decorators/accessor-decorator-instance-member.src.ts",
    // "typescript/decorators/accessor-decorators/accessor-decorator-static-member.src.ts",
    // "typescript/decorators/class-decorators/class-decorator-factory.src.ts",
    // "typescript/decorators/class-decorators/class-decorator.src.ts",
    // "typescript/decorators/method-decorators/method-decorator-factory-instance-member.src.ts",
    // "typescript/decorators/method-decorators/method-decorator-factory-static-member.src.ts",
    // "typescript/decorators/method-decorators/method-decorator-instance-member.src.ts",
    // "typescript/decorators/method-decorators/method-decorator-static-member.src.ts",
    // "typescript/decorators/parameter-decorators/parameter-decorator-constructor.src.ts",
    // "typescript/decorators/parameter-decorators/parameter-decorator-decorator-instance-member.src.ts",
    // "typescript/decorators/parameter-decorators/parameter-decorator-decorator-static-member.src.ts",
    // "typescript/decorators/parameter-decorators/parameter-decorator-instance-member.src.ts",
    // "typescript/decorators/parameter-decorators/parameter-decorator-static-member.src.ts",
    // "typescript/decorators/property-decorators/property-decorator-factory-instance-member.src.ts",
    // "typescript/decorators/property-decorators/property-decorator-factory-static-member.src.ts",
    // "typescript/decorators/property-decorators/property-decorator-instance-member.src.ts",
    // "typescript/decorators/property-decorators/property-decorator-static-member.src.ts",
    // "typescript/errorRecovery/interface-empty-extends.src.ts",
    // "typescript/expressions/call-expression-type-arguments.src.ts",
    // "typescript/expressions/new-expression-type-arguments.src.ts",
    // "typescript/namespaces-and-modules/ambient-module-declaration-with-import.src.ts",
    // "typescript/namespaces-and-modules/declare-namespace-with-exported-function.src.ts",
    // "typescript/namespaces-and-modules/module-with-default-exports.src.ts",
    // "typescript/namespaces-and-modules/shorthand-ambient-module-declaration.src.ts"

];

// Either a string of the pattern, or an object containing the pattern and some additional config
const fixturesToTest = [];

fixturePatternsToTest.forEach(fixturePattern => {
    const globPattern = (typeof fixturePattern === "string") ? fixturePattern : fixturePattern.pattern;
    const matchingFixtures = glob.sync(`${fixturesDirPath}/${globPattern}`, {});
    matchingFixtures.forEach(filename => {
        if (typeof fixturePattern === "string") {
            fixturesToTest.push(filename);
        } else {
            fixturesToTest.push({
                filename,
                config: fixturePattern.config
            });
        }
    });
});

/**
 * - Babylon wraps the "Program" node in an extra "File" node, normalize this for simplicity for now...
 * - Remove "start" and "end" values from Babylon nodes to reduce unimportant noise in diffs ("loc" data will still be in
 * each final AST and compared).
 *
 * @param {Object} ast raw babylon AST
 * @returns {Object} processed babylon AST
 */
function preprocessBabylonAST(ast) {
    return parseUtils.omitDeep(ast.program, [
        {
            key: "start",
            predicate(val) {
                // only remove the "start" number (not the "start" object within loc)
                return typeof val === "number";
            }
        },
        {
            key: "end",
            predicate(val) {
                // only remove the "end" number (not the "end" object within loc)
                return typeof val === "number";
            }
        },
        {
            key: "identifierName",
            predicate() {
                return true;
            }
        },
        {
            key: "extra",
            predicate() {
                return true;
            }
        },
        {
            key: "directives",
            predicate() {
                return true;
            }
        },
        {
            key: "directive",
            predicate() {
                return true;
            }
        },
        {
            key: "innerComments",
            predicate() {
                return true;
            }
        },
        {
            key: "leadingComments",
            predicate() {
                return true;
            }
        },
        {
            key: "trailingComments",
            predicate() {
                return true;
            }
        },
        {
            key: "guardedHandlers",
            predicate() {
                return true;
            }
        }
    ]);
}

/**
 * There is currently a really awkward difference in location data for Program nodes
 * between different parsers in the ecosystem. Hack around this by removing the data
 * before comparing the ASTs.
 *
 * See: https://github.com/babel/babylon/issues/673
 *
 * @param {Object} ast the raw AST with a Program node at its top level
 * @returns {Object} the ast with the location data removed from the Program node
 */
function removeLocationDataFromProgramNode(ast) {
    delete ast.loc;
    delete ast.range;
    return ast;
}

fixturesToTest.forEach(fixture => {

    const filename = (typeof fixture === "string") ? fixture : fixture.filename;
    const source = fs.readFileSync(filename, "utf8").replace(/\r\n/g, "\n");

    /**
     * Parse with typescript-eslint-parser
     */
    const typeScriptESLintParserResult = parse(source, {
        parser: "typescript-eslint-parser",
        typeScriptESLintParserOptions: (fixture.config && fixture.config.typeScriptESLintParserOptions) ? fixture.config.typeScriptESLintParserOptions : null
    });

    /**
     * Parse the source with babylon typescript-plugin
     */
    const babylonTypeScriptPluginResult = parse(source, {
        parser: "babylon-plugin-typescript",
        babylonParserOptions: (fixture.config && fixture.config.babylonParserOptions) ? fixture.config.babylonParserOptions : null
    });

    /**
     * If babylon fails to parse the source, ensure that typescript-eslint-parser has the same fundamental issue
     */
    if (babylonTypeScriptPluginResult.parseError) {
        /**
         * FAIL: babylon errored but typescript-eslint-parser did not
         */
        if (!typeScriptESLintParserResult.parseError) {
            test(`TEST FAIL [BABYLON ERRORED, BUT TSEP DID NOT] - ${filename}`, () => {
                expect(typeScriptESLintParserResult.parseError).toEqual(babylonTypeScriptPluginResult.parseError);
            });
            return;
        }
        /**
         * Both parsers errored - this is OK as long as the errors are of the same "type"
         */
        test(`[Both parsers error as expected] - ${filename}`, () => {
            expect(babylonTypeScriptPluginResult.parseError.name).toEqual(typeScriptESLintParserResult.parseError.name);
        });
        return;
    }

    /**
     * FAIL: typescript-eslint-parser errored but babylon did not
     */
    if (typeScriptESLintParserResult.parseError) {
        test(`TEST FAIL [TSEP ERRORED, BUT BABYLON DID NOT] - ${filename}`, () => {
            expect(babylonTypeScriptPluginResult.parseError).toEqual(typeScriptESLintParserResult.parseError);
        });
        return;
    }

    /**
     * No errors, assert the two ASTs match
     */
    test(`${filename}`, () => {
        expect(babylonTypeScriptPluginResult.ast).toBeTruthy();
        expect(typeScriptESLintParserResult.ast).toBeTruthy();
        /**
         * Perform some extra formatting steps on the babylon AST before comparing
         */
        expect(
            removeLocationDataFromProgramNode(
                preprocessBabylonAST(babylonTypeScriptPluginResult.ast)
            )
        ).toEqual(
            removeLocationDataFromProgramNode(typeScriptESLintParserResult.ast)
        );
    });

});
