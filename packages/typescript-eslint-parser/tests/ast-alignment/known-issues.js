"use strict";

/**
 * ==================================================
 * KNOWN/DIAGNOSED ISSUES
 * ==================================================
 */

module.exports = [
    /**
     * "ExperimentalSpreadProperty" in espree/typescript-eslint-parser vs "SpreadElement" in Babylon
     * comes up a lot in this section
     */
    // "ecma-features/experimentalObjectRestSpread/**/*.src.js", // mixture of babylon parse errors and AST diffs

    /* ================================================== */

    /**
     * Template strings seem to also be affected by the difference in opinion between different parsers in:
     * https://github.com/babel/babylon/issues/673
     */
    // "comments/no-comment-template.src.js", // Purely AST diffs
    // "comments/template-string-block.src.js", // Purely AST diffs
    // "ecma-features/templateStrings/**/*.src.js", // mixture of babylon parse errors and AST diffs

    /* ================================================== */

    /**
     * TypeScript, espree and acorn parse this fine - esprima, flow and babylon do not...
     */
    // "ecma-features/forOf/for-of-with-function-initializer.src.js", // babylon parse errors

    /* ================================================== */

    /**
     * TypeScript, flow and babylon parse this fine - esprima, espree and acorn do not...
     */
    // "ecma-features/modules/invalid-export-default.src.js",, // typescript-eslint-parser parse errors

    /* ================================================== */

    /**
     * Babylon parse error because of more strict spec enforcement than other parsers.
     */

    /**
     * super() is being used outside of constructor. Other parsers (e.g. espree, acorn) do not error on this.
     */
    // "ecma-features/classes/class-one-method-super.src.js", // babylon parse errors

    /* ================================================== */

    /**
     * Expected babylon parse errors - all of these files below produce parse errors in espree
     * as well, but the TypeScript compiler is so forgiving during parsing that typescript-eslint-parser
     * does not actually error on them and will produce an AST.
     */
    // "ecma-features/arrowFunctions/error-dup-params.src.js", // babylon parse errors
    // "ecma-features/arrowFunctions/error-dup-params.src.js", // babylon parse errors
    // "ecma-features/arrowFunctions/error-strict-dup-params.src.js", // babylon parse errors
    // "ecma-features/arrowFunctions/error-strict-octal.src.js", // babylon parse errors
    // "ecma-features/arrowFunctions/error-two-lines.src.js", // babylon parse errors
    // "ecma-features/classes/invalid-class-declaration.src.js", // babylon parse errors
    // "ecma-features/classes/invalid-class-setter-declaration.src.js", // babylon parse errors
    // "ecma-features/destructuring/invalid-defaults-object-assign.src.js", // babylon parse errors
    // "ecma-features/destructuring-and-spread/error-complex-destructured-spread-first.src.js", // babylon parse errors
    // "ecma-features/objectLiteralDuplicateProperties/error-proto-property.src.js", // babylon parse errors
    // "ecma-features/objectLiteralDuplicateProperties/error-proto-string-property.src.js", // babylon parse errors
    // "ecma-features/modules/invalid-export-named-default.src.js", // babylon parse errors
    // "ecma-features/modules/invalid-import-default-module-specifier.src.js", // babylon parse errors
    // "ecma-features/modules/invalid-import-module-specifier.src.js", // babylon parse errors
    // "ecma-features/newTarget/invalid-new-target.src.js", // babylon parse errors
    // "ecma-features/newTarget/invalid-unknown-property.src.js", // babylon parse errors
    // "ecma-features/restParams/error-no-default.src.js", // babylon parse errors
    // "ecma-features/restParams/error-not-last.src.js", // babylon parse errors
    /**
     * Deleting local variable in strict mode
     */
    // {
    //     pattern: "ecma-features/modules/error-delete.src.js",
    //     config: { babylonParserOptions: { sourceType: "module" } }
    // },
    /**
     * 'with' in strict mode
     */
    // {
    //     pattern: "ecma-features/modules/error-strict.src.js",
    //     config: { babylonParserOptions: { sourceType: "module" } }
    // },
];
