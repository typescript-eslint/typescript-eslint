"use strict";
const assert = require("assert");

const util = require("../../lib/util");

describe("isTypescript", () => {
    it("should return false", () => {
        assert.strictEqual(util.isTypescript("test.js"), false);
        assert.strictEqual(util.isTypescript("test.jsx"), false);
        assert.strictEqual(util.isTypescript("README.md"), false);
        assert.strictEqual(util.isTypescript("test.d.js"), false);
        assert.strictEqual(util.isTypescript("test.ts.js"), false);
        assert.strictEqual(util.isTypescript("test.ts.map"), false);
        assert.strictEqual(util.isTypescript("test.ts-js"), false);
        assert.strictEqual(util.isTypescript("ts"), false);
    });

    it("should return true", () => {
        assert.strictEqual(util.isTypescript("test.ts"), true);
        assert.strictEqual(util.isTypescript("test.tsx"), true);
        assert.strictEqual(util.isTypescript("test.TS"), true);
        assert.strictEqual(util.isTypescript("test.TSX"), true);
        assert.strictEqual(util.isTypescript("test.d.ts"), true);
        assert.strictEqual(util.isTypescript("test.d.tsx"), true);
        assert.strictEqual(util.isTypescript("test.D.TS"), true);
        assert.strictEqual(util.isTypescript("test.D.TSX"), true);
    });
});

describe("isDefinitionFile", () => {
    it("should return false", () => {
        assert.strictEqual(util.isDefinitionFile("test.js"), false);
        assert.strictEqual(util.isDefinitionFile("test.jsx"), false);
        assert.strictEqual(util.isDefinitionFile("README.md"), false);
        assert.strictEqual(util.isDefinitionFile("test.d.js"), false);
        assert.strictEqual(util.isDefinitionFile("test.ts.js"), false);
        assert.strictEqual(util.isDefinitionFile("test.ts.map"), false);
        assert.strictEqual(util.isDefinitionFile("test.ts-js"), false);
        assert.strictEqual(util.isDefinitionFile("test.ts"), false);
        assert.strictEqual(util.isDefinitionFile("ts"), false);
        assert.strictEqual(util.isDefinitionFile("test.tsx"), false);
        assert.strictEqual(util.isDefinitionFile("test.TS"), false);
        assert.strictEqual(util.isDefinitionFile("test.TSX"), false);
    });

    it("should return true", () => {
        assert.strictEqual(util.isDefinitionFile("test.d.ts"), true);
        assert.strictEqual(util.isDefinitionFile("test.d.tsx"), true);
        assert.strictEqual(util.isDefinitionFile("test.D.TS"), true);
        assert.strictEqual(util.isDefinitionFile("test.D.TSX"), true);
    });
});
