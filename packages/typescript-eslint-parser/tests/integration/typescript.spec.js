"use strict";

const unpad = require("dedent");

const utils = require("./utils");
const verifyAndAssertMessages = utils.verifyAndAssertMessages;

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

    // it("class properties and no-undef", () => {
    //     verifyAndAssertMessages(
    //         "class Lol { foo = 'bar'; }",
    //         { "no-undef": 1 },
    //         []
    //     );
    // });
});
