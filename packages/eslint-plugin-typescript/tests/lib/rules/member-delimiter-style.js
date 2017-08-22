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

const ruleTester = new RuleTester();

ruleTester.run("member-delimiter-style", rule, {
    valid: [
        {
            code: `
interface Foo {
    name: string;
    age: number;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    name: string;
    age: number;
}
            `,
            options: [{ delimiter: "semi", requireLast: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    name: string;
    age: number;
}
            `,
            options: [{ delimiter: "semi" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    name: string;
    age: number
}
            `,
            options: [{ delimiter: "semi", requireLast: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    name: string;
    age: number;
}
            `,
            options: [{ delimiter: "semi", requireLast: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    name: string,
    age: number,
}
            `,
            options: [{ delimiter: "comma", requireLast: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    name: string,
    age: number,
}
            `,
            options: [{ delimiter: "comma" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    name: string,
    age: number
}
            `,
            options: [{ delimiter: "comma", requireLast: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    name: string,
    age: number,
}
            `,
            options: [{ delimiter: "comma", requireLast: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    name: string
    age: number
}
            `,
            options: [{ delimiter: "none", requireLast: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    name: string
    age: number
}
            `,
            options: [{ delimiter: "none", requireLast: false }],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    name: string;
    age: number;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    name: string;
    age: number;
}
            `,
            options: [{ delimiter: "semi", requireLast: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    name: string;
    age: number;
}
            `,
            options: [{ delimiter: "semi" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    name: string;
    age: number
}
            `,
            options: [{ delimiter: "semi", requireLast: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    name: string;
    age: number;
}
            `,
            options: [{ delimiter: "semi", requireLast: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    name: string,
    age: number,
}
            `,
            options: [{ delimiter: "comma", requireLast: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    name: string,
    age: number,
}
            `,
            options: [{ delimiter: "comma" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    name: string,
    age: number
}
            `,
            options: [{ delimiter: "comma", requireLast: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    name: string,
    age: number,
}
            `,
            options: [{ delimiter: "comma", requireLast: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    name: string
    age: number
}
            `,
            options: [{ delimiter: "none", requireLast: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    name: string
    age: number
}
            `,
            options: [{ delimiter: "none", requireLast: false }],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: "interface Foo { [key: string]: any }",
            parser: "typescript-eslint-parser"
        },
        {
            code: "interface Foo { [key: string]: any; }",
            parser: "typescript-eslint-parser"
        },
        {
            code: "interface Foo { [key: string]: any }",
            options: [
                {
                    ignoreSingleLine: true
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: "interface Foo { [key: string]: any }",
            options: [
                {
                    delimiter: "comma",
                    ignoreSingleLine: true
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: "interface Foo { [key: string]: any; }",
            options: [
                {
                    ignoreSingleLine: false
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: "interface Foo { [key: string]: any, }",
            options: [
                {
                    delimiter: "comma",
                    ignoreSingleLine: false
                }
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: "interface Foo { [key: string]: any }",
            options: [
                {
                    requireLast: true,
                    ignoreSingleLine: true
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: "interface Foo { [key: string]: any; }",
            options: [
                {
                    requireLast: true,
                    ignoreSingleLine: false
                }
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = { [key: string]: any }",
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = { [key: string]: any; }",
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = { [key: string]: any }",
            options: [
                {
                    ignoreSingleLine: true
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = { [key: string]: any; }",
            options: [
                {
                    ignoreSingleLine: false
                }
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = { [key: string]: any }",
            options: [
                {
                    requireLast: true,
                    ignoreSingleLine: true
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = { [key: string]: any; }",
            options: [
                {
                    requireLast: true,
                    ignoreSingleLine: false
                }
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "semi" }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "semi", requireLast: true }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "semi", requireLast: true }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "comma" }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "comma", requireLast: true }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "comma", requireLast: false }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "comma" }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "comma", requireLast: true }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "comma", requireLast: false }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "comma", requireLast: false }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "none" }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "none", requireLast: true }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "none", requireLast: false }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "none", requireLast: false }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "none" }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "none", requireLast: true }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "none", requireLast: false }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "none", requireLast: false }],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "comma",
                    overrides: { interface: { delimiter: "semi" } }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "comma",
                    requireLast: false,
                    overrides: {
                        interface: { delimiter: "semi", requireLast: true }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "comma",
                    requireLast: false,
                    overrides: {
                        interface: { delimiter: "semi", requireLast: true }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    overrides: { interface: { delimiter: "comma" } }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    requireLast: false,
                    overrides: {
                        interface: { delimiter: "comma", requireLast: true }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        interface: { delimiter: "comma", requireLast: false }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    overrides: { interface: { delimiter: "comma" } }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    requireLast: false,
                    overrides: {
                        interface: { delimiter: "comma", requireLast: true }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        interface: { delimiter: "comma", requireLast: false }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        interface: { delimiter: "comma", requireLast: false }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    overrides: { interface: { delimiter: "none" } }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    requireLast: false,
                    overrides: {
                        interface: { delimiter: "none", requireLast: true }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        interface: { delimiter: "none", requireLast: false }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        interface: { delimiter: "none", requireLast: false }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    overrides: { interface: { delimiter: "none" } }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    requireLast: false,
                    overrides: {
                        interface: { delimiter: "none", requireLast: true }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        interface: { delimiter: "none", requireLast: false }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        interface: { delimiter: "none", requireLast: false }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "semi" }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "semi", requireLast: true }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "semi", requireLast: true }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "comma" }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "comma", requireLast: true }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "comma", requireLast: false }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "comma" }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "comma", requireLast: true }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "comma", requireLast: false }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "comma", requireLast: false }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "none" }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "none", requireLast: true }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "none", requireLast: false }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "none", requireLast: false }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "none" }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "none", requireLast: true }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "none", requireLast: false }],
            parser: "typescript-eslint-parser",
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
            options: [{ delimiter: "none", requireLast: false }],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "comma",
                    overrides: { typeLiteral: { delimiter: "semi" } }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "comma",
                    requireLast: false,
                    overrides: {
                        typeLiteral: { delimiter: "semi", requireLast: true }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "comma",
                    requireLast: false,
                    overrides: {
                        typeLiteral: { delimiter: "semi", requireLast: true }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    overrides: { typeLiteral: { delimiter: "comma" } }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    requireLast: false,
                    overrides: {
                        typeLiteral: { delimiter: "comma", requireLast: true }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        typeLiteral: { delimiter: "comma", requireLast: false }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    overrides: { typeLiteral: { delimiter: "comma" } }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    requireLast: false,
                    overrides: {
                        typeLiteral: { delimiter: "comma", requireLast: true }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        typeLiteral: { delimiter: "comma", requireLast: false }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        typeLiteral: { delimiter: "comma", requireLast: false }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    overrides: { typeLiteral: { delimiter: "none" } }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    requireLast: false,
                    overrides: {
                        typeLiteral: { delimiter: "none", requireLast: true }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        typeLiteral: { delimiter: "none", requireLast: false }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "semi",
                    requireLast: true,
                    overrides: {
                        typeLiteral: { delimiter: "none", requireLast: false }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "comma",
                    overrides: { typeLiteral: { delimiter: "none" } }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "comma",
                    requireLast: false,
                    overrides: {
                        typeLiteral: { delimiter: "none", requireLast: true }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "comma",
                    requireLast: true,
                    overrides: {
                        typeLiteral: { delimiter: "none", requireLast: false }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    delimiter: "comma",
                    requireLast: true,
                    overrides: {
                        typeLiteral: { delimiter: "none", requireLast: false }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            options: [{ ignoreSingleLine: false }],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    requireLast: true,
                    ignoreSingleLine: false
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    requireLast: true,
                    ignoreSingleLine: true,
                    overrides: {
                        interface: { ignoreSingleLine: false }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            options: [{ ignoreSingleLine: false }],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    requireLast: true,
                    ignoreSingleLine: false
                }
            ],
            parser: "typescript-eslint-parser",
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
            options: [
                {
                    requireLast: true,
                    ignoreSingleLine: true,
                    overrides: {
                        typeLiteral: { ignoreSingleLine: false }
                    }
                }
            ],
            parser: "typescript-eslint-parser",
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
