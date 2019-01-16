/**
 * @fileoverview Tests for TSX-specific constructs
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const
    path = require("path"),
    { Linter } = require("eslint"),
    shelljs = require("shelljs"),
    parser = require("../../"),
    testUtils = require("../../tools/test-utils");

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

const TSX_FIXTURES_DIR = "./tests/fixtures/tsx";

const testFiles = shelljs.find(TSX_FIXTURES_DIR)
    .filter(filename => filename.indexOf(".src.tsx") > -1)
    // strip off ".src.tsx"
    .map(filename => filename.substring(TSX_FIXTURES_DIR.length - 1, filename.length - 8));

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("TSX", () => {
    testFiles.forEach(filename => {
        const code = shelljs.cat(`${path.resolve(TSX_FIXTURES_DIR, filename)}.src.tsx`);
        const config = {
            useJSXTextNode: true,
            jsx: true
        };
        test(`fixtures/${filename}.src`, testUtils.createSnapshotTestBlock(code, config));
    });

    describe("if the filename ends with '.tsx', enable jsx option automatically.", () => {
        const linter = new Linter();
        linter.defineParser("typescript-eslint-parser", parser);

        test("filePath was not provided", () => {
            const code = "const element = <T/>";
            const config = {
                parser: "typescript-eslint-parser"
            };
            const messages = linter.verify(code, config);

            expect(messages).toStrictEqual([{
                column: 18,
                fatal: true,
                line: 1,
                message: "Parsing error: '>' expected.",
                ruleId: null,
                severity: 2,
                source: "const element = <T/>"
            }]);
        });

        test("filePath was not provided and 'jsx:true' option", () => {
            const code = "const element = <T/>";
            const config = {
                parser: "typescript-eslint-parser",
                parserOptions: {
                    jsx: true
                }
            };
            const messages = linter.verify(code, config);

            expect(messages).toStrictEqual([]);
        });

        test("test.ts", () => {
            const code = "const element = <T/>";
            const config = {
                parser: "typescript-eslint-parser"
            };
            const messages = linter.verify(code, config, { filename: "test.ts" });

            expect(messages).toStrictEqual([{
                column: 18,
                fatal: true,
                line: 1,
                message: "Parsing error: '>' expected.",
                ruleId: null,
                severity: 2,
                source: "const element = <T/>"
            }]);
        });

        test("test.ts with 'jsx:true' option", () => {
            const code = "const element = <T/>";
            const config = {
                parser: "typescript-eslint-parser",
                parserOptions: {
                    jsx: true
                }
            };
            const messages = linter.verify(code, config, { filename: "test.ts" });

            expect(messages).toStrictEqual([{
                column: 18,
                fatal: true,
                line: 1,
                message: "Parsing error: '>' expected.",
                ruleId: null,
                severity: 2,
                source: "const element = <T/>"
            }]);
        });

        test("test.tsx", () => {
            const code = "const element = <T/>";
            const config = {
                parser: "typescript-eslint-parser"
            };
            const messages = linter.verify(code, config, { filename: "test.tsx" });

            expect(messages).toStrictEqual([]);
        });

        test("test.tsx with 'jsx:false' option", () => {
            const code = "const element = <T/>";
            const config = {
                parser: "typescript-eslint-parser",
                parserOptions: {
                    jsx: false
                }
            };
            const messages = linter.verify(code, config, { filename: "test.tsx" });

            expect(messages).toStrictEqual([]);
        });
    });
});
