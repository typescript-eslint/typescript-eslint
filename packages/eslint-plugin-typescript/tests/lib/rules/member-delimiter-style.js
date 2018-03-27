/**
 * @fileoverview Enforces a member delimiter style in interfaces and type literals.
 * @author Patricio Trevino
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/member-delimiter-style"),
    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
    parser: "typescript-eslint-parser"
});

ruleTester.run("member-delimiter-style", rule, {
    valid: [
        `
interface Foo {
    name: string;
    age: number;
}
        `,
        {
            code: `
interface Foo {
    name: string;
    age: number;
}
            `,
            options: [{ delimiter: "semi", requireLast: true }]
        },
        {
            code: `
interface Foo {
    name: string;
    age: number;
}
            `,
            options: [{ delimiter: "semi" }]
        },
        {
            code: `
interface Foo {
    name: string;
    age: number
}
            `,
            options: [{ delimiter: "semi", requireLast: false }]
        },
        {
            code: `
interface Foo {
    name: string;
    age: number;
}
            `,
            options: [{ delimiter: "semi", requireLast: false }]
        },
        {
            code: `
interface Foo {
    name: string,
    age: number,
}
            `,
            options: [{ delimiter: "comma", requireLast: true }]
        },
        {
            code: `
interface Foo {
    name: string,
    age: number,
}
            `,
            options: [{ delimiter: "comma" }]
        },
        {
            code: `
interface Foo {
    name: string,
    age: number
}
            `,
            options: [{ delimiter: "comma", requireLast: false }]
        },
        {
            code: `
interface Foo {
    name: string,
    age: number,
}
            `,
            options: [{ delimiter: "comma", requireLast: false }]
        },
        {
            code: `
interface Foo {
    name: string
    age: number
}
            `,
            options: [{ delimiter: "none", requireLast: true }]
        },
        {
            code: `
interface Foo {
    name: string
    age: number
}
            `,
            options: [{ delimiter: "none", requireLast: false }]
        },
        {
            code: `
interface Foo {
    name: string;
    age: number;
}
            `,
            options: [
                {
                    delimiter: "comma",
                    requireLast: false,
                    overrides: {
                        interface: {
                            delimiter: "semi",
                            requireLast: true
                        }
                    }
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string;
    age: number;
}
            `,
            options: [
                {
                    delimiter: "comma",
                    overrides: { interface: { delimiter: "semi" } }
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string;
    age: number
}
            `,
            options: [
                {
                    delimiter: "comma",
                    requireLast: true,
                    overrides: {
                        interface: {
                            delimiter: "semi",
                            requireLast: false
                        }
                    }
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string;
    age: number;
}
            `,
            options: [
                {
                    delimiter: "comma",
                    requireLast: true,
                    overrides: {
                        interface: {
                            delimiter: "semi",
                            requireLast: false
                        }
                    }
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string,
    age: number,
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: false,
                    overrides: {
                        interface: {
                            delimiter: "comma",
                            requireLast: true
                        }
                    }
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string,
    age: number,
}
            `,
            options: [
                {
                    delimiter: "semi",
                    overrides: { interface: { delimiter: "comma" } }
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string,
    age: number
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        interface: {
                            delimiter: "comma",
                            requireLast: false
                        }
                    }
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string,
    age: number,
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        interface: { delimiter: "comma", requireLast: false }
                    }
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string
    age: number
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: false,
                    overrides: {
                        interface: { delimiter: "none", requireLast: true }
                    }
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string
    age: number
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        interface: { delimiter: "none", requireLast: false }
                    }
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string;
    age: number;
}
            `
        },
        {
            code: `
type Foo = {
    name: string;
    age: number;
}
            `,
            options: [{ delimiter: "semi", requireLast: true }]
        },
        {
            code: `
type Foo = {
    name: string;
    age: number;
}
            `,
            options: [{ delimiter: "semi" }]
        },
        {
            code: `
type Foo = {
    name: string;
    age: number
}
            `,
            options: [{ delimiter: "semi", requireLast: false }]
        },
        {
            code: `
type Foo = {
    name: string;
    age: number;
}
            `,
            options: [{ delimiter: "semi", requireLast: false }]
        },
        {
            code: `
type Foo = {
    name: string,
    age: number,
}
            `,
            options: [{ delimiter: "comma", requireLast: true }]
        },
        {
            code: `
type Foo = {
    name: string,
    age: number,
}
            `,
            options: [{ delimiter: "comma" }]
        },
        {
            code: `
type Foo = {
    name: string,
    age: number
}
            `,
            options: [{ delimiter: "comma", requireLast: false }]
        },
        {
            code: `
type Foo = {
    name: string,
    age: number,
}
            `,
            options: [{ delimiter: "comma", requireLast: false }]
        },
        {
            code: `
type Foo = {
    name: string
    age: number
}
            `,
            options: [{ delimiter: "none", requireLast: true }]
        },
        {
            code: `
type Foo = {
    name: string
    age: number
}
            `,
            options: [{ delimiter: "none", requireLast: false }]
        },
        {
            code: `
type Foo = {
    name: string;
    age: number;
}
            `,
            options: [
                {
                    delimiter: "comma",
                    requireLast: false,
                    overrides: {
                        typeLiteral: { delimiter: "semi", requireLast: true }
                    }
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string;
    age: number;
}
            `,
            options: [
                {
                    delimiter: "comma",
                    overrides: { typeLiteral: { delimiter: "semi" } }
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string;
    age: number
}
            `,
            options: [
                {
                    delimiter: "comma",
                    requireLast: true,
                    overrides: {
                        typeLiteral: { delimiter: "semi", requireLast: false }
                    }
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string;
    age: number;
}
            `,
            options: [
                {
                    delimiter: "comma",
                    requireLast: true,
                    overrides: {
                        typeLiteral: { delimiter: "semi", requireLast: false }
                    }
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string,
    age: number,
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: false,
                    overrides: {
                        typeLiteral: { delimiter: "comma", requireLast: true }
                    }
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string,
    age: number,
}
            `,
            options: [
                {
                    delimiter: "semi",
                    overrides: { typeLiteral: { delimiter: "comma" } }
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string,
    age: number
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: false,
                    overrides: {
                        typeLiteral: { delimiter: "comma", requireLast: false }
                    }
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string,
    age: number,
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        typeLiteral: { delimiter: "comma", requireLast: false }
                    }
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string
    age: number
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: false,
                    overrides: {
                        typeLiteral: { delimiter: "none", requireLast: true }
                    }
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string
    age: number
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        typeLiteral: { delimiter: "none", requireLast: false }
                    }
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string;
    age: number;
}

type Bar = {
    name: string,
    age: number,
}
            `,
            options: [
                {
                    delimiter: "none",
                    overrides: {
                        interface: { delimiter: "semi" },
                        typeLiteral: { delimiter: "comma" }
                    }
                }
            ]
        },
        "interface Foo { [key: string]: any }",
        "interface Foo { [key: string]: any; }",
        {
            code: "interface Foo { [key: string]: any }",
            options: [
                {
                    ignoreSingleLine: true
                }
            ]
        },
        {
            code: "interface Foo { [key: string]: any }",
            options: [
                {
                    delimiter: "comma",
                    ignoreSingleLine: true
                }
            ]
        },
        {
            code: "interface Foo { [key: string]: any; }",
            options: [
                {
                    ignoreSingleLine: false
                }
            ]
        },
        {
            code: "interface Foo { [key: string]: any, }",
            options: [
                {
                    delimiter: "comma",
                    ignoreSingleLine: false
                }
            ]
        },
        {
            code: "interface Foo { [key: string]: any }",
            options: [
                {
                    ignoreSingleLine: false,
                    overrides: {
                        interface: { ignoreSingleLine: true }
                    }
                }
            ]
        },
        {
            code: "interface Foo { [key: string]: any }",
            options: [
                {
                    requireLast: true,
                    ignoreSingleLine: true
                }
            ]
        },
        {
            code: "interface Foo { [key: string]: any; }",
            options: [
                {
                    requireLast: true,
                    ignoreSingleLine: false
                }
            ]
        },
        {
            code: "interface Foo { [key: string]: any }",
            options: [
                {
                    requireLast: true,
                    ignoreSingleLine: false,
                    overrides: {
                        interface: { ignoreSingleLine: true }
                    }
                }
            ]
        },
        "type Foo = { [key: string]: any }",
        "type Foo = { [key: string]: any; }",
        {
            code: "type Foo = { [key: string]: any }",
            options: [
                {
                    ignoreSingleLine: true
                }
            ]
        },
        {
            code: "type Foo = { [key: string]: any; }",
            options: [
                {
                    ignoreSingleLine: false
                }
            ]
        },
        {
            code: "type Foo = { [key: string]: any }",
            options: [
                {
                    ignoreSingleLine: false,
                    overrides: {
                        typeLiteral: { ignoreSingleLine: true }
                    }
                }
            ]
        },
        {
            code: "type Foo = { [key: string]: any }",
            options: [
                {
                    requireLast: true,
                    ignoreSingleLine: true
                }
            ]
        },
        {
            code: "type Foo = { [key: string]: any; }",
            options: [
                {
                    requireLast: true,
                    ignoreSingleLine: false
                }
            ]
        },
        {
            code: "type Foo = { [key: string]: any }",
            options: [
                {
                    requireLast: true,
                    ignoreSingleLine: false,
                    overrides: {
                        typeLiteral: { ignoreSingleLine: true }
                    }
                }
            ]
        }
    ],
    invalid: [
        {
            code: `
interface Foo {
    name: string
    age: number
}
            `,
            output: `
interface Foo {
    name: string;
    age: number;
}
            `,
            errors: [
                {
                    message: "Expected a semicolon.",
                    line: 3,
                    column: 17
                },
                {
                    message: "Expected a semicolon.",
                    line: 4,
                    column: 16
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string
    age: number
}
            `,
            output: `
interface Foo {
    name: string;
    age: number;
}
            `,
            options: [{ delimiter: "semi" }],
            errors: [
                {
                    message: "Expected a semicolon.",
                    line: 3,
                    column: 17
                },
                {
                    message: "Expected a semicolon.",
                    line: 4,
                    column: 16
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string
    age: number
}
            `,
            output: `
interface Foo {
    name: string;
    age: number;
}
            `,
            options: [{ delimiter: "semi", requireLast: true }],
            errors: [
                {
                    message: "Expected a semicolon.",
                    line: 3,
                    column: 17
                },
                {
                    message: "Expected a semicolon.",
                    line: 4,
                    column: 16
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string
    age: number
}
            `,
            output: `
interface Foo {
    name: string;
    age: number
}
            `,
            options: [{ delimiter: "semi", requireLast: false }],
            errors: [
                {
                    message: "Expected a semicolon.",
                    line: 3,
                    column: 17
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string;
    age: number
}
            `,
            output: `
interface Foo {
    name: string;
    age: number;
}
            `,
            options: [{ delimiter: "semi", requireLast: true }],
            errors: [
                {
                    message: "Expected a semicolon.",
                    line: 4,
                    column: 16
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string
    age: number
}
            `,
            output: `
interface Foo {
    name: string,
    age: number,
}
            `,
            options: [{ delimiter: "comma" }],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 17
                },
                {
                    message: "Expected a comma.",
                    line: 4,
                    column: 16
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string
    age: number
}
            `,
            output: `
interface Foo {
    name: string,
    age: number,
}
            `,
            options: [{ delimiter: "comma", requireLast: true }],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 17
                },
                {
                    message: "Expected a comma.",
                    line: 4,
                    column: 16
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string
    age: number
}
            `,
            output: `
interface Foo {
    name: string,
    age: number
}
            `,
            options: [{ delimiter: "comma", requireLast: false }],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 17
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string;
    age: number;
}
            `,
            output: `
interface Foo {
    name: string,
    age: number,
}
            `,
            options: [{ delimiter: "comma" }],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 18
                },
                {
                    message: "Expected a comma.",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string;
    age: number;
}
            `,
            output: `
interface Foo {
    name: string,
    age: number,
}
            `,
            options: [{ delimiter: "comma", requireLast: true }],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 18
                },
                {
                    message: "Expected a comma.",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string;
    age: number
}
            `,
            output: `
interface Foo {
    name: string,
    age: number
}
            `,
            options: [{ delimiter: "comma", requireLast: false }],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 18
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string
    age: number;
}
            `,
            output: `
interface Foo {
    name: string,
    age: number
}
            `,
            options: [{ delimiter: "comma", requireLast: false }],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 17
                },
                {
                    message: "Expected a comma.",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string;
    age: number;
}
            `,
            output: `
interface Foo {
    name: string
    age: number
}
            `,
            options: [{ delimiter: "none" }],
            errors: [
                {
                    message: "Unexpected separator (;).",
                    line: 3,
                    column: 18
                },
                {
                    message: "Unexpected separator (;).",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string;
    age: number;
}
            `,
            output: `
interface Foo {
    name: string
    age: number
}
            `,
            options: [{ delimiter: "none", requireLast: true }],
            errors: [
                {
                    message: "Unexpected separator (;).",
                    line: 3,
                    column: 18
                },
                {
                    message: "Unexpected separator (;).",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string;
    age: number
}
            `,
            output: `
interface Foo {
    name: string
    age: number
}
            `,
            options: [{ delimiter: "none", requireLast: false }],
            errors: [
                {
                    message: "Unexpected separator (;).",
                    line: 3,
                    column: 18
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string
    age: number;
}
            `,
            output: `
interface Foo {
    name: string
    age: number
}
            `,
            options: [{ delimiter: "none", requireLast: false }],
            errors: [
                {
                    message: "Unexpected separator (;).",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string,
    age: number,
}
            `,
            output: `
interface Foo {
    name: string
    age: number
}
            `,
            options: [{ delimiter: "none" }],
            errors: [
                {
                    message: "Unexpected separator (,).",
                    line: 3,
                    column: 18
                },
                {
                    message: "Unexpected separator (,).",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string,
    age: number,
}
            `,
            output: `
interface Foo {
    name: string
    age: number
}
            `,
            options: [{ delimiter: "none", requireLast: true }],
            errors: [
                {
                    message: "Unexpected separator (,).",
                    line: 3,
                    column: 18
                },
                {
                    message: "Unexpected separator (,).",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string,
    age: number
}
            `,
            output: `
interface Foo {
    name: string
    age: number
}
            `,
            options: [{ delimiter: "none", requireLast: false }],
            errors: [
                {
                    message: "Unexpected separator (,).",
                    line: 3,
                    column: 18
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string
    age: number,
}
            `,
            output: `
interface Foo {
    name: string
    age: number
}
            `,
            options: [{ delimiter: "none", requireLast: false }],
            errors: [
                {
                    message: "Unexpected separator (,).",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string
    age: number
}
            `,
            output: `
interface Foo {
    name: string;
    age: number;
}
            `,
            options: [
                {
                    delimiter: "comma",
                    overrides: { interface: { delimiter: "semi" } }
                }
            ],
            errors: [
                {
                    message: "Expected a semicolon.",
                    line: 3,
                    column: 17
                },
                {
                    message: "Expected a semicolon.",
                    line: 4,
                    column: 16
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string
    age: number
}
            `,
            output: `
interface Foo {
    name: string;
    age: number;
}
            `,
            options: [
                {
                    delimiter: "comma",
                    requireLast: false,
                    overrides: {
                        interface: { delimiter: "semi", requireLast: true }
                    }
                }
            ],
            errors: [
                {
                    message: "Expected a semicolon.",
                    line: 3,
                    column: 17
                },
                {
                    message: "Expected a semicolon.",
                    line: 4,
                    column: 16
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string;
    age: number
}
            `,
            output: `
interface Foo {
    name: string;
    age: number;
}
            `,
            options: [
                {
                    delimiter: "comma",
                    requireLast: false,
                    overrides: {
                        interface: { delimiter: "semi", requireLast: true }
                    }
                }
            ],
            errors: [
                {
                    message: "Expected a semicolon.",
                    line: 4,
                    column: 16
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string
    age: number
}
            `,
            output: `
interface Foo {
    name: string,
    age: number,
}
            `,
            options: [
                {
                    delimiter: "semi",
                    overrides: { interface: { delimiter: "comma" } }
                }
            ],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 17
                },
                {
                    message: "Expected a comma.",
                    line: 4,
                    column: 16
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string
    age: number
}
            `,
            output: `
interface Foo {
    name: string,
    age: number,
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: false,
                    overrides: {
                        interface: { delimiter: "comma", requireLast: true }
                    }
                }
            ],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 17
                },
                {
                    message: "Expected a comma.",
                    line: 4,
                    column: 16
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string
    age: number
}
            `,
            output: `
interface Foo {
    name: string,
    age: number
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        interface: { delimiter: "comma", requireLast: false }
                    }
                }
            ],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 17
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string;
    age: number;
}
            `,
            output: `
interface Foo {
    name: string,
    age: number,
}
            `,
            options: [
                {
                    delimiter: "semi",
                    overrides: { interface: { delimiter: "comma" } }
                }
            ],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 18
                },
                {
                    message: "Expected a comma.",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string;
    age: number;
}
            `,
            output: `
interface Foo {
    name: string,
    age: number,
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: false,
                    overrides: {
                        interface: { delimiter: "comma", requireLast: true }
                    }
                }
            ],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 18
                },
                {
                    message: "Expected a comma.",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string;
    age: number
}
            `,
            output: `
interface Foo {
    name: string,
    age: number
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        interface: { delimiter: "comma", requireLast: false }
                    }
                }
            ],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 18
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string
    age: number;
}
            `,
            output: `
interface Foo {
    name: string,
    age: number
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        interface: { delimiter: "comma", requireLast: false }
                    }
                }
            ],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 17
                },
                {
                    message: "Expected a comma.",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string;
    age: number;
}
            `,
            output: `
interface Foo {
    name: string
    age: number
}
            `,
            options: [
                {
                    delimiter: "semi",
                    overrides: { interface: { delimiter: "none" } }
                }
            ],
            errors: [
                {
                    message: "Unexpected separator (;).",
                    line: 3,
                    column: 18
                },
                {
                    message: "Unexpected separator (;).",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string;
    age: number;
}
            `,
            output: `
interface Foo {
    name: string
    age: number
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: false,
                    overrides: {
                        interface: { delimiter: "none", requireLast: true }
                    }
                }
            ],
            errors: [
                {
                    message: "Unexpected separator (;).",
                    line: 3,
                    column: 18
                },
                {
                    message: "Unexpected separator (;).",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string;
    age: number
}
            `,
            output: `
interface Foo {
    name: string
    age: number
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        interface: { delimiter: "none", requireLast: false }
                    }
                }
            ],
            errors: [
                {
                    message: "Unexpected separator (;).",
                    line: 3,
                    column: 18
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string
    age: number;
}
            `,
            output: `
interface Foo {
    name: string
    age: number
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        interface: { delimiter: "none", requireLast: false }
                    }
                }
            ],
            errors: [
                {
                    message: "Unexpected separator (;).",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string,
    age: number,
}
            `,
            output: `
interface Foo {
    name: string
    age: number
}
            `,
            options: [
                {
                    delimiter: "semi",
                    overrides: { interface: { delimiter: "none" } }
                }
            ],
            errors: [
                {
                    message: "Unexpected separator (,).",
                    line: 3,
                    column: 18
                },
                {
                    message: "Unexpected separator (,).",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string,
    age: number,
}
            `,
            output: `
interface Foo {
    name: string
    age: number
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: false,
                    overrides: {
                        interface: { delimiter: "none", requireLast: true }
                    }
                }
            ],
            errors: [
                {
                    message: "Unexpected separator (,).",
                    line: 3,
                    column: 18
                },
                {
                    message: "Unexpected separator (,).",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string,
    age: number
}
            `,
            output: `
interface Foo {
    name: string
    age: number
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        interface: { delimiter: "none", requireLast: false }
                    }
                }
            ],
            errors: [
                {
                    message: "Unexpected separator (,).",
                    line: 3,
                    column: 18
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string
    age: number,
}
            `,
            output: `
interface Foo {
    name: string
    age: number
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        interface: { delimiter: "none", requireLast: false }
                    }
                }
            ],
            errors: [
                {
                    message: "Unexpected separator (,).",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string
    age: number
}
            `,
            output: `
type Foo = {
    name: string;
    age: number;
}
            `,
            errors: [
                {
                    message: "Expected a semicolon.",
                    line: 3,
                    column: 17
                },
                {
                    message: "Expected a semicolon.",
                    line: 4,
                    column: 16
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string
    age: number
}
            `,
            output: `
type Foo = {
    name: string;
    age: number;
}
            `,
            options: [{ delimiter: "semi" }],
            errors: [
                {
                    message: "Expected a semicolon.",
                    line: 3,
                    column: 17
                },
                {
                    message: "Expected a semicolon.",
                    line: 4,
                    column: 16
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string
    age: number
}
            `,
            output: `
type Foo = {
    name: string;
    age: number;
}
            `,
            options: [{ delimiter: "semi", requireLast: true }],
            errors: [
                {
                    message: "Expected a semicolon.",
                    line: 3,
                    column: 17
                },
                {
                    message: "Expected a semicolon.",
                    line: 4,
                    column: 16
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string;
    age: number
}
            `,
            output: `
type Foo = {
    name: string;
    age: number;
}
            `,
            options: [{ delimiter: "semi", requireLast: true }],
            errors: [
                {
                    message: "Expected a semicolon.",
                    line: 4,
                    column: 16
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string
    age: number
}
            `,
            output: `
type Foo = {
    name: string,
    age: number,
}
            `,
            options: [{ delimiter: "comma" }],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 17
                },
                {
                    message: "Expected a comma.",
                    line: 4,
                    column: 16
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string
    age: number
}
            `,
            output: `
type Foo = {
    name: string,
    age: number,
}
            `,
            options: [{ delimiter: "comma", requireLast: true }],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 17
                },
                {
                    message: "Expected a comma.",
                    line: 4,
                    column: 16
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string
    age: number
}
            `,
            output: `
type Foo = {
    name: string,
    age: number
}
            `,
            options: [{ delimiter: "comma", requireLast: false }],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 17
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string;
    age: number;
}
            `,
            output: `
type Foo = {
    name: string,
    age: number,
}
            `,
            options: [{ delimiter: "comma" }],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 18
                },
                {
                    message: "Expected a comma.",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string;
    age: number;
}
            `,
            output: `
type Foo = {
    name: string,
    age: number,
}
            `,
            options: [{ delimiter: "comma", requireLast: true }],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 18
                },
                {
                    message: "Expected a comma.",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string;
    age: number
}
            `,
            output: `
type Foo = {
    name: string,
    age: number
}
            `,
            options: [{ delimiter: "comma", requireLast: false }],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 18
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string
    age: number;
}
            `,
            output: `
type Foo = {
    name: string,
    age: number
}
            `,
            options: [{ delimiter: "comma", requireLast: false }],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 17
                },
                {
                    message: "Expected a comma.",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string;
    age: number;
}
            `,
            output: `
type Foo = {
    name: string
    age: number
}
            `,
            options: [{ delimiter: "none" }],
            errors: [
                {
                    message: "Unexpected separator (;).",
                    line: 3,
                    column: 18
                },
                {
                    message: "Unexpected separator (;).",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string;
    age: number;
}
            `,
            output: `
type Foo = {
    name: string
    age: number
}
            `,
            options: [{ delimiter: "none", requireLast: true }],
            errors: [
                {
                    message: "Unexpected separator (;).",
                    line: 3,
                    column: 18
                },
                {
                    message: "Unexpected separator (;).",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string;
    age: number
}
            `,
            output: `
type Foo = {
    name: string
    age: number
}
            `,
            options: [{ delimiter: "none", requireLast: false }],
            errors: [
                {
                    message: "Unexpected separator (;).",
                    line: 3,
                    column: 18
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string
    age: number;
}
            `,
            output: `
type Foo = {
    name: string
    age: number
}
            `,
            options: [{ delimiter: "none", requireLast: false }],
            errors: [
                {
                    message: "Unexpected separator (;).",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string,
    age: number,
}
            `,
            output: `
type Foo = {
    name: string
    age: number
}
            `,
            options: [{ delimiter: "none" }],
            errors: [
                {
                    message: "Unexpected separator (,).",
                    line: 3,
                    column: 18
                },
                {
                    message: "Unexpected separator (,).",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string,
    age: number,
}
            `,
            output: `
type Foo = {
    name: string
    age: number
}
            `,
            options: [{ delimiter: "none", requireLast: true }],
            errors: [
                {
                    message: "Unexpected separator (,).",
                    line: 3,
                    column: 18
                },
                {
                    message: "Unexpected separator (,).",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string,
    age: number
}
            `,
            output: `
type Foo = {
    name: string
    age: number
}
            `,
            options: [{ delimiter: "none", requireLast: false }],
            errors: [
                {
                    message: "Unexpected separator (,).",
                    line: 3,
                    column: 18
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string
    age: number,
}
            `,
            output: `
type Foo = {
    name: string
    age: number
}
            `,
            options: [{ delimiter: "none", requireLast: false }],
            errors: [
                {
                    message: "Unexpected separator (,).",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string
    age: number
}
            `,
            output: `
type Foo = {
    name: string;
    age: number;
}
            `,
            options: [
                {
                    delimiter: "comma",
                    overrides: { typeLiteral: { delimiter: "semi" } }
                }
            ],
            errors: [
                {
                    message: "Expected a semicolon.",
                    line: 3,
                    column: 17
                },
                {
                    message: "Expected a semicolon.",
                    line: 4,
                    column: 16
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string
    age: number
}
            `,
            output: `
type Foo = {
    name: string;
    age: number;
}
            `,
            options: [
                {
                    delimiter: "comma",
                    requireLast: false,
                    overrides: {
                        typeLiteral: { delimiter: "semi", requireLast: true }
                    }
                }
            ],
            errors: [
                {
                    message: "Expected a semicolon.",
                    line: 3,
                    column: 17
                },
                {
                    message: "Expected a semicolon.",
                    line: 4,
                    column: 16
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string;
    age: number
}
            `,
            output: `
type Foo = {
    name: string;
    age: number;
}
            `,
            options: [
                {
                    delimiter: "comma",
                    requireLast: false,
                    overrides: {
                        typeLiteral: { delimiter: "semi", requireLast: true }
                    }
                }
            ],
            errors: [
                {
                    message: "Expected a semicolon.",
                    line: 4,
                    column: 16
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string
    age: number
}
            `,
            output: `
type Foo = {
    name: string,
    age: number,
}
            `,
            options: [
                {
                    delimiter: "semi",
                    overrides: { typeLiteral: { delimiter: "comma" } }
                }
            ],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 17
                },
                {
                    message: "Expected a comma.",
                    line: 4,
                    column: 16
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string
    age: number
}
            `,
            output: `
type Foo = {
    name: string,
    age: number,
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: false,
                    overrides: {
                        typeLiteral: { delimiter: "comma", requireLast: true }
                    }
                }
            ],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 17
                },
                {
                    message: "Expected a comma.",
                    line: 4,
                    column: 16
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string
    age: number
}
            `,
            output: `
type Foo = {
    name: string,
    age: number
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        typeLiteral: { delimiter: "comma", requireLast: false }
                    }
                }
            ],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 17
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string;
    age: number;
}
            `,
            output: `
type Foo = {
    name: string,
    age: number,
}
            `,
            options: [
                {
                    delimiter: "semi",
                    overrides: { typeLiteral: { delimiter: "comma" } }
                }
            ],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 18
                },
                {
                    message: "Expected a comma.",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string;
    age: number;
}
            `,
            output: `
type Foo = {
    name: string,
    age: number,
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: false,
                    overrides: {
                        typeLiteral: { delimiter: "comma", requireLast: true }
                    }
                }
            ],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 18
                },
                {
                    message: "Expected a comma.",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string;
    age: number
}
            `,
            output: `
type Foo = {
    name: string,
    age: number
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        typeLiteral: { delimiter: "comma", requireLast: false }
                    }
                }
            ],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 18
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string
    age: number;
}
            `,
            output: `
type Foo = {
    name: string,
    age: number
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        typeLiteral: { delimiter: "comma", requireLast: false }
                    }
                }
            ],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 17
                },
                {
                    message: "Expected a comma.",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string;
    age: number;
}
            `,
            output: `
type Foo = {
    name: string
    age: number
}
            `,
            options: [
                {
                    delimiter: "semi",
                    overrides: { typeLiteral: { delimiter: "none" } }
                }
            ],
            errors: [
                {
                    message: "Unexpected separator (;).",
                    line: 3,
                    column: 18
                },
                {
                    message: "Unexpected separator (;).",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string;
    age: number;
}
            `,
            output: `
type Foo = {
    name: string
    age: number
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: false,
                    overrides: {
                        typeLiteral: { delimiter: "none", requireLast: true }
                    }
                }
            ],
            errors: [
                {
                    message: "Unexpected separator (;).",
                    line: 3,
                    column: 18
                },
                {
                    message: "Unexpected separator (;).",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string;
    age: number
}
            `,
            output: `
type Foo = {
    name: string
    age: number
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        typeLiteral: { delimiter: "none", requireLast: false }
                    }
                }
            ],
            errors: [
                {
                    message: "Unexpected separator (;).",
                    line: 3,
                    column: 18
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string
    age: number;
}
            `,
            output: `
type Foo = {
    name: string
    age: number
}
            `,
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        typeLiteral: { delimiter: "none", requireLast: false }
                    }
                }
            ],
            errors: [
                {
                    message: "Unexpected separator (;).",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string,
    age: number,
}
            `,
            output: `
type Foo = {
    name: string
    age: number
}
            `,
            options: [
                {
                    delimiter: "comma",
                    overrides: { typeLiteral: { delimiter: "none" } }
                }
            ],
            errors: [
                {
                    message: "Unexpected separator (,).",
                    line: 3,
                    column: 18
                },
                {
                    message: "Unexpected separator (,).",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string,
    age: number,
}
            `,
            output: `
type Foo = {
    name: string
    age: number
}
            `,
            options: [
                {
                    delimiter: "comma",
                    requireLast: false,
                    overrides: {
                        typeLiteral: { delimiter: "none", requireLast: true }
                    }
                }
            ],
            errors: [
                {
                    message: "Unexpected separator (,).",
                    line: 3,
                    column: 18
                },
                {
                    message: "Unexpected separator (,).",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string,
    age: number
}
            `,
            output: `
type Foo = {
    name: string
    age: number
}
            `,
            options: [
                {
                    delimiter: "comma",
                    requireLast: true,
                    overrides: {
                        typeLiteral: { delimiter: "none", requireLast: false }
                    }
                }
            ],
            errors: [
                {
                    message: "Unexpected separator (,).",
                    line: 3,
                    column: 18
                }
            ]
        },
        {
            code: `
type Foo = {
    name: string
    age: number,
}
            `,
            output: `
type Foo = {
    name: string
    age: number
}
            `,
            options: [
                {
                    delimiter: "comma",
                    requireLast: true,
                    overrides: {
                        typeLiteral: { delimiter: "none", requireLast: false }
                    }
                }
            ],
            errors: [
                {
                    message: "Unexpected separator (,).",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string;
    age: number;
}

type Bar = {
    name: string,
    age: number,
}
            `,
            output: `
interface Foo {
    name: string,
    age: number,
}

type Bar = {
    name: string;
    age: number;
}
            `,
            options: [
                {
                    delimiter: "none",
                    requireLast: true,
                    overrides: {
                        interface: { delimiter: "comma" },
                        typeLiteral: { delimiter: "semi" }
                    }
                }
            ],
            errors: [
                {
                    message: "Expected a comma.",
                    line: 3,
                    column: 18
                },
                {
                    message: "Expected a comma.",
                    line: 4,
                    column: 17
                },
                {
                    message: "Expected a semicolon.",
                    line: 8,
                    column: 18
                },
                {
                    message: "Expected a semicolon.",
                    line: 9,
                    column: 17
                }
            ]
        },
        {
            code: `
interface Foo {
    [key: string]: any
}
            `,
            output: `
interface Foo {
    [key: string]: any;
}
            `,
            errors: [
                {
                    message: "Expected a semicolon.",
                    line: 3,
                    column: 23
                }
            ]
        },
        {
            code: `
interface Foo {
    [key: string]: any
}
            `,
            output: `
interface Foo {
    [key: string]: any;
}
            `,
            options: [{ ignoreSingleLine: true }],
            errors: [
                {
                    message: "Expected a semicolon.",
                    line: 3,
                    column: 23
                }
            ]
        },
        {
            code: "interface Foo { [key: string]: any }",
            output: "interface Foo { [key: string]: any; }",
            options: [{ ignoreSingleLine: false }],
            errors: [
                {
                    message: "Expected a semicolon.",
                    line: 1,
                    column: 35
                }
            ]
        },
        {
            code: "interface Foo { [key: string]: any }",
            output: "interface Foo { [key: string]: any; }",
            options: [
                {
                    requireLast: true,
                    ignoreSingleLine: false
                }
            ],
            errors: [
                {
                    message: "Expected a semicolon.",
                    line: 1,
                    column: 35
                }
            ]
        },
        {
            code: "interface Foo { [key: string]: any }",
            output: "interface Foo { [key: string]: any; }",
            options: [
                {
                    requireLast: true,
                    ignoreSingleLine: true,
                    overrides: {
                        interface: { ignoreSingleLine: false }
                    }
                }
            ],
            errors: [
                {
                    message: "Expected a semicolon.",
                    line: 1,
                    column: 35
                }
            ]
        },
        {
            code: `
type Foo = {
    [key: string]: any
}
            `,
            output: `
type Foo = {
    [key: string]: any;
}
            `,
            errors: [
                {
                    message: "Expected a semicolon.",
                    line: 3,
                    column: 23
                }
            ]
        },
        {
            code: `
type Foo = {
    [key: string]: any
}
            `,
            output: `
type Foo = {
    [key: string]: any;
}
            `,
            options: [{ ignoreSingleLine: true }],
            errors: [
                {
                    message: "Expected a semicolon.",
                    line: 3,
                    column: 23
                }
            ]
        },
        {
            code: "type Foo = { [key: string]: any }",
            output: "type Foo = { [key: string]: any; }",
            options: [{ ignoreSingleLine: false }],
            errors: [
                {
                    message: "Expected a semicolon.",
                    line: 1,
                    column: 32
                }
            ]
        },
        {
            code: "type Foo = { [key: string]: any }",
            output: "type Foo = { [key: string]: any; }",
            options: [
                {
                    requireLast: true,
                    ignoreSingleLine: false
                }
            ],
            errors: [
                {
                    message: "Expected a semicolon.",
                    line: 1,
                    column: 32
                }
            ]
        },
        {
            code: "type Foo = { [key: string]: any }",
            output: "type Foo = { [key: string]: any; }",
            options: [
                {
                    requireLast: true,
                    ignoreSingleLine: true,
                    overrides: {
                        typeLiteral: { ignoreSingleLine: false }
                    }
                }
            ],
            errors: [
                {
                    message: "Expected a semicolon.",
                    line: 1,
                    column: 32
                }
            ]
        }
    ]
});
