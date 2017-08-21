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

const ruleTester = new RuleTester();

ruleTester.run("no-type-alias", rule, {
    valid: [
        {
            code: "type Foo = 'a';",
            options: [{ allowAliases: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 'a';",
            options: [{ allowAliases: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 'a' | 'b';",
            options: [{ allowAliases: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 'a' | 'b';",
            options: [{ allowAliases: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 'a' | 'b';",
            options: [{ allowAliases: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 'a' | 'b';",
            options: [{ allowAliases: "in-unions" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 'a' | 'b' | 'c';",
            options: [{ allowAliases: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 'a' | 'b' | 'c';",
            options: [{ allowAliases: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 'a' | 'b' | 'c';",
            options: [{ allowAliases: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 'a' | 'b' | 'c';",
            options: [{ allowAliases: "in-unions" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 'a' & 'b';",
            options: [{ allowAliases: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 'a' & 'b';",
            options: [{ allowAliases: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 'a' & 'b';",
            options: [{ allowAliases: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 'a' & 'b';",
            options: [{ allowAliases: "in-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 'a' & 'b' & 'c';",
            options: [{ allowAliases: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 'a' & 'b' & 'c';",
            options: [{ allowAliases: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 'a' & 'b' & 'c';",
            options: [{ allowAliases: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 'a' & 'b' & 'c';",
            options: [{ allowAliases: "in-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            options: [{ allowAliases: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            options: [{ allowAliases: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            options: [{ allowAliases: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 1;",
            options: [{ allowAliases: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 1;",
            options: [{ allowAliases: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 1 | 2;",
            options: [{ allowAliases: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 1 | 2;",
            options: [{ allowAliases: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 1 | 2;",
            options: [{ allowAliases: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 1 | 2;",
            options: [{ allowAliases: "in-unions" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 1 | 2 | 3;",
            options: [{ allowAliases: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 1 | 2 | 3;",
            options: [{ allowAliases: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 1 | 2 | 3;",
            options: [{ allowAliases: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 1 | 2 | 3;",
            options: [{ allowAliases: "in-unions" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 1 & 2;",
            options: [{ allowAliases: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 1 & 2;",
            options: [{ allowAliases: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 1 & 2;",
            options: [{ allowAliases: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 1 & 2;",
            options: [{ allowAliases: "in-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 1 & 2 & 3;",
            options: [{ allowAliases: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 1 & 2 & 3;",
            options: [{ allowAliases: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 1 & 2 & 3;",
            options: [{ allowAliases: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 1 & 2 & 3;",
            options: [{ allowAliases: "in-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 1 | 2 & 3;",
            options: [{ allowAliases: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 1 | 2 & 3;",
            options: [{ allowAliases: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = 1 | 2 & 3;",
            options: [{ allowAliases: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = true;",
            options: [{ allowAliases: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = true;",
            options: [{ allowAliases: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = true | false;",
            options: [{ allowAliases: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = true | false;",
            options: [{ allowAliases: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = true | false;",
            options: [{ allowAliases: "in-unions" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = true & false;",
            options: [{ allowAliases: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = true & false;",
            options: [{ allowAliases: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = true & false;",
            options: [{ allowAliases: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = true & false;",
            options: [{ allowAliases: "in-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Bar {}
type Foo = Bar | string;
            `,
            options: [{ allowAliases: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Bar {}
type Foo = Bar | string;
            `,
            options: [{ allowAliases: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Bar {}
type Foo = Bar | string;
            `,
            options: [{ allowAliases: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Bar {}
type Foo = Bar | string;
            `,
            options: [{ allowAliases: "in-unions" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Bar {}
type Foo = Bar & string;
            `,
            options: [{ allowAliases: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Bar {}
type Foo = Bar & string;
            `,
            options: [{ allowAliases: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Bar {}
type Foo = Bar & string;
            `,
            options: [{ allowAliases: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Bar {}
type Foo = Bar & string;
            `,
            options: [{ allowAliases: "in-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = string;",
            options: [{ allowAliases: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = string;",
            options: [{ allowAliases: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = string | string[];",
            options: [{ allowAliases: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = string | string[];",
            options: [{ allowAliases: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = string | string[];",
            options: [{ allowAliases: "in-unions" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = string | string[] | number;",
            options: [{ allowAliases: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = string | string[] | number;",
            options: [{ allowAliases: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = string | string[] | number;",
            options: [{ allowAliases: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = string | string[] | number;",
            options: [{ allowAliases: "in-unions" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = string & string[];",
            options: [{ allowAliases: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = string & string[];",
            options: [{ allowAliases: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = string & string[];",
            options: [{ allowAliases: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = string & string[];",
            options: [{ allowAliases: "in-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = string & string[] & number;",
            options: [{ allowAliases: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = string & string[] & number;",
            options: [{ allowAliases: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = string & string[] & number;",
            options: [{ allowAliases: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = string & string[] & number;",
            options: [{ allowAliases: "in-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = () => void;",
            options: [{ allowCallbacks: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = () => void;",
            options: [{ allowCallbacks: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = () => void | string;",
            options: [{ allowCallbacks: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = {};",
            options: [{ allowLiterals: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = {};",
            options: [{ allowLiterals: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = {} | {};",
            options: [{ allowLiterals: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = {} | {};",
            options: [{ allowLiterals: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = {} | {};",
            options: [{ allowLiterals: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = {} | {};",
            options: [{ allowLiterals: "in-unions" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = {} & {};",
            options: [{ allowLiterals: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = {} & {};",
            options: [{ allowLiterals: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = {} & {};",
            options: [{ allowLiterals: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = {} & {};",
            options: [{ allowLiterals: "in-intersections" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "always" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} | {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: true }],
            parser: "typescript-eslint-parser"
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
            parser: "typescript-eslint-parser"
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
            parser: "typescript-eslint-parser"
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
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} & {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: true }],
            parser: "typescript-eslint-parser"
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
            parser: "typescript-eslint-parser"
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
            parser: "typescript-eslint-parser"
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
            parser: "typescript-eslint-parser"
        }
    ],
    invalid: [
        {
            code: "type Foo = 'a'",
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type aliases are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = 'a'",
            options: [{ allowAliases: false }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type aliases are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = 'a'",
            options: [{ allowAliases: "never" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type aliases are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = 'a' | 'b';",
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: "type Foo = 'a' | 'b';",
            options: [{ allowLiterals: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: "type Foo = 'a' | 'b';",
            options: [{ allowAliases: false }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: "type Foo = 'a' | 'b';",
            options: [{ allowAliases: false, allowLiterals: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: "type Foo = 'a' | 'b';",
            options: [{ allowAliases: "never" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: "type Foo = 'a' | 'b';",
            options: [{ allowAliases: "never", allowLiterals: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: "type Foo = 'a' | 'b';",
            options: [
                { allowAliases: "in-intersections", allowLiterals: "in-unions" }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: "type Foo = 'a' | 'b' | 'c';",
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 18
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = 'a' | 'b' | 'c';",
            options: [{ allowLiterals: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 18
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = 'a' | 'b' | 'c';",
            options: [{ allowAliases: false }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 18
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = 'a' | 'b' | 'c';",
            options: [{ allowAliases: false, allowLiterals: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 18
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = 'a' | 'b' | 'c';",
            options: [{ allowAliases: "never" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 18
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = 'a' | 'b' | 'c';",
            options: [{ allowAliases: "never", allowLiterals: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 18
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = 'a' | 'b' | 'c';",
            options: [{ allowAliases: "in-intersections" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 18
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = 'a' | 'b' | 'c';",
            options: [
                { allowAliases: "in-intersections", allowLiterals: "in-unions" }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 18
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = 'a' & 'b';",
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: "type Foo = 'a' & 'b';",
            options: [{ allowLiterals: "in-intersections" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: "type Foo = 'a' & 'b';",
            options: [{ allowAliases: false }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: "type Foo = 'a' & 'b';",
            options: [
                { allowAliases: false, allowLiterals: "in-intersections" }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: "type Foo = 'a' & 'b';",
            options: [{ allowAliases: "never" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: "type Foo = 'a' & 'b';",
            options: [
                { allowAliases: "never", allowLiterals: "in-intersections" }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: "type Foo = 'a' & 'b';",
            options: [{ allowAliases: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: "type Foo = 'a' & 'b';",
            options: [
                { allowAliases: "in-unions", allowLiterals: "in-intersections" }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: "type Foo = 'a' & 'b' & 'c';",
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 18
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = 'a' & 'b' & 'c';",
            options: [{ allowLiterals: "in-intersections" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 18
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = 'a' & 'b' & 'c';",
            options: [{ allowAliases: false }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 18
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = 'a' & 'b' & 'c';",
            options: [
                { allowAliases: false, allowLiterals: "in-intersections" }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 18
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = 'a' & 'b' & 'c';",
            options: [{ allowAliases: "never" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 18
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = 'a' & 'b' & 'c';",
            options: [
                { allowAliases: "never", allowLiterals: "in-intersections" }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 18
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = 'a' & 'b' & 'c';",
            options: [{ allowAliases: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 18
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = 'a' & 'b' & 'c';",
            options: [
                { allowAliases: "in-unions", allowLiterals: "in-intersections" }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 18
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 18
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            options: [{ allowLiterals: "in-intersections" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 18
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            options: [{ allowAliases: false }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 18
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            options: [
                { allowAliases: false, allowLiterals: "in-intersections" }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 18
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            options: [{ allowAliases: "never" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 18
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            options: [
                { allowAliases: "never", allowLiterals: "in-intersections" }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 18
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            options: [{ allowAliases: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 18
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            options: [
                { allowAliases: "in-unions", allowLiterals: "in-intersections" }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 18
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            options: [{ allowAliases: "in-intersections" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            options: [
                {
                    allowAliases: "in-intersections",
                    allowLiterals: "in-intersections"
                }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = string;",
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type aliases are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = string;",
            options: [{ allowAliases: false }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type aliases are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = string;",
            options: [{ allowAliases: "never" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type aliases are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = string;",
            options: [{ allowAliases: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type aliases are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = string;",
            options: [{ allowAliases: "in-intersections" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type aliases are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = string;",
            options: [{ allowAliases: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type aliases are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = string | string[];",
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 21
                }
            ]
        },
        {
            code: "type Foo = string | string[];",
            options: [{ allowLiterals: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 21
                }
            ]
        },
        {
            code: "type Foo = string | string[];",
            options: [{ allowAliases: false }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 21
                }
            ]
        },
        {
            code: "type Foo = string | string[];",
            options: [{ allowAliases: false, allowLiterals: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 21
                }
            ]
        },
        {
            code: "type Foo = string | string[];",
            options: [{ allowAliases: "never" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 21
                }
            ]
        },
        {
            code: "type Foo = string | string[];",
            options: [{ allowAliases: "never", allowLiterals: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 21
                }
            ]
        },
        {
            code: "type Foo = string | string[];",
            options: [{ allowAliases: "in-intersections" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 21
                }
            ]
        },
        {
            code: "type Foo = string | string[];",
            options: [
                { allowAliases: "in-intersections", allowLiterals: "in-unions" }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 21
                }
            ]
        },
        {
            code: "type Foo = string | string[] | number;",
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 21
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 32
                }
            ]
        },
        {
            code: "type Foo = string | string[] | number;",
            options: [{ allowLiterals: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 21
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 32
                }
            ]
        },
        {
            code: "type Foo = string | string[] | number;",
            options: [{ allowAliases: false }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 21
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 32
                }
            ]
        },
        {
            code: "type Foo = string | string[] | number;",
            options: [{ allowAliases: false, allowLiterals: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 21
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 32
                }
            ]
        },
        {
            code: "type Foo = string | string[] | number;",
            options: [{ allowAliases: "never" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 21
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 32
                }
            ]
        },
        {
            code: "type Foo = string | string[] | number;",
            options: [{ allowAliases: "never", allowLiterals: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 21
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 32
                }
            ]
        },
        {
            code: "type Foo = string | string[] | number;",
            options: [{ allowAliases: "in-intersections" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 21
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 32
                }
            ]
        },
        {
            code: "type Foo = string | string[] | number;",
            options: [
                { allowAliases: "in-intersections", allowLiterals: "in-unions" }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 21
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 32
                }
            ]
        },
        {
            code: "type Foo = string | string[] & number;",
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 21
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 32
                }
            ]
        },
        {
            code: "type Foo = string | string[] & number;",
            options: [{ allowLiterals: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 21
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 32
                }
            ]
        },
        {
            code: "type Foo = string | string[] & number;",
            options: [{ allowAliases: false }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 21
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 32
                }
            ]
        },
        {
            code: "type Foo = string | string[] & number;",
            options: [{ allowAliases: false, allowLiterals: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 21
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 32
                }
            ]
        },
        {
            code: "type Foo = string | string[] & number;",
            options: [{ allowAliases: "never" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 21
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 32
                }
            ]
        },
        {
            code: "type Foo = string | string[] & number;",
            options: [{ allowAliases: "never", allowLiterals: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 21
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 32
                }
            ]
        },
        {
            code: "type Foo = string | string[] & number;",
            options: [{ allowAliases: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 21
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 32
                }
            ]
        },
        {
            code: "type Foo = string | string[] & number;",
            options: [
                { allowAliases: "in-unions", allowLiterals: "in-unions" }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 21
                },
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 32
                }
            ]
        },
        {
            code: "type Foo = string | string[] & number;",
            options: [{ allowAliases: "in-intersections" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = string | string[] & number;",
            options: [
                { allowAliases: "in-intersections", allowLiterals: "in-unions" }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: `
interface Bar {}
type Foo = Bar;
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type aliases are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: `
interface Bar {}
type Foo = Bar;
            `,
            options: [{ allowAliases: false }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type aliases are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: `
interface Bar {}
type Foo = Bar;
            `,
            options: [{ allowAliases: "never" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type aliases are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: `
interface Bar {}
type Foo = Bar;
            `,
            options: [{ allowAliases: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type aliases are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: `
interface Bar {}
type Foo = Bar;
            `,
            options: [{ allowAliases: "in-intersections" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type aliases are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: `
interface Bar {}
type Foo = Bar;
            `,
            options: [{ allowAliases: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type aliases are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: `
interface Bar {}
type Foo = Bar | {};
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Literals in union types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: `
interface Bar {}
type Foo = Bar | {};
            `,
            options: [{ allowAliases: false }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Literals in union types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: `
interface Bar {}
type Foo = Bar | {};
            `,
            options: [{ allowAliases: "never" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Literals in union types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: `
interface Bar {}
type Foo = Bar | {};
            `,
            options: [{ allowAliases: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Literals in union types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: `
interface Bar {}
type Foo = Bar | {};
            `,
            options: [{ allowAliases: "in-intersections" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Literals in union types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: `
interface Bar {}
type Foo = Bar | {};
            `,
            options: [{ allowAliases: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Literals in union types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: `
interface Bar {}
type Foo = Bar & {};
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Literals in intersection types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: `
interface Bar {}
type Foo = Bar & {};
            `,
            options: [{ allowAliases: false }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Literals in intersection types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: `
interface Bar {}
type Foo = Bar & {};
            `,
            options: [{ allowAliases: "never" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Literals in intersection types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: `
interface Bar {}
type Foo = Bar & {};
            `,
            options: [{ allowAliases: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Literals in intersection types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: `
interface Bar {}
type Foo = Bar & {};
            `,
            options: [{ allowAliases: "in-intersections" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Literals in intersection types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: `
interface Bar {}
type Foo = Bar & {};
            `,
            options: [{ allowAliases: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Literals in intersection types are not allowed",
                    row: 1,
                    column: 18
                }
            ]
        },
        {
            code: "type Foo = () => void;",
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type callbacks are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = () => void;",
            options: [{ allowCallbacks: false }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type callbacks are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = () => void;",
            options: [{ allowCallbacks: "never" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type callbacks are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = {};",
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type literals are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = {};",
            options: [{ allowLiterals: false }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type literals are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = {};",
            options: [{ allowLiterals: "never" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type literals are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = {};",
            options: [{ allowLiterals: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type literals are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = {};",
            options: [{ allowLiterals: "in-intersections" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type literals are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = {};",
            options: [{ allowLiterals: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type literals are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = {};",
            options: [{ allowAliases: "in-intersections" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type literals are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = {};",
            options: [
                { allowLiterals: false, allowAliases: "in-intersections" }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type literals are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = {};",
            options: [
                { allowLiterals: "never", allowAliases: "in-intersections" }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type literals are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = {};",
            options: [
                { allowLiterals: "in-unions", allowAliases: "in-intersections" }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type literals are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = {};",
            options: [
                {
                    allowLiterals: "in-intersections",
                    allowAliases: "in-intersections"
                }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type literals are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = {};",
            options: [
                {
                    allowLiterals: "in-unions-and-intersections",
                    allowAliases: "in-intersections"
                }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type literals are not allowed",
                    row: 1,
                    column: 12
                }
            ]
        },
        {
            code: "type Foo = {} | {};",
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Literals in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Literals in union types are not allowed",
                    row: 1,
                    column: 17
                }
            ]
        },
        {
            code: "type Foo = {} | {};",
            options: [{ allowLiterals: false }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Literals in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Literals in union types are not allowed",
                    row: 1,
                    column: 17
                }
            ]
        },
        {
            code: "type Foo = {} | {};",
            options: [{ allowLiterals: "never" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Literals in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Literals in union types are not allowed",
                    row: 1,
                    column: 17
                }
            ]
        },
        {
            code: "type Foo = {} | {};",
            options: [{ allowLiterals: "in-intersections" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Literals in union types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Literals in union types are not allowed",
                    row: 1,
                    column: 17
                }
            ]
        },
        {
            code: "type Foo = {} & {};",
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Literals in intersection types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Literals in intersection types are not allowed",
                    row: 1,
                    column: 17
                }
            ]
        },
        {
            code: "type Foo = {} & {};",
            options: [{ allowLiterals: false }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Literals in intersection types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Literals in intersection types are not allowed",
                    row: 1,
                    column: 17
                }
            ]
        },
        {
            code: "type Foo = {} & {};",
            options: [{ allowLiterals: "never" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Literals in intersection types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Literals in intersection types are not allowed",
                    row: 1,
                    column: 17
                }
            ]
        },
        {
            code: "type Foo = {} & {};",
            options: [{ allowLiterals: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Literals in intersection types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Literals in intersection types are not allowed",
                    row: 1,
                    column: 17
                }
            ]
        },
        {
            code: "type Foo = string & {} | 'a' | 1;",
            options: [
                { allowAliases: "in-unions", allowLiterals: "in-unions" }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Aliases in intersection types are not allowed",
                    row: 1,
                    column: 12
                },
                {
                    message: "Literals in intersection types are not allowed",
                    row: 1,
                    column: 21
                }
            ]
        },
        {
            code: "type Foo = string & {} | 'a' | 1;",
            options: [
                { allowAliases: "in-intersections", allowLiterals: "in-unions" }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Literals in intersection types are not allowed",
                    row: 1,
                    column: 21
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 26
                },
                {
                    message: "Aliases in union types are not allowed",
                    row: 1,
                    column: 32
                }
            ]
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
};
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type mapped types are not allowed",
                    row: 1,
                    column: 15
                }
            ]
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: false }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type mapped types are not allowed",
                    row: 1,
                    column: 15
                }
            ]
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "never" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type mapped types are not allowed",
                    row: 1,
                    column: 15
                }
            ]
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "in-unions" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type mapped types are not allowed",
                    row: 1,
                    column: 15
                }
            ]
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "in-intersections" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type mapped types are not allowed",
                    row: 1,
                    column: 15
                }
            ]
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "in-unions-and-intersections" }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Type mapped types are not allowed",
                    row: 1,
                    column: 15
                }
            ]
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} | {
    readonly [P in keyof T] : T[P]
};
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Mapped types in union types are not allowed",
                    row: 1,
                    column: 15
                },
                {
                    message: "Mapped types in union types are not allowed",
                    row: 4,
                    column: 5
                }
            ]
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} | {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: false }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Mapped types in union types are not allowed",
                    row: 1,
                    column: 15
                },
                {
                    message: "Mapped types in union types are not allowed",
                    row: 4,
                    column: 5
                }
            ]
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
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Mapped types in union types are not allowed",
                    row: 1,
                    column: 15
                },
                {
                    message: "Mapped types in union types are not allowed",
                    row: 4,
                    column: 5
                }
            ]
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
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Mapped types in union types are not allowed",
                    row: 1,
                    column: 15
                },
                {
                    message: "Mapped types in union types are not allowed",
                    row: 4,
                    column: 5
                }
            ]
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} & {
    readonly [P in keyof T] : T[P]
};
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Mapped types in intersection types are not allowed",
                    row: 1,
                    column: 15
                },
                {
                    message:
                        "Mapped types in intersection types are not allowed",
                    row: 4,
                    column: 5
                }
            ]
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} & {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: false }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Mapped types in intersection types are not allowed",
                    row: 1,
                    column: 15
                },
                {
                    message:
                        "Mapped types in intersection types are not allowed",
                    row: 4,
                    column: 5
                }
            ]
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
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Mapped types in intersection types are not allowed",
                    row: 1,
                    column: 15
                },
                {
                    message:
                        "Mapped types in intersection types are not allowed",
                    row: 4,
                    column: 5
                }
            ]
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
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Mapped types in intersection types are not allowed",
                    row: 1,
                    column: 15
                },
                {
                    message:
                        "Mapped types in intersection types are not allowed",
                    row: 4,
                    column: 5
                }
            ]
        }
    ]
});
