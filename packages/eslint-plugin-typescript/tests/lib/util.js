"use strict";
const assert = require("assert");

const util = require("../../lib/util");

describe("isTypescript", () => {
    it("returns false for non-typescript files", () => {
        const invalid = [
            "test.js",
            "test.jsx",
            "README.md",
            "test.d.js",
            "test.ts.js",
            "test.ts.map",
            "test.ts-js",
            "ts",
        ];

        invalid.forEach(f => {
            assert.strictEqual(util.isTypescript(f), false);
        });
    });

    it("returns true for typescript files", () => {
        const valid = [
            "test.ts",
            "test.tsx",
            "test.TS",
            "test.TSX",
            "test.d.ts",
            "test.d.tsx",
            "test.D.TS",
            "test.D.TSX",
        ];

        valid.forEach(f => {
            assert.strictEqual(util.isTypescript(f), true);
        });
    });
});

describe("isDefinitionFile", () => {
    it("returns false for non-definition files", () => {
        const invalid = [
            "test.js",
            "test.jsx",
            "README.md",
            "test.d.js",
            "test.ts.js",
            "test.ts.map",
            "test.ts-js",
            "test.ts",
            "ts",
            "test.tsx",
            "test.TS",
            "test.TSX",
        ];

        invalid.forEach(f => {
            assert.strictEqual(util.isDefinitionFile(f), false);
        });
    });

    it("returns true for definition files", () => {
        const valid = ["test.d.ts", "test.d.tsx", "test.D.TS", "test.D.TSX"];

        valid.forEach(f => {
            assert.strictEqual(util.isDefinitionFile(f), true);
        });
    });
});

describe("deepMerge", () => {
    it("creates a brand new object", () => {
        const a = {};
        const b = {};
        const result = util.deepMerge(a, b);

        assert.notStrictEqual(result, a);
        assert.notStrictEqual(result, b);
    });

    it("deeply merges objects", () => {
        const a = {
            stringA1: "asdf",
            numberA1: 1,
            boolA1: true,
            arrayA1: [1, 2, 3],
            objA1: {
                stringA2: "fsda",
                numberA2: 2,
                boolA2: false,
                arrayA2: [3, 2, 1],
                objA2: {},
            },
        };
        const b = {
            stringB1: "asdf",
            numberB1: 1,
            boolB1: true,
            arrayB1: [1, 2, 3],
            objB1: {
                stringB2: "fsda",
                numberB2: 2,
                boolB2: false,
                arrayB2: [3, 2, 1],
                objB2: {},
            },
        };

        assert.deepStrictEqual(util.deepMerge(a, b), Object.assign({}, a, b));
    });

    it("deeply overwrites properties in the first one with the second", () => {
        const a = {
            prop1: {
                prop2: "hi",
            },
        };
        const b = {
            prop1: {
                prop2: "bye",
            },
        };

        assert.deepStrictEqual(util.deepMerge(a, b), b);
    });
});

describe("applyDefault", () => {
    it("returns a clone of the default if no options given", () => {
        const defaults = [
            {
                prop: "setting",
            },
        ];
        const user = null;
        const result = util.applyDefault(defaults, user);

        assert.deepStrictEqual(result, defaults);
        assert.notStrictEqual(result, defaults);
    });

    it("returns applies a deepMerge to each element in the array", () => {
        const defaults = [
            {
                prop: "setting1",
            },
            {
                prop: "setting2",
            },
        ];
        const user = [
            {
                prop: "new",
                other: "something",
            },
        ];
        const result = util.applyDefault(defaults, user);

        assert.deepStrictEqual(result, [
            {
                prop: "new",
                other: "something",
            },
            {
                prop: "setting2",
            },
        ]);
        assert.notStrictEqual(result, defaults);
        assert.notStrictEqual(result, user);
    });

    it("returns a brand new array", () => {
        const defaults = [];
        const user = [];
        const result = util.applyDefault(defaults, user);

        assert.notStrictEqual(result, defaults);
        assert.notStrictEqual(result, user);
    });
});

describe("upperCaseFirst", () => {
    it("upper cases first", () => {
        assert.strictEqual(util.upperCaseFirst("hello"), "Hello");
    });
});
