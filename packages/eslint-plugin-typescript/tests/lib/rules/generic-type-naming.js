"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/generic-type-naming"),
    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
    parser: "typescript-eslint-parser",
});

ruleTester.run("generic-type-naming", rule, {
    valid: [
        { code: "class<T,U,V> { }", options: [] },
        { code: "type ReadOnly<T extends object> = {}", options: [] },
        { code: "interface SimpleMap<V> { }", options: [] },
        { code: "function get<T>() {}", options: [] },
        { code: "interface GenericIdentityFn { <T>(arg: T): T }", options: [] },
        { code: "class<x> { }", options: ["^x+$"] },
        {
            code: "class CounterContainer extends Container<Counter> { }",
            options: ["^T$"],
        },
    ],
    invalid: [
        {
            code: "class<x> { }",
            options: ["^[A-Z]+$"],
            errors: [
                {
                    messageId: "paramNotMatchRule",
                    data: { name: "x", rule: "^[A-Z]+$" },
                },
            ],
        },
        {
            code: "interface SimpleMap<x> { }",
            options: ["^[A-Z]+$"],
            errors: [
                {
                    messageId: "paramNotMatchRule",
                    data: { name: "x", rule: "^[A-Z]+$" },
                },
            ],
        },
        {
            code: "type R<x> = {}",
            options: ["^[A-Z]+$"],
            errors: [
                {
                    messageId: "paramNotMatchRule",
                    data: { name: "x", rule: "^[A-Z]+$" },
                },
            ],
        },
        {
            code: "function get<x>() {}",
            options: ["^[A-Z]+$"],
            errors: [
                {
                    messageId: "paramNotMatchRule",
                    data: { name: "x", rule: "^[A-Z]+$" },
                },
            ],
        },
        {
            code: "interface GenericIdentityFn { <x>(arg: x): x }",
            options: ["^[A-Z]+$"],
            errors: [
                {
                    messageId: "paramNotMatchRule",
                    data: { name: "x", rule: "^[A-Z]+$" },
                },
            ],
        },
    ],
});
