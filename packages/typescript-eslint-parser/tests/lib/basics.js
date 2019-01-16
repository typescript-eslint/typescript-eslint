/**
 * @fileoverview Tests for basic expressions
 * @author Nicholas C. Zakas
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const fs = require("fs"),
    glob = require('glob'),
    { Linter } = require("eslint"),
    testUtils = require("../../tools/test-utils"),
    parser = require("../../");

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

const FIXTURES_DIR = "./tests/fixtures/basics";
const testFiles = glob.sync(`${FIXTURES_DIR}/**/*.src.js`);

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("basics", () => {
    testFiles.forEach(filename => {
        const code = fs.readFileSync(filename, 'utf8');
        test(testUtils.formatSnapshotName(filename, FIXTURES_DIR), testUtils.createSnapshotTestBlock(code));
    });

    test("https://github.com/eslint/typescript-eslint-parser/issues/476", () => {
        const linter = new Linter();
        const code = `
export const Price: React.SFC<PriceProps> = function Price(props) {}
`;
        const config = {
            parser: "typescript-eslint-parser",
            rules: {
                test: "error"
            }
        };

        linter.defineParser("typescript-eslint-parser", parser);
        linter.defineRule("test", context => ({
            TSTypeReference(node) {
                const name = context.getSourceCode().getText(node.typeName);
                context.report({
                    node,
                    message: "called on {{name}}",
                    data: { name }
                });
            }
        }));

        const messages = linter.verify(code, config, { filename: "issue.ts" });

        expect(messages).toStrictEqual([
            {
                column: 21,
                endColumn: 42,
                endLine: 2,
                line: 2,
                message: "called on React.SFC",
                nodeType: "TSTypeReference",
                ruleId: "test",
                severity: 2,
                source: "export const Price: React.SFC<PriceProps> = function Price(props) {}"
            },
            {
                column: 31,
                endColumn: 41,
                endLine: 2,
                line: 2,
                message: "called on PriceProps",
                nodeType: "TSTypeReference",
                ruleId: "test",
                severity: 2,
                source: "export const Price: React.SFC<PriceProps> = function Price(props) {}"
            }
        ]);
    });
});
