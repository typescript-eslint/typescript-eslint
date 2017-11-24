/**
 * @fileoverview Disallows parameter properties in class constructors.
 * @author Patricio Trevino
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/no-parameter-properties"),
    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
    parser: "typescript-eslint-parser"
});

ruleTester.run("no-parameter-properties", rule, {
    valid: [
        `
class Foo {
    constructor(name: string) {}
}
        `,
        `
class Foo {
    constructor(name: string, age: number) {}
}
        `,
        `
class Foo {
    constructor(name: string);
    constructor(name: string, age?: number) {}
}
        `,
        {
            code: `
class Foo {
    constructor(readonly name: string) { }
}
            `,
            options: [{ allows: ["readonly"] }]
        },
        {
            code: `
class Foo {
    constructor(private name: string) { }
}
            `,
            options: [{ allows: ["private"] }]
        },
        {
            code: `
class Foo {
    constructor(protected name: string) { }
}
            `,
            options: [{ allows: ["protected"] }]
        },
        {
            code: `
class Foo {
    constructor(public name: string) { }
}
            `,
            options: [{ allows: ["public"] }]
        },
        {
            code: `
class Foo {
    constructor(private readonly name: string) { }
}
            `,
            options: [{ allows: ["private readonly"] }]
        },
        {
            code: `
class Foo {
    constructor(protected readonly name: string) { }
}
            `,
            options: [{ allows: ["protected readonly"] }]
        },
        {
            code: `
class Foo {
    constructor(public readonly name: string) { }
}
            `,
            options: [{ allows: ["public readonly"] }]
        },
        {
            code: `
class Foo {
    constructor(readonly name: string, private age: number) { }
}
            `,
            options: [{ allows: ["readonly", "private"] }]
        },
        {
            code: `
class Foo {
    constructor(public readonly name: string, private age: number) { }
}
            `,
            options: [{ allows: ["public readonly", "private"] }]
        }
    ],
    invalid: [
        {
            code: `
class Foo {
    constructor(readonly name: string) {}
}
            `,
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 3,
                    column: 17
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(private name: string) {}
}
            `,
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 3,
                    column: 17
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(protected name: string) {}
}
            `,
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 3,
                    column: 17
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(public name: string) {}
}
            `,
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 3,
                    column: 17
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(private readonly name: string) {}
}
            `,
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 3,
                    column: 17
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(protected readonly name: string) {}
}
            `,
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 3,
                    column: 17
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(public readonly name: string) {}
}
            `,
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 3,
                    column: 17
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(public name: string, age: number) {}
}
            `,
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 3,
                    column: 17
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(private name: string, private age: number) {}
}
            `,
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 3,
                    column: 17
                },
                {
                    message:
                        "Property age cannot be declared in the constructor",
                    line: 3,
                    column: 39
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(protected name: string, protected age: number) {}
}
            `,
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 3,
                    column: 17
                },
                {
                    message:
                        "Property age cannot be declared in the constructor",
                    line: 3,
                    column: 41
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(public name: string, public age: number) {}
}
            `,
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 3,
                    column: 17
                },
                {
                    message:
                        "Property age cannot be declared in the constructor",
                    line: 3,
                    column: 38
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(name: string);
    constructor(private name: string, age?: number) {}
}
            `,
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(private name: string);
    constructor(private name: string, age?: number) {}
}
            `,
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 3,
                    column: 17
                },
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(private name: string);
    constructor(private name: string, private age?: number) {}
}
            `,
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 3,
                    column: 17
                },
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 4,
                    column: 17
                },
                {
                    message:
                        "Property age cannot be declared in the constructor",
                    line: 4,
                    column: 39
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(name: string);
    constructor(protected name: string, age?: number) {}
}
            `,
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(protected name: string);
    constructor(protected name: string, age?: number) {}
}
            `,
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 3,
                    column: 17
                },
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(protected name: string);
    constructor(protected name: string, protected age?: number) {}
}
            `,
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 3,
                    column: 17
                },
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 4,
                    column: 17
                },
                {
                    message:
                        "Property age cannot be declared in the constructor",
                    line: 4,
                    column: 41
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(name: string);
    constructor(public name: string, age?: number) {}
}
            `,
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(public name: string);
    constructor(public name: string, age?: number) {}
}
            `,
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 3,
                    column: 17
                },
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 4,
                    column: 17
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(public name: string);
    constructor(public name: string, public age?: number) {}
}
            `,
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 3,
                    column: 17
                },
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 4,
                    column: 17
                },
                {
                    message:
                        "Property age cannot be declared in the constructor",
                    line: 4,
                    column: 38
                }
            ]
        },

        {
            code: `
class Foo {
    constructor(readonly name: string) {}
}
            `,
            options: [{ allows: ["private"] }],
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 3,
                    column: 17
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(private name: string) {}
}
            `,
            options: [{ allows: ["readonly"] }],
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 3,
                    column: 17
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(protected name: string) {}
}
            `,
            options: [
                {
                    allows: [
                        "readonly",
                        "private",
                        "public",
                        "protected readonly"
                    ]
                }
            ],
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 3,
                    column: 17
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(public name: string) {}
}
            `,
            options: [
                {
                    allows: [
                        "readonly",
                        "private",
                        "protected",
                        "protected readonly",
                        "public readonly"
                    ]
                }
            ],
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 3,
                    column: 17
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(private readonly name: string) {}
}
            `,
            options: [{ allows: ["readonly", "private"] }],
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 3,
                    column: 17
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(protected readonly name: string) {}
}
            `,
            options: [
                {
                    allows: [
                        "readonly",
                        "protected",
                        "private readonly",
                        "public readonly"
                    ]
                }
            ],
            errors: [
                {
                    message:
                        "Property name cannot be declared in the constructor",
                    line: 3,
                    column: 17
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(private name: string);
    constructor(private name: string, protected age?: number) {}
}
            `,
            options: [{ allows: ["private"] }],
            errors: [
                {
                    message:
                        "Property age cannot be declared in the constructor",
                    line: 4,
                    column: 39
                }
            ]
        }
    ]
});
