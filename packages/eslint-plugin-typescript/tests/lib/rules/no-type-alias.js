/**
 * @fileoverview Disallows the use of type aliases.
 * @author Patricio Trevino
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/no-type-alias"),
    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
    parser: "typescript-eslint-parser",
});

ruleTester.run("no-type-alias", rule, {
    valid: [
        {
            code: "type Foo = 'a';",
            options: [{ allowAliases: "always" }],
        },
        {
            code: "type Foo = 'a' | 'b';",
            options: [{ allowAliases: "always" }],
        },
        {
            code: "type Foo = 'a' | 'b';",
            options: [{ allowAliases: "in-unions-and-intersections" }],
        },
        {
            code: "type Foo = 'a' | 'b';",
            options: [{ allowAliases: "in-unions" }],
        },
        {
            code: "type Foo = 'a' | 'b' | 'c';",
            options: [{ allowAliases: "always" }],
        },
        {
            code: "type Foo = 'a' | 'b' | 'c';",
            options: [{ allowAliases: "in-unions-and-intersections" }],
        },
        {
            code: "type Foo = 'a' | 'b' | 'c';",
            options: [{ allowAliases: "in-unions" }],
        },
        {
            code: "type Foo = 'a' & 'b';",
            options: [{ allowAliases: "always" }],
        },
        {
            code: "type Foo = 'a' & 'b';",
            options: [{ allowAliases: "in-unions-and-intersections" }],
        },
        {
            code: "type Foo = 'a' & 'b';",
            options: [{ allowAliases: "in-intersections" }],
        },
        {
            code: "type Foo = 'a' & 'b' & 'c';",
            options: [{ allowAliases: "always" }],
        },
        {
            code: "type Foo = 'a' & 'b' & 'c';",
            options: [{ allowAliases: "in-unions-and-intersections" }],
        },
        {
            code: "type Foo = 'a' & 'b' & 'c';",
            options: [{ allowAliases: "in-intersections" }],
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            options: [{ allowAliases: "always" }],
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            options: [{ allowAliases: "in-unions-and-intersections" }],
        },
        {
            code: "type Foo = 1;",
            options: [{ allowAliases: "always" }],
        },
        {
            code: "type Foo = 1 | 2;",
            options: [{ allowAliases: "always" }],
        },
        {
            code: "type Foo = 1 | 2;",
            options: [{ allowAliases: "in-unions-and-intersections" }],
        },
        {
            code: "type Foo = 1 | 2;",
            options: [{ allowAliases: "in-unions" }],
        },
        {
            code: "type Foo = 1 | 2 | 3;",
            options: [{ allowAliases: "always" }],
        },
        {
            code: "type Foo = 1 | 2 | 3;",
            options: [{ allowAliases: "in-unions-and-intersections" }],
        },
        {
            code: "type Foo = 1 | 2 | 3;",
            options: [{ allowAliases: "in-unions" }],
        },
        {
            code: "type Foo = 1 & 2;",
            options: [{ allowAliases: "always" }],
        },
        {
            code: "type Foo = 1 & 2;",
            options: [{ allowAliases: "in-unions-and-intersections" }],
        },
        {
            code: "type Foo = 1 & 2;",
            options: [{ allowAliases: "in-intersections" }],
        },
        {
            code: "type Foo = 1 & 2 & 3;",
            options: [{ allowAliases: "always" }],
        },
        {
            code: "type Foo = 1 & 2 & 3;",
            options: [{ allowAliases: "in-unions-and-intersections" }],
        },
        {
            code: "type Foo = 1 & 2 & 3;",
            options: [{ allowAliases: "in-intersections" }],
        },
        {
            code: "type Foo = 1 | 2 & 3;",
            options: [{ allowAliases: "always" }],
        },
        {
            code: "type Foo = 1 | 2 & 3;",
            options: [{ allowAliases: "in-unions-and-intersections" }],
        },
        {
            code: "type Foo = true;",
            options: [{ allowAliases: "always" }],
        },
        {
            code: "type Foo = true | false;",
            options: [{ allowAliases: "always" }],
        },
        {
            code: "type Foo = true | false;",
            options: [{ allowAliases: "in-unions-and-intersections" }],
        },
        {
            code: "type Foo = true | false;",
            options: [{ allowAliases: "in-unions" }],
        },
        {
            code: "type Foo = true & false;",
            options: [{ allowAliases: "always" }],
        },
        {
            code: "type Foo = true & false;",
            options: [{ allowAliases: "in-unions-and-intersections" }],
        },
        {
            code: "type Foo = true & false;",
            options: [{ allowAliases: "in-intersections" }],
        },
        {
            code: `
interface Bar {}
type Foo = Bar | string;
            `,
            options: [{ allowAliases: "always" }],
        },
        {
            code: `
interface Bar {}
type Foo = Bar | string;
            `,
            options: [{ allowAliases: "in-unions-and-intersections" }],
        },
        {
            code: `
interface Bar {}
type Foo = Bar | string;
            `,
            options: [{ allowAliases: "in-unions" }],
        },
        {
            code: `
interface Bar {}
type Foo = Bar & string;
            `,
            options: [{ allowAliases: "always" }],
        },
        {
            code: `
interface Bar {}
type Foo = Bar & string;
            `,
            options: [{ allowAliases: "in-unions-and-intersections" }],
        },
        {
            code: `
interface Bar {}
type Foo = Bar & string;
            `,
            options: [{ allowAliases: "in-intersections" }],
        },
        {
            code: "type Foo = string;",
            options: [{ allowAliases: "always" }],
        },
        {
            code: "type Foo = string | string[];",
            options: [{ allowAliases: "always" }],
        },
        {
            code: "type Foo = string | string[];",
            options: [{ allowAliases: "in-unions-and-intersections" }],
        },
        {
            code: "type Foo = string | string[];",
            options: [{ allowAliases: "in-unions" }],
        },
        {
            code: "type Foo = string | string[] | number;",
            options: [{ allowAliases: "always" }],
        },
        {
            code: "type Foo = string | string[] | number;",
            options: [{ allowAliases: "in-unions-and-intersections" }],
        },
        {
            code: "type Foo = string | string[] | number;",
            options: [{ allowAliases: "in-unions" }],
        },
        {
            code: "type Foo = string & string[];",
            options: [{ allowAliases: "always" }],
        },
        {
            code: "type Foo = string & string[];",
            options: [{ allowAliases: "in-unions-and-intersections" }],
        },
        {
            code: "type Foo = string & string[];",
            options: [{ allowAliases: "in-intersections" }],
        },
        {
            code: "type Foo = string & string[] & number;",
            options: [{ allowAliases: "always" }],
        },
        {
            code: "type Foo = string & string[] & number;",
            options: [{ allowAliases: "in-unions-and-intersections" }],
        },
        {
            code: "type Foo = string & string[] & number;",
            options: [{ allowAliases: "in-intersections" }],
        },
        {
            code: "type Foo = () => void;",
            options: [{ allowCallbacks: "always" }],
        },
        {
            code: "type Foo = () => void | string;",
            options: [{ allowCallbacks: "always" }],
        },
        {
            code: "type Foo = {};",
            options: [{ allowLiterals: "always" }],
        },
        {
            code: "type Foo = {} | {};",
            options: [{ allowLiterals: "always" }],
        },
        {
            code: "type Foo = {} | {};",
            options: [{ allowLiterals: "in-unions-and-intersections" }],
        },
        {
            code: "type Foo = {} | {};",
            options: [{ allowLiterals: "in-unions" }],
        },
        {
            code: "type Foo = {} & {};",
            options: [{ allowLiterals: "always" }],
        },
        {
            code: "type Foo = {} & {};",
            options: [{ allowLiterals: "in-unions-and-intersections" }],
        },
        {
            code: "type Foo = {} & {};",
            options: [{ allowLiterals: "in-intersections" }],
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "always" }],
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} | {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "always" }],
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} | {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "in-unions-and-intersections" }],
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} | {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "in-unions" }],
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} & {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "always" }],
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} & {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "in-unions-and-intersections" }],
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} & {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "in-intersections" }],
        },
        {
            code: `export type ClassValue = string | number | ClassDictionary | ClassArray | undefined | null | false;`,
            options: [
                {
                    allowAliases: "in-unions-and-intersections",
                    allowCallbacks: "always",
                    allowLiterals: "in-unions-and-intersections",
                    allowMappedTypes: "in-unions-and-intersections",
                },
            ],
        },
    ],
    invalid: [
        {
            code: "type Foo = 'a'",
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "aliases",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: "type Foo = 'a'",
            options: [{ allowAliases: "never" }],
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "aliases",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: "type Foo = 'a' | 'b';",
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 18,
                },
            ],
        },
        {
            code: "type Foo = 'a' | 'b';",
            options: [{ allowLiterals: "in-unions" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 18,
                },
            ],
        },
        {
            code: "type Foo = 'a' | 'b';",
            options: [{ allowAliases: "never" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 18,
                },
            ],
        },
        {
            code: "type Foo = 'a' | 'b';",
            options: [{ allowAliases: "never", allowLiterals: "in-unions" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 18,
                },
            ],
        },
        {
            code: "type Foo = 'a' | 'b';",
            options: [
                {
                    allowAliases: "in-intersections",
                    allowLiterals: "in-unions",
                },
            ],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 18,
                },
            ],
        },
        {
            code: "type Foo = 'a' | 'b' | 'c';",
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 18,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 24,
                },
            ],
        },
        {
            code: "type Foo = 'a' | 'b' | 'c';",
            options: [{ allowLiterals: "in-unions" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 18,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 24,
                },
            ],
        },
        {
            code: "type Foo = 'a' | 'b' | 'c';",
            options: [{ allowAliases: "never" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 18,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 24,
                },
            ],
        },
        {
            code: "type Foo = 'a' | 'b' | 'c';",
            options: [{ allowAliases: "never", allowLiterals: "in-unions" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 18,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 24,
                },
            ],
        },
        {
            code: "type Foo = 'a' | 'b' | 'c';",
            options: [{ allowAliases: "in-intersections" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 18,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 24,
                },
            ],
        },
        {
            code: "type Foo = 'a' | 'b' | 'c';",
            options: [
                {
                    allowAliases: "in-intersections",
                    allowLiterals: "in-unions",
                },
            ],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 18,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 24,
                },
            ],
        },
        {
            code: "type Foo = 'a' & 'b';",
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 18,
                },
            ],
        },
        {
            code: "type Foo = 'a' & 'b';",
            options: [{ allowLiterals: "in-intersections" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 18,
                },
            ],
        },
        {
            code: "type Foo = 'a' & 'b';",
            options: [{ allowAliases: "never" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 18,
                },
            ],
        },
        {
            code: "type Foo = 'a' & 'b';",
            options: [
                { allowAliases: "never", allowLiterals: "in-intersections" },
            ],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 18,
                },
            ],
        },
        {
            code: "type Foo = 'a' & 'b';",
            options: [{ allowAliases: "in-unions" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 18,
                },
            ],
        },
        {
            code: "type Foo = 'a' & 'b';",
            options: [
                {
                    allowAliases: "in-unions",
                    allowLiterals: "in-intersections",
                },
            ],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 18,
                },
            ],
        },
        {
            code: "type Foo = 'a' & 'b' & 'c';",
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 18,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 24,
                },
            ],
        },
        {
            code: "type Foo = 'a' & 'b' & 'c';",
            options: [{ allowLiterals: "in-intersections" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 18,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 24,
                },
            ],
        },
        {
            code: "type Foo = 'a' & 'b' & 'c';",
            options: [{ allowAliases: "never" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 18,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 24,
                },
            ],
        },
        {
            code: "type Foo = 'a' & 'b' & 'c';",
            options: [
                { allowAliases: "never", allowLiterals: "in-intersections" },
            ],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 18,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 24,
                },
            ],
        },
        {
            code: "type Foo = 'a' & 'b' & 'c';",
            options: [{ allowAliases: "in-unions" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 18,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 24,
                },
            ],
        },
        {
            code: "type Foo = 'a' & 'b' & 'c';",
            options: [
                {
                    allowAliases: "in-unions",
                    allowLiterals: "in-intersections",
                },
            ],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 18,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 24,
                },
            ],
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 18,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 24,
                },
            ],
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            options: [{ allowLiterals: "in-intersections" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 18,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 24,
                },
            ],
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            options: [{ allowAliases: "never" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 18,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 24,
                },
            ],
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            options: [
                { allowAliases: "never", allowLiterals: "in-intersections" },
            ],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 18,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 24,
                },
            ],
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            options: [{ allowAliases: "in-unions" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 18,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 24,
                },
            ],
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            options: [
                {
                    allowAliases: "in-unions",
                    allowLiterals: "in-intersections",
                },
            ],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 18,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 24,
                },
            ],
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            options: [{ allowAliases: "in-intersections" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            options: [
                {
                    allowAliases: "in-intersections",
                    allowLiterals: "in-intersections",
                },
            ],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: "type Foo = string;",
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "aliases",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: "type Foo = string;",
            options: [{ allowAliases: "never" }],
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "aliases",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: "type Foo = string;",
            options: [{ allowAliases: "in-unions" }],
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "aliases",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: "type Foo = string;",
            options: [{ allowAliases: "in-intersections" }],
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "aliases",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: "type Foo = string;",
            options: [{ allowAliases: "in-unions-and-intersections" }],
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "aliases",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: "type Foo = string | string[];",
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 21,
                },
            ],
        },
        {
            code: "type Foo = string | string[];",
            options: [{ allowLiterals: "in-unions" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 21,
                },
            ],
        },
        {
            code: "type Foo = string | string[];",
            options: [{ allowAliases: "never" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 21,
                },
            ],
        },
        {
            code: "type Foo = string | string[];",
            options: [{ allowAliases: "never", allowLiterals: "in-unions" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 21,
                },
            ],
        },
        {
            code: "type Foo = string | string[];",
            options: [{ allowAliases: "in-intersections" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 21,
                },
            ],
        },
        {
            code: "type Foo = string | string[];",
            options: [
                {
                    allowAliases: "in-intersections",
                    allowLiterals: "in-unions",
                },
            ],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 21,
                },
            ],
        },
        {
            code: "type Foo = string | string[] | number;",
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 21,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 32,
                },
            ],
        },
        {
            code: "type Foo = string | string[] | number;",
            options: [{ allowLiterals: "in-unions" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 21,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 32,
                },
            ],
        },
        {
            code: "type Foo = string | string[] | number;",
            options: [{ allowAliases: "never" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 21,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 32,
                },
            ],
        },
        {
            code: "type Foo = string | string[] | number;",
            options: [{ allowAliases: "never", allowLiterals: "in-unions" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 21,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 32,
                },
            ],
        },
        {
            code: "type Foo = string | string[] | number;",
            options: [{ allowAliases: "in-intersections" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 21,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 32,
                },
            ],
        },
        {
            code: "type Foo = string | string[] | number;",
            options: [
                {
                    allowAliases: "in-intersections",
                    allowLiterals: "in-unions",
                },
            ],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 21,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 32,
                },
            ],
        },
        {
            code: "type Foo = string | string[] & number;",
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 21,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 32,
                },
            ],
        },
        {
            code: "type Foo = string | string[] & number;",
            options: [{ allowLiterals: "in-unions" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 21,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 32,
                },
            ],
        },
        {
            code: "type Foo = string | string[] & number;",
            options: [{ allowAliases: "never" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 21,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 32,
                },
            ],
        },
        {
            code: "type Foo = string | string[] & number;",
            options: [{ allowAliases: "never", allowLiterals: "in-unions" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 21,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 32,
                },
            ],
        },
        {
            code: "type Foo = string | string[] & number;",
            options: [{ allowAliases: "in-unions" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 21,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 32,
                },
            ],
        },
        {
            code: "type Foo = string | string[] & number;",
            options: [
                { allowAliases: "in-unions", allowLiterals: "in-unions" },
            ],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 21,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 32,
                },
            ],
        },
        {
            code: "type Foo = string | string[] & number;",
            options: [{ allowAliases: "in-intersections" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: "type Foo = string | string[] & number;",
            options: [
                {
                    allowAliases: "in-intersections",
                    allowLiterals: "in-unions",
                },
            ],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: `
interface Bar {}
type Foo = Bar;
            `,
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "aliases",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: `
interface Bar {}
type Foo = Bar;
            `,
            options: [{ allowAliases: "never" }],
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "aliases",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: `
interface Bar {}
type Foo = Bar;
            `,
            options: [{ allowAliases: "in-unions" }],
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "aliases",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: `
interface Bar {}
type Foo = Bar;
            `,
            options: [{ allowAliases: "in-intersections" }],
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "aliases",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: `
interface Bar {}
type Foo = Bar;
            `,
            options: [{ allowAliases: "in-unions-and-intersections" }],
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "aliases",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: `
interface Bar {}
type Foo = Bar | {};
            `,
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Literals",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 18,
                },
            ],
        },
        {
            code: `
interface Bar {}
type Foo = Bar | {};
            `,
            options: [{ allowAliases: "never" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Literals",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 18,
                },
            ],
        },
        {
            code: `
interface Bar {}
type Foo = Bar | {};
            `,
            options: [{ allowAliases: "in-unions" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Literals",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 18,
                },
            ],
        },
        {
            code: `
interface Bar {}
type Foo = Bar | {};
            `,
            options: [{ allowAliases: "in-intersections" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Literals",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 18,
                },
            ],
        },
        {
            code: `
interface Bar {}
type Foo = Bar | {};
            `,
            options: [{ allowAliases: "in-unions-and-intersections" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Literals",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 18,
                },
            ],
        },
        {
            code: `
interface Bar {}
type Foo = Bar & {};
            `,
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Literals",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 18,
                },
            ],
        },
        {
            code: `
interface Bar {}
type Foo = Bar & {};
            `,
            options: [{ allowAliases: "never" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Literals",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 18,
                },
            ],
        },
        {
            code: `
interface Bar {}
type Foo = Bar & {};
            `,
            options: [{ allowAliases: "in-unions" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Literals",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 18,
                },
            ],
        },
        {
            code: `
interface Bar {}
type Foo = Bar & {};
            `,
            options: [{ allowAliases: "in-intersections" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Literals",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 18,
                },
            ],
        },
        {
            code: `
interface Bar {}
type Foo = Bar & {};
            `,
            options: [{ allowAliases: "in-unions-and-intersections" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Literals",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 18,
                },
            ],
        },
        {
            code: "type Foo = () => void;",
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "callbacks",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: "type Foo = () => void;",
            options: [{ allowCallbacks: "never" }],
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "callbacks",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: "type Foo = {};",
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "literals",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: "type Foo = {};",
            options: [{ allowLiterals: "never" }],
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "literals",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: "type Foo = {};",
            options: [{ allowLiterals: "in-unions" }],
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "literals",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: "type Foo = {};",
            options: [{ allowLiterals: "in-intersections" }],
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "literals",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: "type Foo = {};",
            options: [{ allowLiterals: "in-unions-and-intersections" }],
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "literals",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: "type Foo = {};",
            options: [{ allowAliases: "in-intersections" }],
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "literals",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: "type Foo = {};",
            options: [
                { allowLiterals: "never", allowAliases: "in-intersections" },
            ],
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "literals",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: "type Foo = {};",
            options: [
                {
                    allowLiterals: "in-unions",
                    allowAliases: "in-intersections",
                },
            ],
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "literals",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: "type Foo = {};",
            options: [
                {
                    allowLiterals: "in-intersections",
                    allowAliases: "in-intersections",
                },
            ],
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "literals",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: "type Foo = {};",
            options: [
                {
                    allowLiterals: "in-unions-and-intersections",
                    allowAliases: "in-intersections",
                },
            ],
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "literals",
                    },
                    row: 1,
                    column: 12,
                },
            ],
        },
        {
            code: "type Foo = {} | {};",
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Literals",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Literals",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 17,
                },
            ],
        },
        {
            code: "type Foo = {} | {};",
            options: [{ allowLiterals: "never" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Literals",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Literals",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 17,
                },
            ],
        },
        {
            code: "type Foo = {} | {};",
            options: [{ allowLiterals: "in-intersections" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Literals",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Literals",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 17,
                },
            ],
        },
        {
            code: "type Foo = {} & {};",
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Literals",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Literals",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 17,
                },
            ],
        },
        {
            code: "type Foo = {} & {};",
            options: [{ allowLiterals: "never" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Literals",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Literals",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 17,
                },
            ],
        },
        {
            code: "type Foo = {} & {};",
            options: [{ allowLiterals: "in-unions" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Literals",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Literals",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 17,
                },
            ],
        },
        {
            code: "type Foo = string & {} | 'a' | 1;",
            options: [
                { allowAliases: "in-unions", allowLiterals: "in-unions" },
            ],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 12,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Literals",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 21,
                },
            ],
        },
        {
            code: "type Foo = string & {} | 'a' | 1;",
            options: [
                {
                    allowAliases: "in-intersections",
                    allowLiterals: "in-unions",
                },
            ],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Literals",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 21,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 26,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Aliases",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 32,
                },
            ],
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
};
            `,
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "mapped types",
                    },
                    row: 1,
                    column: 15,
                },
            ],
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "never" }],
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "mapped types",
                    },
                    row: 1,
                    column: 15,
                },
            ],
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "in-unions" }],
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "mapped types",
                    },
                    row: 1,
                    column: 15,
                },
            ],
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "in-intersections" }],
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "mapped types",
                    },
                    row: 1,
                    column: 15,
                },
            ],
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "in-unions-and-intersections" }],
            errors: [
                {
                    messageId: "noTypeAlias",
                    data: {
                        alias: "mapped types",
                    },
                    row: 1,
                    column: 15,
                },
            ],
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} | {
    readonly [P in keyof T] : T[P]
};
            `,
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Mapped types",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 15,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Mapped types",
                        compositionType: "union",
                    },
                    row: 4,
                    column: 5,
                },
            ],
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} | {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "never" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Mapped types",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 15,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Mapped types",
                        compositionType: "union",
                    },
                    row: 4,
                    column: 5,
                },
            ],
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} | {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "in-intersections" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Mapped types",
                        compositionType: "union",
                    },
                    row: 1,
                    column: 15,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Mapped types",
                        compositionType: "union",
                    },
                    row: 4,
                    column: 5,
                },
            ],
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} & {
    readonly [P in keyof T] : T[P]
};
            `,
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Mapped types",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 15,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Mapped types",
                        compositionType: "intersection",
                    },
                    row: 4,
                    column: 5,
                },
            ],
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} & {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "never" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Mapped types",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 15,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Mapped types",
                        compositionType: "intersection",
                    },
                    row: 4,
                    column: 5,
                },
            ],
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} & {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "in-unions" }],
            errors: [
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Mapped types",
                        compositionType: "intersection",
                    },
                    row: 1,
                    column: 15,
                },
                {
                    messageId: "noCompositionAlias",
                    data: {
                        typeName: "Mapped types",
                        compositionType: "intersection",
                    },
                    row: 4,
                    column: 5,
                },
            ],
        },
    ],
});
