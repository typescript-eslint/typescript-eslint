/**
 * @fileoverview Enforces naming conventions for class members by visibility.
 * @author Ian MacLeod
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/member-naming"),
    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();

ruleTester.run("member-naming", rule, {
    valid: [
        {
            code: `class Class { _fooBar() {} }`,
            parser: "typescript-eslint-parser",
            options: [{ public: "^_" }]
        },
        {
            code: `class Class { public _fooBar() {} }`,
            parser: "typescript-eslint-parser",
            options: [{ public: "^_" }]
        },
        {
            code: `class Class { protected _fooBar() {} }`,
            parser: "typescript-eslint-parser",
            options: [{ protected: "^_" }]
        },
        {
            code: `class Class { private _fooBar() {} }`,
            parser: "typescript-eslint-parser",
            options: [{ private: "^_" }]
        },
        {
            code: `class Class { protected fooBar() {} }`,
            parser: "typescript-eslint-parser",
            options: [{ private: "^_" }]
        },
        {
            code: `
class Class {
    pubOne() {}
    public pubTwo() {}
    protected protThree() {}
    private privFour() {}
}
            `,
            parser: "typescript-eslint-parser",
            options: [
                {
                    public: "^pub[A-Z]",
                    protected: "^prot[A-Z]",
                    private: "^priv[A-Z]"
                }
            ]
        },
        {
            code: `
class Class {
    pubOne: string;
    public pubTwo: string;
    protected protThree: string;
    private privFour: string;
}
            `,
            parser: "typescript-eslint-parser",
            options: [
                {
                    public: "^pub[A-Z]",
                    protected: "^prot[A-Z]",
                    private: "^priv[A-Z]"
                }
            ]
        },
        {
            code: `
class Class {
    pubOne = true;
    public pubTwo = true;
    protected protThree = true;
    private privFour = true;
}
            `,
            parser: "typescript-eslint-parser",
            options: [
                {
                    public: "^pub[A-Z]",
                    protected: "^prot[A-Z]",
                    private: "^priv[A-Z]"
                }
            ]
        }
    ],
    invalid: [
        {
            code: `class Class { fooBar() {} }`,
            parser: "typescript-eslint-parser",
            options: [{ public: "^_" }],
            errors: [
                {
                    message: "public property fooBar should match /^_/",
                    line: 1,
                    column: 15
                }
            ]
        },
        {
            code: `class Class { public fooBar() {} }`,
            parser: "typescript-eslint-parser",
            options: [{ public: "^_" }],
            errors: [
                {
                    message: "public property fooBar should match /^_/",
                    line: 1,
                    column: 22
                }
            ]
        },
        {
            code: `class Class { protected fooBar() {} }`,
            parser: "typescript-eslint-parser",
            options: [{ protected: "^_" }],
            errors: [
                {
                    message: "protected property fooBar should match /^_/",
                    line: 1,
                    column: 25
                }
            ]
        },
        {
            code: `class Class { private fooBar() {} }`,
            parser: "typescript-eslint-parser",
            options: [{ private: "^_" }],
            errors: [
                {
                    message: "private property fooBar should match /^_/",
                    line: 1,
                    column: 23
                }
            ]
        },
        {
            code: `
class Class {
    one() {}
    public two() {}
    protected three() {}
    private four() {}
}
            `,
            parser: "typescript-eslint-parser",
            options: [
                {
                    public: "^pub[A-Z]",
                    protected: "^prot[A-Z]",
                    private: "^priv[A-Z]"
                }
            ],
            errors: [
                {
                    message: "public property one should match /^pub[A-Z]/",
                    line: 3,
                    column: 5
                },
                {
                    message: "public property two should match /^pub[A-Z]/",
                    line: 4,
                    column: 12
                },
                {
                    message:
                        "protected property three should match /^prot[A-Z]/",
                    line: 5,
                    column: 15
                },
                {
                    message: "private property four should match /^priv[A-Z]/",
                    line: 6,
                    column: 13
                }
            ]
        },
        {
            code: `
class Class {
    one: string;
    public two: string;
    protected three: string;
    private four: string;
}
            `,
            parser: "typescript-eslint-parser",
            options: [
                {
                    public: "^pub[A-Z]",
                    protected: "^prot[A-Z]",
                    private: "^priv[A-Z]"
                }
            ],
            errors: [
                {
                    message: "public property one should match /^pub[A-Z]/",
                    line: 3,
                    column: 5
                },
                {
                    message: "public property two should match /^pub[A-Z]/",
                    line: 4,
                    column: 12
                },
                {
                    message:
                        "protected property three should match /^prot[A-Z]/",
                    line: 5,
                    column: 15
                },
                {
                    message: "private property four should match /^priv[A-Z]/",
                    line: 6,
                    column: 13
                }
            ]
        },
        {
            code: `
class Class {
    one = true;
    public two = true;
    protected three = true;
    private four = true;
}
            `,
            parser: "typescript-eslint-parser",
            options: [
                {
                    public: "^pub[A-Z]",
                    protected: "^prot[A-Z]",
                    private: "^priv[A-Z]"
                }
            ],
            errors: [
                {
                    message: "public property one should match /^pub[A-Z]/",
                    line: 3,
                    column: 5
                },
                {
                    message: "public property two should match /^pub[A-Z]/",
                    line: 4,
                    column: 12
                },
                {
                    message:
                        "protected property three should match /^prot[A-Z]/",
                    line: 5,
                    column: 15
                },
                {
                    message: "private property four should match /^priv[A-Z]/",
                    line: 6,
                    column: 13
                }
            ]
        }
    ]
});
