/**
 * @fileoverview Requires using either `T[]` or `Array<T>` for arrays.
 * @author Mackie Underdown
 * @author Armano <https://github.com/armano2>
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/array-type"),
    eslint = require("eslint"),
    assert = require("assert");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new eslint.RuleTester({
    parser: "typescript-eslint-parser",
});

ruleTester.run("array-type", rule, {
    valid: [
        {
            code: "let a = []",
            options: ["array"],
        },
        {
            code: "let a = new Array()",
            options: ["array"],
        },
        {
            code: "let a: string[] = []",
            options: ["array"],
        },
        {
            code: "let a: (string | number)[] = []",
            options: ["array"],
        },
        {
            code: "let a: ({ foo: Bar[] })[] = []",
            options: ["array"],
        },
        {
            code: "let a: Array<string> = []",
            options: ["generic"],
        },
        {
            code: "let a: Array<string| number> = []",
            options: ["generic"],
        },
        {
            code: "let a: Array<{ foo: Array<Bar> }> = []",
            options: ["generic"],
        },
        {
            code: `function foo (a: Array<Bar>): Array<Bar> {}`,
            options: ["generic"],
        },
        {
            code: `let yy: number[][] = [[4, 5], [6]];`,
            options: ["array-simple"],
        },
        {
            code: `function fooFunction(foo: Array<ArrayClass<string>>) {
    return foo.map(e => e.foo);
}`,
            options: ["array-simple"],
        },
        {
            code: `function bazFunction(baz: Arr<ArrayClass<String>>) {
    return baz.map(e => e.baz);
}`,
            options: ["array-simple"],
        },
        {
            code: `let fooVar: Array<(c: number) => number>;`,
            options: ["array-simple"],
        },
        {
            code: `type fooUnion = Array<string|number|boolean>;`,
            options: ["array-simple"],
        },
        {
            code: `type fooIntersection = Array<string & number>;`,
            options: ["array-simple"],
        },
        {
            code: `namespace fooName {
    type BarType = { bar: string };
    type BazType<T> = Arr<T>;
}`,
            options: ["array-simple"],
        },
        {
            code: `interface FooInterface {
    '.bar': {baz: string[];};
}`,
            options: ["array-simple"],
        },
        {
            code: `let yy: number[][] = [[4, 5], [6]];`,
            options: ["array"],
        },
        {
            code: `let ya = [[1, "2"]] as[number, string][];`,
            options: ["array"],
        },
        {
            code: `function barFunction(bar: ArrayClass<String>[]) {
    return bar.map(e => e.bar);
}`,
            options: ["array"],
        },
        {
            code: `function bazFunction(baz: Arr<ArrayClass<String>>) {
    return baz.map(e => e.baz);
}`,
            options: ["array"],
        },
        {
            code: `let barVar: ((c: number) => number)[];`,
            options: ["array"],
        },
        {
            code: `type barUnion = (string|number|boolean)[];`,
            options: ["array"],
        },
        {
            code: `type barIntersection = (string & number)[];`,
            options: ["array"],
        },
        {
            code: `interface FooInterface {
    '.bar': {baz: string[];};
}`,
            options: ["array"],
        },
        {
            code: `let z: Array = [3, "4"];`,
            options: ["generic"],
        },
        {
            code: `let xx: Array<Array<number>> = [[1, 2], [3]];`,
            options: ["generic"],
        },
        {
            code: `type Arr<T> = Array<T>;`,
            options: ["generic"],
        },
        {
            code: `function fooFunction(foo: Array<ArrayClass<string>>) {
    return foo.map(e => e.foo);
}`,
            options: ["generic"],
        },
        {
            code: `function bazFunction(baz: Arr<ArrayClass<String>>) {
    return baz.map(e => e.baz);
}`,
            options: ["generic"],
        },
        {
            code: `let fooVar: Array<(c: number) => number>;`,
            options: ["generic"],
        },
        {
            code: `type fooUnion = Array<string|number|boolean>;`,
            options: ["generic"],
        },
        {
            code: `type fooIntersection = Array<string & number>;`,
            options: ["generic"],
        },
    ],
    invalid: [
        {
            code: "let a: Array<string> = []",
            output: "let a: string[] = []",
            options: ["array"],
            errors: [
                {
                    messageId: "errorStringArray",
                    data: { type: "string" },
                    line: 1,
                    column: 8,
                },
            ],
        },
        {
            code: "let a: Array<string | number> = []",
            output: "let a: (string | number)[] = []",
            options: ["array"],
            errors: [
                {
                    messageId: "errorStringArray",
                    data: { type: "T" },
                    line: 1,
                    column: 8,
                },
            ],
        },
        {
            code: "let a: ({ foo: Array<Bar> })[] = []",
            output: "let a: ({ foo: Bar[] })[] = []",
            options: ["array"],
            errors: [
                {
                    messageId: "errorStringArray",
                    data: { type: "Bar" },
                    line: 1,
                    column: 16,
                },
            ],
        },
        {
            code: "let a: string[] = []",
            output: "let a: Array<string> = []",
            options: ["generic"],
            errors: [
                {
                    messageId: "errorStringGeneric",
                    data: { type: "string" },
                    line: 1,
                    column: 8,
                },
            ],
        },
        {
            code: "let a: (string | number)[] = []",
            output: "let a: Array<string | number> = []",
            options: ["generic"],
            errors: [
                {
                    messageId: "errorStringGeneric",
                    data: { type: "T" },
                    line: 1,
                    column: 8,
                },
            ],
        },
        {
            code: "let a: Array<{ foo: Bar[] }> = []",
            output: "let a: Array<{ foo: Array<Bar> }> = []",
            options: ["generic"],
            errors: [
                {
                    messageId: "errorStringGeneric",
                    data: { type: "Bar" },
                    line: 1,
                    column: 21,
                },
            ],
        },
        {
            code: "let a: Array<{ foo: Foo | Bar[] }> = []",
            output: "let a: Array<{ foo: Foo | Array<Bar> }> = []",
            options: ["generic"],
            errors: [
                {
                    messageId: "errorStringGeneric",
                    data: { type: "Bar" },
                    line: 1,
                    column: 27,
                },
            ],
        },
        {
            code: "function foo (a: Array<Bar>): Array<Bar> {}",
            output: "function foo (a: Bar[]): Bar[] {}",
            errors: [
                {
                    messageId: "errorStringArray",
                    data: { type: "Bar" },
                    line: 1,
                    column: 18,
                },
                {
                    messageId: "errorStringArray",
                    data: { type: "Bar" },
                    line: 1,
                    column: 31,
                },
            ],
        },
        {
            code: `let x: Array<undefined> = [undefined] as undefined[];`,
            output: `let x: undefined[] = [undefined] as undefined[];`,
            options: ["array-simple"],
            errors: [
                {
                    messageId: "errorStringArraySimple",
                    data: { type: "undefined" },
                    line: 1,
                    column: 8,
                },
            ],
        },
        {
            code: `let xx: Array<object> = [];`,
            output: `let xx: object[] = [];`,
            options: ["array-simple"],
            errors: [
                {
                    messageId: "errorStringArraySimple",
                    data: { type: "object" },
                    line: 1,
                    column: 9,
                },
            ],
        },
        {
            code: `let y: string[] = <Array<string>>["2"];`,
            output: `let y: string[] = <string[]>["2"];`,
            options: ["array-simple"],
            errors: [
                {
                    messageId: "errorStringArraySimple",
                    data: { type: "string" },
                    line: 1,
                    column: 20,
                },
            ],
        },
        {
            code: `let z: Array = [3, "4"];`,
            output: `let z: any[] = [3, "4"];`,
            options: ["array-simple"],
            errors: [
                {
                    messageId: "errorStringArraySimple",
                    data: { type: "any" },
                    line: 1,
                    column: 8,
                },
            ],
        },
        {
            code: `let ya = [[1, "2"]] as[number, string][];`,
            output: `let ya = [[1, "2"]] as Array<[number, string]>;`,
            options: ["array-simple"],
            errors: [
                {
                    messageId: "errorStringGenericSimple",
                    data: { type: "T" },
                    line: 1,
                    column: 23,
                },
            ],
        },
        {
            code: `type Arr<T> = Array<T>;`,
            output: `type Arr<T> = T[];`,
            options: ["array-simple"],
            errors: [
                {
                    messageId: "errorStringArraySimple",
                    data: { type: "T" },
                    line: 1,
                    column: 15,
                },
            ],
        },
        {
            code: `// Ignore user defined aliases
let yyyy: Arr<Array<Arr<string>>[]> = [[[["2"]]]];`,
            output: `// Ignore user defined aliases
let yyyy: Arr<Array<Array<Arr<string>>>> = [[[["2"]]]];`,
            options: ["array-simple"],
            errors: [
                {
                    messageId: "errorStringGenericSimple",
                    data: { type: "T" },
                    line: 2,
                    column: 15,
                },
            ],
        },
        {
            code: `interface ArrayClass<T> {
    foo: Array<T>;
    bar: T[];
    baz: Arr<T>;
    xyz: this[];
}`,
            output: `interface ArrayClass<T> {
    foo: T[];
    bar: T[];
    baz: Arr<T>;
    xyz: this[];
}`,
            options: ["array-simple"],
            errors: [
                {
                    messageId: "errorStringArraySimple",
                    data: { type: "T" },
                    line: 2,
                    column: 10,
                },
            ],
        },
        {
            code: `function barFunction(bar: ArrayClass<String>[]) {
    return bar.map(e => e.bar);
}`,
            output: `function barFunction(bar: Array<ArrayClass<String>>) {
    return bar.map(e => e.bar);
}`,
            options: ["array-simple"],
            errors: [
                {
                    messageId: "errorStringGenericSimple",
                    data: { type: "T" },
                    line: 1,
                    column: 27,
                },
            ],
        },
        {
            code: `let barVar: ((c: number) => number)[];`,
            output: `let barVar: Array<(c: number) => number>;`,
            options: ["array-simple"],
            errors: [
                {
                    messageId: "errorStringGenericSimple",
                    data: { type: "T" },
                    line: 1,
                    column: 13,
                },
            ],
        },
        {
            code: `type barUnion = (string|number|boolean)[];`,
            output: `type barUnion = Array<string|number|boolean>;`,
            options: ["array-simple"],
            errors: [
                {
                    messageId: "errorStringGenericSimple",
                    data: { type: "T" },
                    line: 1,
                    column: 17,
                },
            ],
        },
        {
            code: `type barIntersection = (string & number)[];`,
            output: `type barIntersection = Array<string & number>;`,
            options: ["array-simple"],
            errors: [
                {
                    messageId: "errorStringGenericSimple",
                    data: { type: "T" },
                    line: 1,
                    column: 24,
                },
            ],
        },
        {
            code: `let v: Array<fooName.BarType> = [{ bar: "bar" }];`,
            output: `let v: fooName.BarType[] = [{ bar: "bar" }];`,
            options: ["array-simple"],
            errors: [
                {
                    messageId: "errorStringArraySimple",
                    data: { type: "fooName.BarType" },
                    line: 1,
                    column: 8,
                },
            ],
        },
        {
            code: `let w: fooName.BazType<string>[] = [["baz"]];`,
            output: `let w: Array<fooName.BazType<string>> = [["baz"]];`,
            options: ["array-simple"],
            errors: [
                {
                    messageId: "errorStringGenericSimple",
                    data: { type: "T" },
                    line: 1,
                    column: 8,
                },
            ],
        },
        {
            code: `let x: Array<undefined> = [undefined] as undefined[];`,
            output: `let x: undefined[] = [undefined] as undefined[];`,
            options: ["array"],
            errors: [
                {
                    messageId: "errorStringArray",
                    data: { type: "undefined" },
                    line: 1,
                    column: 8,
                },
            ],
        },
        {
            code: `let y: string[] = <Array<string>>["2"];`,
            output: `let y: string[] = <string[]>["2"];`,
            options: ["array"],
            errors: [
                {
                    messageId: "errorStringArray",
                    data: { type: "string" },
                    line: 1,
                    column: 20,
                },
            ],
        },
        {
            code: `let z: Array = [3, "4"];`,
            output: `let z: any[] = [3, "4"];`,
            options: ["array"],
            errors: [
                {
                    messageId: "errorStringArray",
                    data: { type: "any" },
                    line: 1,
                    column: 8,
                },
            ],
        },
        {
            code: `type Arr<T> = Array<T>;`,
            output: `type Arr<T> = T[];`,
            options: ["array"],
            errors: [
                {
                    messageId: "errorStringArray",
                    data: { type: "T" },
                    line: 1,
                    column: 15,
                },
            ],
        },
        {
            code: `// Ignore user defined aliases
let yyyy: Arr<Array<Arr<string>>[]> = [[[["2"]]]];`,
            output: `// Ignore user defined aliases
let yyyy: Arr<Arr<string>[][]> = [[[["2"]]]];`,
            options: ["array"],
            errors: [
                {
                    messageId: "errorStringArray",
                    data: { type: "T" },
                    line: 2,
                    column: 15,
                },
            ],
        },
        {
            code: `interface ArrayClass<T> {
    foo: Array<T>;
    bar: T[];
    baz: Arr<T>;
}`,
            output: `interface ArrayClass<T> {
    foo: T[];
    bar: T[];
    baz: Arr<T>;
}`,
            options: ["array"],
            errors: [
                {
                    messageId: "errorStringArray",
                    data: { type: "T" },
                    line: 2,
                    column: 10,
                },
            ],
        },
        {
            code: `function fooFunction(foo: Array<ArrayClass<string>>) {
    return foo.map(e => e.foo);
}`,
            output: `function fooFunction(foo: ArrayClass<string>[]) {
    return foo.map(e => e.foo);
}`,
            options: ["array"],
            errors: [
                {
                    messageId: "errorStringArray",
                    data: { type: "T" },
                    line: 1,
                    column: 27,
                },
            ],
        },
        {
            code: `let fooVar: Array<(c: number) => number>;`,
            output: `let fooVar: ((c: number) => number)[];`,
            options: ["array"],
            errors: [
                {
                    messageId: "errorStringArray",
                    data: { type: "T" },
                    line: 1,
                    column: 13,
                },
            ],
        },
        {
            code: `type fooUnion = Array<string|number|boolean>;`,
            output: `type fooUnion = (string|number|boolean)[];`,
            options: ["array"],
            errors: [
                {
                    messageId: "errorStringArray",
                    data: { type: "T" },
                    line: 1,
                    column: 17,
                },
            ],
        },
        {
            code: `type fooIntersection = Array<string & number>;`,
            output: `type fooIntersection = (string & number)[];`,
            options: ["array"],
            errors: [
                {
                    messageId: "errorStringArray",
                    data: { type: "T" },
                    line: 1,
                    column: 24,
                },
            ],
        },
        {
            code: `let x: Array<number> = [1] as number[];`,
            output: `let x: Array<number> = [1] as Array<number>;`,
            options: ["generic"],
            errors: [
                {
                    messageId: "errorStringGeneric",
                    data: { type: "number" },
                    line: 1,
                    column: 31,
                },
            ],
        },
        {
            code: `let y: string[] = <Array<string>>["2"];`,
            output: `let y: Array<string> = <Array<string>>["2"];`,
            options: ["generic"],
            errors: [
                {
                    messageId: "errorStringGeneric",
                    data: { type: "string" },
                    line: 1,
                    column: 8,
                },
            ],
        },
        {
            code: `let ya = [[1, "2"]] as[number, string][];`,
            output: `let ya = [[1, "2"]] as Array<[number, string]>;`,
            options: ["generic"],
            errors: [
                {
                    messageId: "errorStringGeneric",
                    data: { type: "T" },
                    line: 1,
                    column: 23,
                },
            ],
        },
        {
            code: `// Ignore user defined aliases
let yyyy: Arr<Array<Arr<string>>[]> = [[[["2"]]]];`,
            output: `// Ignore user defined aliases
let yyyy: Arr<Array<Array<Arr<string>>>> = [[[["2"]]]];`,
            options: ["generic"],
            errors: [
                {
                    messageId: "errorStringGeneric",
                    data: { type: "T" },
                    line: 2,
                    column: 15,
                },
            ],
        },
        {
            code: `interface ArrayClass<T> {
    foo: Array<T>;
    bar: T[];
    baz: Arr<T>;
}`,
            output: `interface ArrayClass<T> {
    foo: Array<T>;
    bar: Array<T>;
    baz: Arr<T>;
}`,
            options: ["generic"],
            errors: [
                {
                    messageId: "errorStringGeneric",
                    data: { type: "T" },
                    line: 3,
                    column: 10,
                },
            ],
        },
        {
            code: `function barFunction(bar: ArrayClass<String>[]) {
    return bar.map(e => e.bar);
}`,
            output: `function barFunction(bar: Array<ArrayClass<String>>) {
    return bar.map(e => e.bar);
}`,
            options: ["generic"],
            errors: [
                {
                    messageId: "errorStringGeneric",
                    data: { type: "T" },
                    line: 1,
                    column: 27,
                },
            ],
        },
        {
            code: `let barVar: ((c: number) => number)[];`,
            output: `let barVar: Array<(c: number) => number>;`,
            options: ["generic"],
            errors: [
                {
                    messageId: "errorStringGeneric",
                    data: { type: "T" },
                    line: 1,
                    column: 13,
                },
            ],
        },
        {
            code: `type barUnion = (string|number|boolean)[];`,
            output: `type barUnion = Array<string|number|boolean>;`,
            options: ["generic"],
            errors: [
                {
                    messageId: "errorStringGeneric",
                    data: { type: "T" },
                    line: 1,
                    column: 17,
                },
            ],
        },
        {
            code: `type barIntersection = (string & number)[];`,
            output: `type barIntersection = Array<string & number>;`,
            options: ["generic"],
            errors: [
                {
                    messageId: "errorStringGeneric",
                    data: { type: "T" },
                    line: 1,
                    column: 24,
                },
            ],
        },
        {
            code: `interface FooInterface {
    '.bar': {baz: string[];};
}`,
            output: `interface FooInterface {
    '.bar': {baz: Array<string>;};
}`,
            options: ["generic"],
            errors: [
                {
                    messageId: "errorStringGeneric",
                    data: { type: "string" },
                    line: 2,
                    column: 19,
                },
            ],
        },
    ],
});

// eslint rule tester is not working with multi-pass
// https://github.com/eslint/eslint/issues/11187
describe("array-type (nested)", () => {
    it("should fix correctly", () => {
        // eslint-disable-next-line require-jsdoc
        function testOutput(option, code, output) {
            const linter = new eslint.Linter();

            linter.defineRule("array-type", Object.assign({}, rule));
            const result = linter.verifyAndFix(
                code,
                {
                    rules: {
                        "array-type": [2, option],
                    },
                    parser: "typescript-eslint-parser",
                },
                {
                    fix: true,
                }
            );

            assert.strictEqual(output, result.output);
        }

        testOutput(
            "array",
            "let a: ({ foo: Array<Array<Bar> | Array<any>> })[] = []",
            "let a: ({ foo: (Bar[] | any[])[] })[] = []"
        );
        testOutput(
            "array",
            `
                class Foo<T = Array<Array<Bar>>> extends Bar<T, Array<T>> implements Baz<Array<T>> {
                    private s: Array<T>

                    constructor (p: Array<T>) {
                        return new Array()
                    }
                }
            `,
            `
                class Foo<T = Bar[][]> extends Bar<T, T[]> implements Baz<T[]> {
                    private s: T[]

                    constructor (p: T[]) {
                        return new Array()
                    }
                }
            `
        );
        testOutput(
            "array-simple",
            `let xx: Array<Array<number>> = [[1, 2], [3]];`,
            `let xx: number[][] = [[1, 2], [3]];`
        );
        testOutput(
            "array",
            `let xx: Array<Array<number>> = [[1, 2], [3]];`,
            `let xx: number[][] = [[1, 2], [3]];`
        );
        testOutput(
            "generic",
            `let yy: number[][] = [[4, 5], [6]];`,
            `let yy: Array<Array<number>> = [[4, 5], [6]];`
        );
    });
});
