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
    parser: "typescript-eslint-parser"
});

ruleTester.run("no-type-alias", rule, {
    valid: [
        {
            code: "type Foo = 'a';",
            options: [{ allowAliases: true }]
        },
        {
            code: "type Foo = 'a';",
            options: [{ allowAliases: "always" }]
        },
        {
            code: "type Foo = 'a' | 'b';",
            options: [{ allowAliases: true }]
        },
        {
            code: "type Foo = 'a' | 'b';",
            options: [{ allowAliases: "always" }]
        },
        {
            code: "type Foo = 'a' | 'b';",
            options: [{ allowAliases: "in-unions-and-intersections" }]
        },
        {
            code: "type Foo = 'a' | 'b';",
            options: [{ allowAliases: "in-unions" }]
        },
        {
            code: "type Foo = 'a' | 'b' | 'c';",
            options: [{ allowAliases: true }]
        },
        {
            code: "type Foo = 'a' | 'b' | 'c';",
            options: [{ allowAliases: "always" }]
        },
        {
            code: "type Foo = 'a' | 'b' | 'c';",
            options: [{ allowAliases: "in-unions-and-intersections" }]
        },
        {
            code: "type Foo = 'a' | 'b' | 'c';",
            options: [{ allowAliases: "in-unions" }]
        },
        {
            code: "type Foo = 'a' & 'b';",
            options: [{ allowAliases: true }]
        },
        {
            code: "type Foo = 'a' & 'b';",
            options: [{ allowAliases: "always" }]
        },
        {
            code: "type Foo = 'a' & 'b';",
            options: [{ allowAliases: "in-unions-and-intersections" }]
        },
        {
            code: "type Foo = 'a' & 'b';",
            options: [{ allowAliases: "in-intersections" }]
        },
        {
            code: "type Foo = 'a' & 'b' & 'c';",
            options: [{ allowAliases: true }]
        },
        {
            code: "type Foo = 'a' & 'b' & 'c';",
            options: [{ allowAliases: "always" }]
        },
        {
            code: "type Foo = 'a' & 'b' & 'c';",
            options: [{ allowAliases: "in-unions-and-intersections" }]
        },
        {
            code: "type Foo = 'a' & 'b' & 'c';",
            options: [{ allowAliases: "in-intersections" }]
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            options: [{ allowAliases: true }]
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            options: [{ allowAliases: "always" }]
        },
        {
            code: "type Foo = 'a' | 'b' & 'c';",
            options: [{ allowAliases: "in-unions-and-intersections" }]
        },
        {
            code: "type Foo = 1;",
            options: [{ allowAliases: true }]
        },
        {
            code: "type Foo = 1;",
            options: [{ allowAliases: "always" }]
        },
        {
            code: "type Foo = 1 | 2;",
            options: [{ allowAliases: true }]
        },
        {
            code: "type Foo = 1 | 2;",
            options: [{ allowAliases: "always" }]
        },
        {
            code: "type Foo = 1 | 2;",
            options: [{ allowAliases: "in-unions-and-intersections" }]
        },
        {
            code: "type Foo = 1 | 2;",
            options: [{ allowAliases: "in-unions" }]
        },
        {
            code: "type Foo = 1 | 2 | 3;",
            options: [{ allowAliases: true }]
        },
        {
            code: "type Foo = 1 | 2 | 3;",
            options: [{ allowAliases: "always" }]
        },
        {
            code: "type Foo = 1 | 2 | 3;",
            options: [{ allowAliases: "in-unions-and-intersections" }]
        },
        {
            code: "type Foo = 1 | 2 | 3;",
            options: [{ allowAliases: "in-unions" }]
        },
        {
            code: "type Foo = 1 & 2;",
            options: [{ allowAliases: true }]
        },
        {
            code: "type Foo = 1 & 2;",
            options: [{ allowAliases: "always" }]
        },
        {
            code: "type Foo = 1 & 2;",
            options: [{ allowAliases: "in-unions-and-intersections" }]
        },
        {
            code: "type Foo = 1 & 2;",
            options: [{ allowAliases: "in-intersections" }]
        },
        {
            code: "type Foo = 1 & 2 & 3;",
            options: [{ allowAliases: true }]
        },
        {
            code: "type Foo = 1 & 2 & 3;",
            options: [{ allowAliases: "always" }]
        },
        {
            code: "type Foo = 1 & 2 & 3;",
            options: [{ allowAliases: "in-unions-and-intersections" }]
        },
        {
            code: "type Foo = 1 & 2 & 3;",
            options: [{ allowAliases: "in-intersections" }]
        },
        {
            code: "type Foo = 1 | 2 & 3;",
            options: [{ allowAliases: true }]
        },
        {
            code: "type Foo = 1 | 2 & 3;",
            options: [{ allowAliases: "always" }]
        },
        {
            code: "type Foo = 1 | 2 & 3;",
            options: [{ allowAliases: "in-unions-and-intersections" }]
        },
        {
            code: "type Foo = true;",
            options: [{ allowAliases: true }]
        },
        {
            code: "type Foo = true;",
            options: [{ allowAliases: "always" }]
        },
        {
            code: "type Foo = true | false;",
            options: [{ allowAliases: "always" }]
        },
        {
            code: "type Foo = true | false;",
            options: [{ allowAliases: "in-unions-and-intersections" }]
        },
        {
            code: "type Foo = true | false;",
            options: [{ allowAliases: "in-unions" }]
        },
        {
            code: "type Foo = true & false;",
            options: [{ allowAliases: true }]
        },
        {
            code: "type Foo = true & false;",
            options: [{ allowAliases: "always" }]
        },
        {
            code: "type Foo = true & false;",
            options: [{ allowAliases: "in-unions-and-intersections" }]
        },
        {
            code: "type Foo = true & false;",
            options: [{ allowAliases: "in-intersections" }]
        },
        {
            code: `
interface Bar {}
type Foo = Bar | string;
            `,
            options: [{ allowAliases: true }]
        },
        {
            code: `
interface Bar {}
type Foo = Bar | string;
            `,
            options: [{ allowAliases: "always" }]
        },
        {
            code: `
interface Bar {}
type Foo = Bar | string;
            `,
            options: [{ allowAliases: "in-unions-and-intersections" }]
        },
        {
            code: `
interface Bar {}
type Foo = Bar | string;
            `,
            options: [{ allowAliases: "in-unions" }]
        },
        {
            code: `
interface Bar {}
type Foo = Bar & string;
            `,
            options: [{ allowAliases: true }]
        },
        {
            code: `
interface Bar {}
type Foo = Bar & string;
            `,
            options: [{ allowAliases: "always" }]
        },
        {
            code: `
interface Bar {}
type Foo = Bar & string;
            `,
            options: [{ allowAliases: "in-unions-and-intersections" }]
        },
        {
            code: `
interface Bar {}
type Foo = Bar & string;
            `,
            options: [{ allowAliases: "in-intersections" }]
        },
        {
            code: "type Foo = string;",
            options: [{ allowAliases: true }]
        },
        {
            code: "type Foo = string;",
            options: [{ allowAliases: "always" }]
        },
        {
            code: "type Foo = string | string[];",
            options: [{ allowAliases: "always" }]
        },
        {
            code: "type Foo = string | string[];",
            options: [{ allowAliases: "in-unions-and-intersections" }]
        },
        {
            code: "type Foo = string | string[];",
            options: [{ allowAliases: "in-unions" }]
        },
        {
            code: "type Foo = string | string[] | number;",
            options: [{ allowAliases: true }]
        },
        {
            code: "type Foo = string | string[] | number;",
            options: [{ allowAliases: "always" }]
        },
        {
            code: "type Foo = string | string[] | number;",
            options: [{ allowAliases: "in-unions-and-intersections" }]
        },
        {
            code: "type Foo = string | string[] | number;",
            options: [{ allowAliases: "in-unions" }]
        },
        {
            code: "type Foo = string & string[];",
            options: [{ allowAliases: true }]
        },
        {
            code: "type Foo = string & string[];",
            options: [{ allowAliases: "always" }]
        },
        {
            code: "type Foo = string & string[];",
            options: [{ allowAliases: "in-unions-and-intersections" }]
        },
        {
            code: "type Foo = string & string[];",
            options: [{ allowAliases: "in-intersections" }]
        },
        {
            code: "type Foo = string & string[] & number;",
            options: [{ allowAliases: true }]
        },
        {
            code: "type Foo = string & string[] & number;",
            options: [{ allowAliases: "always" }]
        },
        {
            code: "type Foo = string & string[] & number;",
            options: [{ allowAliases: "in-unions-and-intersections" }]
        },
        {
            code: "type Foo = string & string[] & number;",
            options: [{ allowAliases: "in-intersections" }]
        },
        {
            code: "type Foo = () => void;",
            options: [{ allowCallbacks: true }]
        },
        {
            code: "type Foo = () => void;",
            options: [{ allowCallbacks: "always" }]
        },
        {
            code: "type Foo = () => void | string;",
            options: [{ allowCallbacks: "always" }]
        },
        {
            code: "type Foo = {};",
            options: [{ allowLiterals: true }]
        },
        {
            code: "type Foo = {};",
            options: [{ allowLiterals: "always" }]
        },
        {
            code: "type Foo = {} | {};",
            options: [{ allowLiterals: true }]
        },
        {
            code: "type Foo = {} | {};",
            options: [{ allowLiterals: "always" }]
        },
        {
            code: "type Foo = {} | {};",
            options: [{ allowLiterals: "in-unions-and-intersections" }]
        },
        {
            code: "type Foo = {} | {};",
            options: [{ allowLiterals: "in-unions" }]
        },
        {
            code: "type Foo = {} & {};",
            options: [{ allowLiterals: true }]
        },
        {
            code: "type Foo = {} & {};",
            options: [{ allowLiterals: "always" }]
        },
        {
            code: "type Foo = {} & {};",
            options: [{ allowLiterals: "in-unions-and-intersections" }]
        },
        {
            code: "type Foo = {} & {};",
            options: [{ allowLiterals: "in-intersections" }]
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: true }]
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "always" }]
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} | {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: true }]
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} | {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "always" }]
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} | {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "in-unions-and-intersections" }]
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} | {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "in-unions" }]
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} & {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: true }]
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} & {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "always" }]
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} & {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "in-unions-and-intersections" }]
        },
        {
            code: `
type Foo<T> = {
    readonly [P in keyof T] : T[P]
} & {
    readonly [P in keyof T] : T[P]
};
            `,
            options: [{ allowMappedTypes: "in-intersections" }]
        }
    ],
    invalid: [
        {
            code: "type Foo = 'a'",
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
