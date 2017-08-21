/**
 * @fileoverview Enforces a standard member declaration order.
 * @author Patricio Trevino
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/member-ordering"),
    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();

ruleTester.run("member-ordering", rule, {
    valid: [
        {
            code: `
// no accessibility === public
interface Foo {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    new();
    G();
    H();
    I();
    J();
    K();
    L();
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
// no accessibility === public
interface Foo {
    A: string;
    J();
    K();
    D: string;
    E: string;
    F: string;
    new();
    G();
    H();
    B: string;
    C: string;
    I();
    L();
}
            `,
            options: [{ default: "never" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
// no accessibility === public
interface Foo {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    new();
    G();
    H();
    I();
    J();
    K();
    L();
}
            `,
            options: [{ default: ["field", "constructor", "method"] }],
            parser: "typescript-eslint-parser"
        },

        {
            code: `
// no accessibility === public
interface Foo {
    A: string;
    J();
    K();
    D: string;
    E: string;
    F: string;
    new();
    G();
    B: string;
    C: string;
    H();
    I();
    L();
}
            `,
            options: [{ interfaces: "never" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
// no accessibility === public
interface Foo {
    G();
    H();
    I();
    J();
    K();
    L();
    new();
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
}
            `,
            options: [{ interfaces: ["method", "constructor", "field"] }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
// no accessibility === public
interface Foo {
    G();
    H();
    I();
    J();
    K();
    L();
    new();
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
}
            `,
            options: [
                {
                    default: ["field", "constructor", "method"],
                    interfaces: ["method", "constructor", "field"]
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
// no accessibility === public
interface Foo {
    G();
    H();
    I();
    new();
    D: string;
    E: string;
    F: string;
    J();
    K();
    L();
    A: string;
    B: string;
    C: string;
}
            `,
            options: [
                {
                    default: [
                        "private-instance-method",
                        "public-constructor",
                        "protected-static-field"
                    ]
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
// no accessibility === public
interface Foo {
    G();
    H();
    I();
    J();
    K();
    L();
    D: string;
    E: string;
    F: string;
    new();
    A: string;
    B: string;
    C: string;
}
            `,
            options: [
                {
                    default: [
                        "method",
                        "public-constructor",
                        "protected-static-field"
                    ]
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
// no accessibility === public
type Foo = {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    new();
    G();
    H();
    I();
    J();
    K();
    L();
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
// no accessibility === public
type Foo = {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    G();
    H();
    I();
    J();
    K();
    L();
}
            `,
            options: [{ default: "never" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
// no accessibility === public
type Foo = {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    G();
    H();
    I();
    J();
    K();
    L();
}
            `,
            options: [{ default: ["field", "constructor", "method"] }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
// no accessibility === public
type Foo = {
    new();
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    G();
    H();
    I();
    J();
    K();
    L();
}
            `,
            options: [{ default: ["field", "method"] }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
// no accessibility === public
type Foo = {
    G();
    H();
    K();
    L();
    A: string;
    B: string;
    I();
    J();
    C: string;
    D: string;
    E: string;
    F: string;
}
            `,
            options: [{ typeLiterals: "never" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
// no accessibility === public
type Foo = {
    G();
    H();
    I();
    J();
    K();
    L();
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
}
            `,
            options: [{ typeLiterals: ["method", "field"] }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
// no accessibility === public
type Foo = {
    G();
    H();
    I();
    J();
    K();
    L();
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
}
            `,
            options: [{ typeLiterals: ["method", "constructor", "field"] }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
// no accessibility === public
type Foo = {
    G();
    H();
    I();
    J();
    K();
    L();
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
}
            `,
            options: [
                {
                    default: ["field", "constructor", "method"],
                    typeLiterals: ["method", "constructor", "field"]
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
// no accessibility === public
type Foo = {
    D: string;
    E: string;
    F: string;
    A: string;
    B: string;
    C: string;
    G();
    H();
    I();
    J();
    K();
    L();
}
            `,
            options: [
                {
                    default: [
                        "public-instance-method",
                        "public-constructor",
                        "protected-static-field"
                    ],
                    typeLiterals: ["field", "method"]
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    constructor() {}
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    constructor() {}
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
}
            `,
            options: [{ default: "never" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    constructor() {}
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
}
            `,
            options: [{ default: ["field", "constructor", "method"] }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    constructor() {}
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
}
            `,
            options: [{ default: ["field", "method"] }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    public static G() {}
    protected K() {}
    private L() {}
    private static I() {}
    public J() {}
    public D: string = "";
    protected static H() {}
    public static A: string;
    protected static B: string = "";
    constructor() {}
    private static C: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
            options: [{ classes: "never" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    constructor() {}
}
            `,
            options: [{ classes: ["method", "field"] }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
    constructor() {}
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
            options: [{ classes: ["method", "constructor", "field"] }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
    constructor() {}
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
            options: [
                {
                    default: ["field", "constructor", "method"],
                    classes: ["method", "constructor", "field"]
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    public J() {}
    public static G() {}
    protected static H() {}
    private static I() {}
    protected K() {}
    private L() {}
    constructor() {}
    public D: string = "";
    public static A: string;
    private static C: string = "";
    private F: string = "";
    protected static B: string = "";
    protected E: string = "";
}
            `,
            options: [
                {
                    classes: [
                        "public-method",
                        "constructor",
                        "public-field",
                        "private-field",
                        "protected-field"
                    ]
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    public static G() {}
    private static I() {}
    protected static H() {}
    public J() {}
    private L() {}
    protected K() {}
    constructor() {}
    public D: string = "";
    public static A: string;
    protected static B: string = "";
    protected E: string = "";
    private static C: string = "";
    private F: string = "";
}
            `,
            options: [
                {
                    classes: [
                        "public-static-method",
                        "static-method",
                        "public-instance-method",
                        "instance-method",
                        "constructor",
                        "public-field",
                        "protected-field",
                        "private-field"
                    ]
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    public J() {}
    public static G() {}
    public D: string = "";
    public static A: string = "";
    constructor() {}
    protected K() {}
    private L() {}
    protected static H() {}
    private static I() {}
    protected static B: string = "";
    private static C: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
            parser: "typescript-eslint-parser",
            options: [
                {
                    default: [
                        "public-method",
                        "public-field",
                        "constructor",
                        "method",
                        "field"
                    ]
                }
            ]
        },
        {
            code: `
class Foo {
    public J() {}
    public static G() {}
    protected static H() {}
    private static I() {}
    protected K() {}
    private L() {}
    constructor() {}
    public static A: string;
    private F: string = "";
    protected static B: string = "";
    public D: string = "";
    private static C: string = "";
    protected E: string = "";
}
            `,
            options: [
                {
                    classes: [
                        "public-method",
                        "protected-static-method",
                        "private-static-method",
                        "protected-instance-method",
                        "private-instance-method",
                        "constructor",
                        "field"
                    ]
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    private L() {}
    private static I() {}
    protected static H() {}
    protected static B: string = "";
    public static G() {}
    public J() {}
    protected K() {}
    private static C: string = "";
    private F: string = "";
    protected E: string = "";
    public static A: string;
    public D: string = "";
    constructor() {}

}
            `,
            options: [
                {
                    classes: [
                        "private-instance-method",
                        "protected-static-field"
                    ]
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    private L() {}
    private static I() {}
    protected static H() {}
    public static G() {}
    public J() {}
    protected static B: string = "";
    protected K() {}
    private static C: string = "";
    private F: string = "";
    protected E: string = "";
    public static A: string;
    public D: string = "";
    constructor() {}

}
            `,
            options: [
                {
                    default: [
                        "public-instance-method",
                        "protected-static-field"
                    ]
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    private L() {}
    private static I() {}
    protected static H() {}
    public static G() {}
    public J() {}
    protected static B: string = "";
    protected K() {}
    private static C: string = "";
    private F: string = "";
    protected E: string = "";
    public static A: string;
    public D: string = "";
    constructor() {}

}
            `,
            options: [
                {
                    classes: [
                        "public-instance-method",
                        "protected-static-field"
                    ]
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    public D: string = "";
    private L() {}
    private static I() {}
    protected static H() {}
    public static G() {}
    public J() {}
    private constructor() {}
    protected static B: string = "";
    protected K() {}
    private static C: string = "";
    private F: string = "";
    protected E: string = "";
    public static A: string;
}
            `,
            options: [
                {
                    default: [
                        "public-instance-method",
                        "public-constructor",
                        "protected-static-field"
                    ],
                    classes: [
                        "public-instance-field",
                        "private-constructor",
                        "protected-instance-method"
                    ]
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    public constructor() {}
    public D: string = "";
    private L() {}
    private static I() {}
    protected static H() {}
    public static G() {}
    public J() {}
    protected static B: string = "";
    protected K() {}
    private static C: string = "";
    private F: string = "";
    protected E: string = "";
    public static A: string;
}
            `,
            options: [
                {
                    default: [
                        "public-instance-method",
                        "public-constructor",
                        "protected-static-field"
                    ],
                    classes: [
                        "public-instance-field",
                        "private-constructor",
                        "protected-instance-method"
                    ]
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
const foo = class Foo {
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    constructor() {}
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
const foo = class Foo {
    constructor() {}
    public static A: string;
    protected static B: string = "";
    private static I() {}
    public J() {}
    private F: string = "";
    public static G() {}
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    protected static H() {}
    protected K() {}
    private L() {}
}
            `,
            options: [{ default: "never" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
const foo = class Foo {
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    constructor() {}
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
}
            `,
            options: [{ default: ["field", "constructor", "method"] }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
const foo = class Foo {
    constructor() {}
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
}
            `,
            options: [{ default: ["field", "method"] }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
const foo = class Foo {
    private L() {}
    protected static H() {}
    constructor() {}
    private static I() {}
    public J() {}
    private static C: string = "";
    public D: string = "";
    protected K() {}
    public static G() {}
    public static A: string;
    protected static B: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
            options: [{ classExpressions: "never" }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
const foo = class Foo {
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    constructor() {}
}
            `,
            options: [{ classExpressions: ["method", "field"] }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
const foo = class Foo {
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
    constructor() {}
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
            options: [{ classExpressions: ["method", "constructor", "field"] }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
const foo = class Foo {
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
    constructor() {}
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
            options: [
                {
                    default: ["field", "constructor", "method"],
                    classExpressions: ["method", "constructor", "field"]
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
const foo = class Foo {
    private L() {}
    private static I() {}
    protected static H() {}
    protected static B: string = "";
    public static G() {}
    public J() {}
    protected K() {}
    private static C: string = "";
    private F: string = "";
    protected E: string = "";
    public static A: string;
    public D: string = "";
    constructor() {}

}
            `,
            options: [
                {
                    classExpressions: [
                        "private-instance-method",
                        "protected-static-field"
                    ]
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
const foo = class Foo {
    private L() {}
    private static I() {}
    protected static H() {}
    public static G() {}
    public J() {}
    protected static B: string = "";
    protected K() {}
    private static C: string = "";
    private F: string = "";
    protected E: string = "";
    public static A: string;
    public D: string = "";
    constructor() {}

}
            `,
            options: [
                {
                    default: [
                        "public-instance-method",
                        "protected-static-field"
                    ]
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
const foo = class Foo {
    private L() {}
    private static I() {}
    protected static H() {}
    public static G() {}
    public J() {}
    protected static B: string = "";
    protected K() {}
    private static C: string = "";
    private F: string = "";
    protected E: string = "";
    public static A: string;
    public D: string = "";
    constructor() {}

}
            `,
            options: [
                {
                    classExpressions: [
                        "public-instance-method",
                        "protected-static-field"
                    ]
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
const foo = class Foo {
    public D: string = "";
    private L() {}
    private static I() {}
    protected static H() {}
    public static G() {}
    public J() {}
    private constructor() {}
    protected static B: string = "";
    protected K() {}
    private static C: string = "";
    private F: string = "";
    protected E: string = "";
    public static A: string;
}
            `,
            options: [
                {
                    default: [
                        "public-instance-method",
                        "public-constructor",
                        "protected-static-field"
                    ],
                    classes: [
                        "public-instance-method",
                        "protected-constructor",
                        "protected-static-method"
                    ],
                    classExpressions: [
                        "public-instance-field",
                        "private-constructor",
                        "protected-instance-method"
                    ]
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
const foo = class Foo {
    public constructor() {}
    public D: string = "";
    private L() {}
    private static I() {}
    protected static H() {}
    public static G() {}
    public J() {}
    protected static B: string = "";
    protected K() {}
    private static C: string = "";
    private F: string = "";
    protected E: string = "";
    public static A: string;
}
            `,
            options: [
                {
                    default: [
                        "public-instance-method",
                        "public-constructor",
                        "protected-static-field"
                    ],
                    classes: [
                        "public-instance-method",
                        "protected-constructor",
                        "protected-static-method"
                    ],
                    classExpressions: [
                        "public-instance-field",
                        "private-constructor",
                        "protected-instance-method"
                    ]
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    A: string;
    constructor () {}
    J() {}
    K = () => {}
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    J() {}
    K = () => {}
    constructor () {}
    A: string;
}
            `,
            options: [{ default: ["method", "constructor", "field"] }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    J() {}
    K = () => {}
    L: () => {}
    constructor () {}
    A: string;
}
            `,
            options: [{ default: ["method", "constructor", "field"] }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    A: string;
    J();
    K: () => {}
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    J();
    K: () => {}
    A: string;
}
            `,
            options: [{ default: ["method", "constructor", "field"] }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    A: string;
    J();
    K: () => {}
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    J();
    K: () => {}
    A: string;
}
            `,
            options: [{ default: ["method", "constructor", "field"] }],
            parser: "typescript-eslint-parser"
        }
    ],
    invalid: [
        {
            code: `
// no accessibility === public
interface Foo {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    G();
    H();
    I();
    J();
    K();
    L();
    new();
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member new should be declared before all method definitions.",
                    line: 16,
                    column: 5
                }
            ]
        },
        {
            code: `
// no accessibility === public
interface Foo {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    G();
    H();
    I();
    J();
    K();
    L();
    new();
}
            `,
            parser: "typescript-eslint-parser",
            options: [{ default: ["method", "constructor", "field"] }],
            errors: [
                {
                    message:
                        "Member G should be declared before all field definitions.",
                    line: 10,
                    column: 5
                },
                {
                    message:
                        "Member H should be declared before all field definitions.",
                    line: 11,
                    column: 5
                },
                {
                    message:
                        "Member I should be declared before all field definitions.",
                    line: 12,
                    column: 5
                },
                {
                    message:
                        "Member J should be declared before all field definitions.",
                    line: 13,
                    column: 5
                },
                {
                    message:
                        "Member K should be declared before all field definitions.",
                    line: 14,
                    column: 5
                },
                {
                    message:
                        "Member L should be declared before all field definitions.",
                    line: 15,
                    column: 5
                },
                {
                    message:
                        "Member new should be declared before all field definitions.",
                    line: 16,
                    column: 5
                }
            ]
        },
        {
            code: `
// no accessibility === public
interface Foo {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    G();
    H();
    I();
    J();
    K();
    L();
    new();
}
            `,
            parser: "typescript-eslint-parser",
            options: [{ interfaces: ["method", "constructor", "field"] }],
            errors: [
                {
                    message:
                        "Member G should be declared before all field definitions.",
                    line: 10,
                    column: 5
                },
                {
                    message:
                        "Member H should be declared before all field definitions.",
                    line: 11,
                    column: 5
                },
                {
                    message:
                        "Member I should be declared before all field definitions.",
                    line: 12,
                    column: 5
                },
                {
                    message:
                        "Member J should be declared before all field definitions.",
                    line: 13,
                    column: 5
                },
                {
                    message:
                        "Member K should be declared before all field definitions.",
                    line: 14,
                    column: 5
                },
                {
                    message:
                        "Member L should be declared before all field definitions.",
                    line: 15,
                    column: 5
                },
                {
                    message:
                        "Member new should be declared before all field definitions.",
                    line: 16,
                    column: 5
                }
            ]
        },
        {
            code: `
// no accessibility === public
interface Foo {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    G();
    H();
    I();
    J();
    K();
    L();
    new();
}
            `,
            parser: "typescript-eslint-parser",
            options: [
                {
                    default: ["field", "method", "constructor"],
                    interfaces: ["method", "constructor", "field"]
                }
            ],
            errors: [
                {
                    message:
                        "Member G should be declared before all field definitions.",
                    line: 10,
                    column: 5
                },
                {
                    message:
                        "Member H should be declared before all field definitions.",
                    line: 11,
                    column: 5
                },
                {
                    message:
                        "Member I should be declared before all field definitions.",
                    line: 12,
                    column: 5
                },
                {
                    message:
                        "Member J should be declared before all field definitions.",
                    line: 13,
                    column: 5
                },
                {
                    message:
                        "Member K should be declared before all field definitions.",
                    line: 14,
                    column: 5
                },
                {
                    message:
                        "Member L should be declared before all field definitions.",
                    line: 15,
                    column: 5
                },
                {
                    message:
                        "Member new should be declared before all field definitions.",
                    line: 16,
                    column: 5
                }
            ]
        },
        {
            code: `
// no accessibility === public
interface Foo {
    new();
    A: string;
    G();
    B: string;
    H();
    C: string;
    I();
    D: string;
    J();
    E: string;
    K();
    F: string;
    L();
}
            `,
            parser: "typescript-eslint-parser",
            options: [
                {
                    interfaces: ["constructor", "field", "method"]
                }
            ],
            errors: [
                {
                    message:
                        "Member B should be declared before all method definitions.",
                    line: 7,
                    column: 5
                },
                {
                    message:
                        "Member C should be declared before all method definitions.",
                    line: 9,
                    column: 5
                },
                {
                    message:
                        "Member D should be declared before all method definitions.",
                    line: 11,
                    column: 5
                },
                {
                    message:
                        "Member E should be declared before all method definitions.",
                    line: 13,
                    column: 5
                },
                {
                    message:
                        "Member F should be declared before all method definitions.",
                    line: 15,
                    column: 5
                }
            ]
        },
        {
            code: `
// no accessibility === public
type Foo = {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    G();
    H();
    I();
    J();
    K();
    L();
    new();
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member new should be declared before all method definitions.",
                    line: 16,
                    column: 5
                }
            ]
        },
        {
            code: `
// no accessibility === public
type Foo = {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    G();
    H();
    I();
    J();
    K();
    L();
    new();
}
            `,
            parser: "typescript-eslint-parser",
            options: [{ default: ["method", "constructor", "field"] }],
            errors: [
                {
                    message:
                        "Member G should be declared before all field definitions.",
                    line: 10,
                    column: 5
                },
                {
                    message:
                        "Member H should be declared before all field definitions.",
                    line: 11,
                    column: 5
                },
                {
                    message:
                        "Member I should be declared before all field definitions.",
                    line: 12,
                    column: 5
                },
                {
                    message:
                        "Member J should be declared before all field definitions.",
                    line: 13,
                    column: 5
                },
                {
                    message:
                        "Member K should be declared before all field definitions.",
                    line: 14,
                    column: 5
                },
                {
                    message:
                        "Member L should be declared before all field definitions.",
                    line: 15,
                    column: 5
                },
                {
                    message:
                        "Member new should be declared before all field definitions.",
                    line: 16,
                    column: 5
                }
            ]
        },
        {
            code: `
// no accessibility === public
type Foo = {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    G();
    H();
    I();
    J();
    K();
    L();
    new();
}
            `,
            parser: "typescript-eslint-parser",
            options: [{ typeLiterals: ["method", "constructor", "field"] }],
            errors: [
                {
                    message:
                        "Member G should be declared before all field definitions.",
                    line: 10,
                    column: 5
                },
                {
                    message:
                        "Member H should be declared before all field definitions.",
                    line: 11,
                    column: 5
                },
                {
                    message:
                        "Member I should be declared before all field definitions.",
                    line: 12,
                    column: 5
                },
                {
                    message:
                        "Member J should be declared before all field definitions.",
                    line: 13,
                    column: 5
                },
                {
                    message:
                        "Member K should be declared before all field definitions.",
                    line: 14,
                    column: 5
                },
                {
                    message:
                        "Member L should be declared before all field definitions.",
                    line: 15,
                    column: 5
                },
                {
                    message:
                        "Member new should be declared before all field definitions.",
                    line: 16,
                    column: 5
                }
            ]
        },
        {
            code: `
// no accessibility === public
type Foo = {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    G();
    H();
    I();
    J();
    K();
    L();
    new();
}
            `,
            parser: "typescript-eslint-parser",
            options: [
                {
                    default: ["field", "method", "constructor"],
                    typeLiterals: ["method", "constructor", "field"]
                }
            ],
            errors: [
                {
                    message:
                        "Member G should be declared before all field definitions.",
                    line: 10,
                    column: 5
                },
                {
                    message:
                        "Member H should be declared before all field definitions.",
                    line: 11,
                    column: 5
                },
                {
                    message:
                        "Member I should be declared before all field definitions.",
                    line: 12,
                    column: 5
                },
                {
                    message:
                        "Member J should be declared before all field definitions.",
                    line: 13,
                    column: 5
                },
                {
                    message:
                        "Member K should be declared before all field definitions.",
                    line: 14,
                    column: 5
                },
                {
                    message:
                        "Member L should be declared before all field definitions.",
                    line: 15,
                    column: 5
                },
                {
                    message:
                        "Member new should be declared before all field definitions.",
                    line: 16,
                    column: 5
                }
            ]
        },
        {
            code: `
// no accessibility === public
type Foo = {
    new();
    A: string;
    G();
    B: string;
    H();
    C: string;
    I();
    D: string;
    J();
    E: string;
    K();
    F: string;
    L();
}
            `,
            parser: "typescript-eslint-parser",
            options: [
                {
                    typeLiterals: ["constructor", "field", "method"]
                }
            ],
            errors: [
                {
                    message:
                        "Member B should be declared before all method definitions.",
                    line: 7,
                    column: 5
                },
                {
                    message:
                        "Member C should be declared before all method definitions.",
                    line: 9,
                    column: 5
                },
                {
                    message:
                        "Member D should be declared before all method definitions.",
                    line: 11,
                    column: 5
                },
                {
                    message:
                        "Member E should be declared before all method definitions.",
                    line: 13,
                    column: 5
                },
                {
                    message:
                        "Member F should be declared before all method definitions.",
                    line: 15,
                    column: 5
                }
            ]
        },
        {
            code: `
class Foo {
    public static A: string = "";
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    constructor() {}
    public J() {}
    protected K() {}
    private L() {}
    public static G() {}
    protected static H() {}
    private static I() {}
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member G should be declared before all public instance method definitions.",
                    line: 13,
                    column: 5
                },
                {
                    message:
                        "Member H should be declared before all public instance method definitions.",
                    line: 14,
                    column: 5
                },
                {
                    message:
                        "Member I should be declared before all public instance method definitions.",
                    line: 15,
                    column: 5
                }
            ]
        },
        {
            code: `
class Foo {
    constructor() {}
    public static A: string = "";
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    public J() {}
    protected K() {}
    private L() {}
    public static G() {}
    protected static H() {}
    private static I() {}
}
            `,
            parser: "typescript-eslint-parser",
            options: [{ default: ["field", "constructor", "method"] }],
            errors: [
                {
                    message:
                        "Member A should be declared before all constructor definitions.",
                    line: 4,
                    column: 5
                },
                {
                    message:
                        "Member B should be declared before all constructor definitions.",
                    line: 5,
                    column: 5
                },
                {
                    message:
                        "Member C should be declared before all constructor definitions.",
                    line: 6,
                    column: 5
                },
                {
                    message:
                        "Member D should be declared before all constructor definitions.",
                    line: 7,
                    column: 5
                },
                {
                    message:
                        "Member E should be declared before all constructor definitions.",
                    line: 8,
                    column: 5
                },
                {
                    message:
                        "Member F should be declared before all constructor definitions.",
                    line: 9,
                    column: 5
                }
            ]
        },
        {
            code: `
class Foo {
    constructor() {}
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    public static G() {}
    public static A: string;
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
}
            `,
            options: [{ default: ["field", "method"] }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member A should be declared before all method definitions.",
                    line: 10,
                    column: 5
                }
            ]
        },
        {
            code: `
class Foo {
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
    public static A: string;
    public static G() {}
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    constructor() {}
}
            `,
            options: [{ default: ["method", "field"] }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member G should be declared before all field definitions.",
                    line: 9,
                    column: 5
                }
            ]
        },
        {
            code: `
class Foo {
    public static G() {}
    protected static H() {}
    protected static B: string = "";
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
    public static A: string;
    constructor() {}
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
            options: [{ classes: ["method", "constructor", "field"] }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member I should be declared before all field definitions.",
                    line: 6,
                    column: 5
                },
                {
                    message:
                        "Member J should be declared before all field definitions.",
                    line: 7,
                    column: 5
                },
                {
                    message:
                        "Member K should be declared before all field definitions.",
                    line: 8,
                    column: 5
                },
                {
                    message:
                        "Member L should be declared before all field definitions.",
                    line: 9,
                    column: 5
                },
                {
                    message:
                        "Member constructor should be declared before all field definitions.",
                    line: 11,
                    column: 5
                }
            ]
        },
        {
            code: `
class Foo {
    public static A: string;
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
    constructor() {}
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
            options: [
                {
                    default: ["field", "constructor", "method"],
                    classes: ["method", "constructor", "field"]
                }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member G should be declared before all field definitions.",
                    line: 4,
                    column: 5
                },
                {
                    message:
                        "Member H should be declared before all field definitions.",
                    line: 5,
                    column: 5
                },
                {
                    message:
                        "Member I should be declared before all field definitions.",
                    line: 6,
                    column: 5
                },
                {
                    message:
                        "Member J should be declared before all field definitions.",
                    line: 7,
                    column: 5
                },
                {
                    message:
                        "Member K should be declared before all field definitions.",
                    line: 8,
                    column: 5
                },
                {
                    message:
                        "Member L should be declared before all field definitions.",
                    line: 9,
                    column: 5
                },
                {
                    message:
                        "Member constructor should be declared before all field definitions.",
                    line: 10,
                    column: 5
                }
            ]
        },
        {
            code: `
class Foo {
    private L() {}
    public J() {}
    public static G() {}
    protected static H() {}
    private static I() {}
    protected K() {}
    constructor() {}
    public D: string = "";
    private static C: string = "";
    public static A: string;
    private static C: string = "";
    protected static B: string = "";
    private F: string = "";
    protected static B: string = "";
    protected E: string = "";
}
            `,
            options: [
                {
                    classes: [
                        "public-method",
                        "constructor",
                        "public-field",
                        "private-field",
                        "protected-field"
                    ]
                }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member A should be declared before all private field definitions.",
                    line: 12,
                    column: 5
                },
                {
                    message:
                        "Member F should be declared before all protected field definitions.",
                    line: 15,
                    column: 5
                }
            ]
        },
        {
            code: `
class Foo {
    public static G() {}
    private static I() {}
    public J() {}
    protected static H() {}
    private L() {}
    protected K() {}
    public D: string = "";
    constructor() {}
    public static A: string;
    protected static B: string = "";
    protected E: string = "";
    private static C: string = "";
    private F: string = "";
}
            `,
            options: [
                {
                    classes: [
                        "public-static-method",
                        "static-method",
                        "public-instance-method",
                        "instance-method",
                        "constructor",
                        "public-field",
                        "protected-field",
                        "private-field"
                    ]
                }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member H should be declared before all public instance method definitions.",
                    line: 6,
                    column: 5
                },
                {
                    message:
                        "Member constructor should be declared before all public field definitions.",
                    line: 10,
                    column: 5
                }
            ]
        },
        {
            code: `
class Foo {
    public J() {}
    public static G() {}
    public D: string = "";
    public static A: string = "";
    private L() {}
    constructor() {}
    protected K() {}
    protected static H() {}
    private static I() {}
    protected static B: string = "";
    private static C: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
            parser: "typescript-eslint-parser",
            options: [
                {
                    default: [
                        "public-method",
                        "public-field",
                        "constructor",
                        "method",
                        "field"
                    ]
                }
            ],
            errors: [
                {
                    message:
                        "Member constructor should be declared before all method definitions.",
                    line: 8,
                    column: 5
                }
            ]
        },
        {
            code: `
class Foo {
    public J() {}
    private static I() {}
    public static G() {}
    protected static H() {}
    protected K() {}
    private L() {}
    constructor() {}
    public static A: string;
    private F: string = "";
    protected static B: string = "";
    public D: string = "";
    private static C: string = "";
    protected E: string = "";
}
            `,
            options: [
                {
                    classes: [
                        "public-method",
                        "protected-static-method",
                        "private-static-method",
                        "protected-instance-method",
                        "private-instance-method",
                        "constructor",
                        "field"
                    ]
                }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member G should be declared before all private static method definitions.",
                    line: 5,
                    column: 5
                },
                {
                    message:
                        "Member H should be declared before all private static method definitions.",
                    line: 6,
                    column: 5
                }
            ]
        },
        {
            code: `
class Foo {
    private static I() {}
    protected static H() {}
    protected static B: string = "";
    public static G() {}
    public J() {}
    protected K() {}
    private static C: string = "";
    private L() {}
    private F: string = "";
    protected E: string = "";
    public static A: string;
    public D: string = "";
    constructor() {}
}
            `,
            options: [
                {
                    classes: [
                        "private-instance-method",
                        "protected-static-field"
                    ]
                }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member L should be declared before all protected static field definitions.",
                    line: 10,
                    column: 5
                }
            ]
        },
        {
            code: `
class Foo {
    private L() {}
    private static I() {}
    protected static H() {}
    public static G() {}
    protected static B: string = "";
    public J() {}
    protected K() {}
    private static C: string = "";
    private F: string = "";
    protected E: string = "";
    public static A: string;
    public D: string = "";
    constructor() {}

}
            `,
            options: [
                {
                    default: [
                        "public-instance-method",
                        "protected-static-field"
                    ]
                }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member J should be declared before all protected static field definitions.",
                    line: 8,
                    column: 5
                }
            ]
        },
        {
            code: `
const foo = class Foo {
    public static A: string = "";
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    constructor() {}
    public J() {}
    protected K() {}
    private L() {}
    public static G() {}
    protected static H() {}
    private static I() {}
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member G should be declared before all public instance method definitions.",
                    line: 13,
                    column: 5
                },
                {
                    message:
                        "Member H should be declared before all public instance method definitions.",
                    line: 14,
                    column: 5
                },
                {
                    message:
                        "Member I should be declared before all public instance method definitions.",
                    line: 15,
                    column: 5
                }
            ]
        },
        {
            code: `
const foo = class {
    constructor() {}
    public static A: string = "";
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    public J() {}
    protected K() {}
    private L() {}
    public static G() {}
    protected static H() {}
    private static I() {}
}
            `,
            parser: "typescript-eslint-parser",
            options: [{ default: ["field", "constructor", "method"] }],
            errors: [
                {
                    message:
                        "Member A should be declared before all constructor definitions.",
                    line: 4,
                    column: 5
                },
                {
                    message:
                        "Member B should be declared before all constructor definitions.",
                    line: 5,
                    column: 5
                },
                {
                    message:
                        "Member C should be declared before all constructor definitions.",
                    line: 6,
                    column: 5
                },
                {
                    message:
                        "Member D should be declared before all constructor definitions.",
                    line: 7,
                    column: 5
                },
                {
                    message:
                        "Member E should be declared before all constructor definitions.",
                    line: 8,
                    column: 5
                },
                {
                    message:
                        "Member F should be declared before all constructor definitions.",
                    line: 9,
                    column: 5
                }
            ]
        },
        {
            code: `
const foo = class {
    constructor() {}
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    public static G() {}
    public static A: string;
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
}
            `,
            options: [{ default: ["field", "method"] }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member A should be declared before all method definitions.",
                    line: 10,
                    column: 5
                }
            ]
        },
        {
            code: `
const foo = class {
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
    public static A: string;
    public static G() {}
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    constructor() {}
}
            `,
            options: [{ default: ["method", "field"] }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member G should be declared before all field definitions.",
                    line: 9,
                    column: 5
                }
            ]
        },
        {
            code: `
const foo = class {
    public static G() {}
    protected static H() {}
    protected static B: string = "";
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
    public static A: string;
    constructor() {}
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
            options: [{ classExpressions: ["method", "constructor", "field"] }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member I should be declared before all field definitions.",
                    line: 6,
                    column: 5
                },
                {
                    message:
                        "Member J should be declared before all field definitions.",
                    line: 7,
                    column: 5
                },
                {
                    message:
                        "Member K should be declared before all field definitions.",
                    line: 8,
                    column: 5
                },
                {
                    message:
                        "Member L should be declared before all field definitions.",
                    line: 9,
                    column: 5
                },
                {
                    message:
                        "Member constructor should be declared before all field definitions.",
                    line: 11,
                    column: 5
                }
            ]
        },
        {
            code: `
const foo = class {
    public static A: string;
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
    constructor() {}
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
            options: [
                {
                    default: ["field", "constructor", "method"],
                    classExpressions: ["method", "constructor", "field"]
                }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member G should be declared before all field definitions.",
                    line: 4,
                    column: 5
                },
                {
                    message:
                        "Member H should be declared before all field definitions.",
                    line: 5,
                    column: 5
                },
                {
                    message:
                        "Member I should be declared before all field definitions.",
                    line: 6,
                    column: 5
                },
                {
                    message:
                        "Member J should be declared before all field definitions.",
                    line: 7,
                    column: 5
                },
                {
                    message:
                        "Member K should be declared before all field definitions.",
                    line: 8,
                    column: 5
                },
                {
                    message:
                        "Member L should be declared before all field definitions.",
                    line: 9,
                    column: 5
                },
                {
                    message:
                        "Member constructor should be declared before all field definitions.",
                    line: 10,
                    column: 5
                }
            ]
        },
        {
            code: `
const foo = class {
    private L() {}
    public J() {}
    public static G() {}
    protected static H() {}
    private static I() {}
    protected K() {}
    constructor() {}
    public D: string = "";
    private static C: string = "";
    public static A: string;
    private static C: string = "";
    protected static B: string = "";
    private F: string = "";
    protected static B: string = "";
    protected E: string = "";
}
            `,
            options: [
                {
                    classExpressions: [
                        "public-method",
                        "constructor",
                        "public-field",
                        "private-field",
                        "protected-field"
                    ]
                }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member A should be declared before all private field definitions.",
                    line: 12,
                    column: 5
                },
                {
                    message:
                        "Member F should be declared before all protected field definitions.",
                    line: 15,
                    column: 5
                }
            ]
        },
        {
            code: `
const foo = class {
    public static G() {}
    private static I() {}
    public J() {}
    protected static H() {}
    private L() {}
    protected K() {}
    public D: string = "";
    constructor() {}
    public static A: string;
    protected static B: string = "";
    protected E: string = "";
    private static C: string = "";
    private F: string = "";
}
            `,
            options: [
                {
                    classExpressions: [
                        "public-static-method",
                        "static-method",
                        "public-instance-method",
                        "instance-method",
                        "constructor",
                        "public-field",
                        "protected-field",
                        "private-field"
                    ]
                }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member H should be declared before all public instance method definitions.",
                    line: 6,
                    column: 5
                },
                {
                    message:
                        "Member constructor should be declared before all public field definitions.",
                    line: 10,
                    column: 5
                }
            ]
        },
        {
            code: `
const foo = class {
    public J() {}
    public static G() {}
    public D: string = "";
    public static A: string = "";
    private L() {}
    constructor() {}
    protected K() {}
    protected static H() {}
    private static I() {}
    protected static B: string = "";
    private static C: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
            parser: "typescript-eslint-parser",
            options: [
                {
                    default: [
                        "public-method",
                        "public-field",
                        "constructor",
                        "method",
                        "field"
                    ]
                }
            ],
            errors: [
                {
                    message:
                        "Member constructor should be declared before all method definitions.",
                    line: 8,
                    column: 5
                }
            ]
        },
        {
            code: `
const foo = class {
    public J() {}
    private static I() {}
    public static G() {}
    protected static H() {}
    protected K() {}
    private L() {}
    constructor() {}
    public static A: string;
    private F: string = "";
    protected static B: string = "";
    public D: string = "";
    private static C: string = "";
    protected E: string = "";
}
            `,
            options: [
                {
                    classExpressions: [
                        "public-method",
                        "protected-static-method",
                        "private-static-method",
                        "protected-instance-method",
                        "private-instance-method",
                        "constructor",
                        "field"
                    ]
                }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member G should be declared before all private static method definitions.",
                    line: 5,
                    column: 5
                },
                {
                    message:
                        "Member H should be declared before all private static method definitions.",
                    line: 6,
                    column: 5
                }
            ]
        },
        {
            code: `
const foo = class {
    private static I() {}
    protected static H() {}
    protected static B: string = "";
    public static G() {}
    public J() {}
    protected K() {}
    private static C: string = "";
    private L() {}
    private F: string = "";
    protected E: string = "";
    public static A: string;
    public D: string = "";
    constructor() {}

}
            `,
            options: [
                {
                    classExpressions: [
                        "private-instance-method",
                        "protected-static-field"
                    ]
                }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member L should be declared before all protected static field definitions.",
                    line: 10,
                    column: 5
                }
            ]
        },
        {
            code: `
const foo = class {
    private L() {}
    private static I() {}
    protected static H() {}
    public static G() {}
    protected static B: string = "";
    public J() {}
    protected K() {}
    private static C: string = "";
    private F: string = "";
    protected E: string = "";
    public static A: string;
    public D: string = "";
    constructor() {}

}
            `,
            options: [
                {
                    default: [
                        "public-instance-method",
                        "protected-static-field"
                    ]
                }
            ],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member J should be declared before all protected static field definitions.",
                    line: 8,
                    column: 5
                }
            ]
        },

        {
            code: `
class Foo {
    K = () => {}
    A: string;
    constructor () {}
    J() {}
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member A should be declared before all public instance method definitions.",
                    line: 4,
                    column: 5
                },
                {
                    message:
                        "Member constructor should be declared before all public instance method definitions.",
                    line: 5,
                    column: 5
                }
            ]
        },
        {
            code: `
class Foo {
    J() {}
    constructor () {}
    K = () => {}
    A: string;
}
            `,
            options: [{ default: ["method", "constructor", "field"] }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member K should be declared before all constructor definitions.",
                    line: 5,
                    column: 5
                }
            ]
        },
        {
            code: `
class Foo {
    J() {}
    constructor () {}
    K = () => {}
    L: () => {}
    A: string;
}
            `,
            options: [{ default: ["method", "constructor", "field"] }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member K should be declared before all constructor definitions.",
                    line: 5,
                    column: 5
                },
                {
                    message:
                        "Member L should be declared before all constructor definitions.",
                    line: 6,
                    column: 5
                }
            ]
        },
        {
            code: `
interface Foo {
    K: () => {}
    A: string;
    J();
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member A should be declared before all method definitions.",
                    line: 4,
                    column: 5
                }
            ]
        },
        {
            code: `
interface Foo {
    J();
    A: string;
    K: () => {}
}
            `,
            options: [{ default: ["method", "constructor", "field"] }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member K should be declared before all field definitions.",
                    line: 5,
                    column: 5
                }
            ]
        },
        {
            code: `
type Foo = {
    K: () => {}
    A: string;
    J();
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member A should be declared before all method definitions.",
                    line: 4,
                    column: 5
                }
            ]
        },
        {
            code: `
type Foo = {
    J();
    A: string;
    K: () => {}
}
            `,
            options: [{ default: ["method", "constructor", "field"] }],
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Member K should be declared before all field definitions.",
                    line: 5,
                    column: 5
                }
            ]
        }
    ]
});
