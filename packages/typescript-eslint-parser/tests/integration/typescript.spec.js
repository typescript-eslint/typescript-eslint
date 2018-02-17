"use strict";

const unpad = require("dedent");

const utils = require("./utils");
const verifyAndAssertMessages = utils.verifyAndAssertMessages;
const loadExternalFixture = utils.loadExternalFixture;

describe("TypeScript", () => {
    it("should fundamentally work with `eslint:all`", () => {
        verifyAndAssertMessages(
            unpad(`
                "use strict";
                const foo: string = "bar";
            `),
            {},
            ["2:7 'foo' is assigned a value but never used. no-unused-vars"],
            "script",
            {
                baseConfig: {
                    extends: ["eslint:all"],
                    rules: {
                        "eol-last": "off"
                    }
                }
            }
        );
    });

    it("should not cause a RangeError within the indent rule (#333)", () => {
        verifyAndAssertMessages(
            loadExternalFixture("range-error-indent"),
            {
                indent: "error"
            },
            []
        );
    });

    it("should not throw in any rules on method overloads (#389)", () => {
        verifyAndAssertMessages(
            unpad(`
                export class Test {
                    public test(param1: Number): Test;
                    public test(param1: Test): Test;
                    public test(param1: any): Test {
                        return new Test();
                    }
                }
            `),
            {
                "array-callback-return": "error",
                "getter-return": "error",
                strict: "error",
                "lines-around-directive": "error",
                "no-empty-function": "error"
            },
            []
        );
    });

    it("should not throw in any rules on abstract class methods (#400)", () => {
        verifyAndAssertMessages(
            unpad(`
                export abstract class TestAbstract {
                    onCreated?(): Promise<void> | any;
                }
                export abstract class AbstractSocket {
                    abstract createSocket(): Promise<string>;
                }
            `),
            {
                "array-callback-return": "error",
                "getter-return": "error",
                strict: "error",
                "lines-around-directive": "error",
                "no-empty-function": "error"
            },
            []
        );
    });

    it("should not produce any lint errors on valid JSDoc indentation (#344 & #422)", () => {
        verifyAndAssertMessages(
            loadExternalFixture("jsdoc-indent"),
            {
                indent: "error"
            },
            []
        );
    });

    it("should not produce a parse error (#403)", () => {
        verifyAndAssertMessages(
            unpad(`
                class X {
                    data() {
                        return {
                            form: {
                                startDate: <Date | undefined> undefined
                            }
                        };
                    }
                }
            `),
            {},
            [],
            "script",
            {
                parserOptions: {
                    jsx: false
                }
            }
        );
    });

    it("should not produce any lint errors for no-declare on overloaded functions (#402)", () => {
        verifyAndAssertMessages(
            loadExternalFixture("no-redeclare-overloaded-functions"),
            {
                "no-redeclare": "error"
            },
            []
        );
    });

    it("should not throw any TypeErrors when parsing declared empty body functions using eslint:all (#162)", () => {
        verifyAndAssertMessages(
            loadExternalFixture("declared-empty-body-functions"),
            {},
            [
                "3:19 'FF' is not defined. no-undef",
                "4:11 'Foo' is defined but never used. no-unused-vars",
                "4:23 'Bar' is not defined. no-undef",
                "4:31 Block must be padded by blank lines. padded-blocks",
                "6:5 Block must be padded by blank lines. padded-blocks",
                "10:11 'Foo' is already defined. no-redeclare",
                "10:23 'Bar' is not defined. no-undef",
                "10:31 Block must be padded by blank lines. padded-blocks",
                "12:5 Block must be padded by blank lines. padded-blocks",
                "15:15 'Foo' is already defined. no-redeclare",
                "15:27 'Bar' is not defined. no-undef",
                "15:35 Block must be padded by blank lines. padded-blocks",
                "17:1 Block must be padded by blank lines. padded-blocks",
                "19:19 'd3' is not defined. no-undef",
                "20:21 'select' is not defined. no-undef",
                "20:28 'selector' is not defined. no-undef",
                "20:47 'Selection' is not defined. no-undef",
                "21:2 Newline required at end of file but not found. eol-last"
            ],
            "script",
            {
                baseConfig: {
                    extends: ["eslint:all"]
                }
            }
        );
    });

    it("should correctly apply no-unreachable on TS-constructs (#127)", () => {
        verifyAndAssertMessages(
            unpad(`
                export namespace foo {
                    export function bar() {
                        return;
                    }
                }
                export type Qux = true;
            `),
            {
                "no-unreachable": 2
            },
            []
        );
    });

    // it("should not produce a false positive for no-restricted-globals rule (#350)", () => {
    //     verifyAndAssertMessages(
    //         unpad(`
    //             type foo = {
    //                 location: any;
    //             };
    //         `),
    //         {
    //             "no-restricted-globals": [2, "location"]
    //         },
    //         []
    //     );
    // });

    // it("should not throw a TypeError in the indent rule for invalid code (#309)", () => {
    //     verifyAndAssertMessages(
    //         unpad(`
    //             const
    //         `),
    //         {
    //             indent: "error"
    //         },
    //         []
    //     );
    // });

    // it("class properties and no-undef", () => {
    //     verifyAndAssertMessages(
    //         "class Lol { foo = 'bar'; }",
    //         { "no-undef": 1 },
    //         []
    //     );
    // });
});
