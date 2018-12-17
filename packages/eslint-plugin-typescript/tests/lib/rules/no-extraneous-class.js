/**
 * @fileoverview Forbids the use of classes as namespaces
 * Some tests adapted from  https://github.com/palantir/tslint/tree/c7fc99b5/test/rules/no-unnecessary-class
 * @author Jed Fox
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/no-extraneous-class"),
    RuleTester = require("eslint").RuleTester;

const empty = { messageId: "empty", type: "Identifier" };
const onlyStatic = { messageId: "onlyStatic", type: "Identifier" };
const onlyConstructor = { messageId: "onlyConstructor", type: "Identifier" };

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
    parser: "typescript-eslint-parser",
});

ruleTester.run("no-extraneous-class", rule, {
    valid: [
        `
class Foo {
    public prop = 1;
    constructor() {}
}
`.trim(),
        `
export class CClass extends BaseClass {
    public static helper(): void {}
    private static privateHelper(): boolean {
        return true;
    }
    constructor() {}
}
`.trim(),
        `
class Foo {
   constructor(
     public bar: string
   ) {}
}
`.trim(),
        {
            code: "class Foo {}",
            options: [{ allowEmpty: true }],
        },
        {
            code: `
class Foo {
    constructor() {}
}
`.trim(),
            options: [{ allowConstructorOnly: true }],
        },
        {
            code: `
export class Bar {
    public static helper(): void {}
    private static privateHelper(): boolean {
        return true;
    }
}
`.trim(),
            options: [{ allowStaticOnly: true }],
        },
    ],

    invalid: [
        {
            code: "class Foo {}",
            errors: [empty],
        },
        {
            code: `
class Foo {
    public prop = 1;
    constructor() {
        class Bar {
            static PROP = 2;
        }
    }
}
export class Bar {
    public static helper(): void {}
    private static privateHelper(): boolean {
        return true;
    }
}
`.trim(),
            errors: [onlyStatic, onlyStatic],
        },
        {
            code: `
class Foo {
    constructor() {}
}
`.trim(),
            errors: [onlyConstructor],
        },
        {
            code: `
export class AClass {
    public static helper(): void {}
    private static privateHelper(): boolean {
        return true;
    }
    constructor() {
        class nestedClass {
        }
    }
}

`.trim(),
            errors: [onlyStatic, empty],
        },
    ],
});
