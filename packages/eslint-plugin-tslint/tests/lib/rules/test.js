/**
 * @fileoverview TSLint wrapper plugin for ESLint
 * @author James Henry
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/index").rules.config
const RuleTester = require("eslint").RuleTester

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester()

const parserOptions = {
    ecmaVersion: 6,
    sourceType: "module",
    ecmaFeatures: {}
}

const tslintConfig = {
    "rules": {
        "semicolon": [true, "always"]
    },
}

ruleTester.run("tslint/config", rule, {

    valid: [
        {
            code: "var foo = true;",
            parser: "typescript-eslint-parser",
            parserOptions,
            options: [tslintConfig],
        },
    ],

    invalid: [
        {
            code: "var foo = true",
            parser: "typescript-eslint-parser",
            parserOptions,
            options: [tslintConfig],
            output: "var foo = true",
            errors: [{
                message: "Missing semicolon",
                line: 1,
                column: 15
            }]
        },
    ]

})
