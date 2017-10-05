/**
 * @fileoverview disallow generic `Array` constructors
 * @author Jed Fox
 * @author Matt DuVall <http://www.mattduvall.com/>
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/no-array-constructor"),
    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
    parser: "typescript-eslint-parser"
});

const message = "The array literal notation [] is preferrable.";

ruleTester.run("no-array-constructor", rule, {
    valid: [
        "new Array(x)",
        "Array(x)",
        "new Array(9)",
        "Array(9)",
        "new foo.Array()",
        "foo.Array()",
        "new Array.foo",
        "Array.foo()",

        // TypeScript
        "new Array<Foo>(1, 2, 3)",
        "new Array<Foo>()",
        "Array<Foo>(1, 2, 3)",
        "Array<Foo>()"
    ],

    invalid: [
        {
            code: "new Array()",
            output: "[]",
            errors: [{ message, type: "NewExpression" }]
        },
        {
            code: "Array()",
            output: "[]",
            errors: [{ message, type: "CallExpression" }]
        },
        {
            code: "new Array",
            output: "[]",
            errors: [{ message, type: "NewExpression" }]
        },
        {
            code: "new Array(x, y)",
            output: "[x, y]",
            errors: [{ message, type: "NewExpression" }]
        },
        {
            code: "Array(x, y)",
            output: "[x, y]",
            errors: [{ message, type: "CallExpression" }]
        },
        {
            code: "new Array(0, 1, 2)",
            output: "[0, 1, 2]",
            errors: [{ message, type: "NewExpression" }]
        },
        {
            code: "Array(0, 1, 2)",
            output: "[0, 1, 2]",
            errors: [{ message, type: "CallExpression" }]
        },
        {
            code: `new Array(
                0,
                1,
                2
            )`,
            output: `[
                0,
                1,
                2
            ]`,
            errors: [{ message, type: "NewExpression" }]
        }
    ]
});
