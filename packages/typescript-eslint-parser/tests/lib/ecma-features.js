/**
 * @fileoverview Tests for ECMA feature flags
 * @author Nicholas C. Zakas
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const path = require("path"),
    shelljs = require("shelljs"),
    testUtils = require("../../tools/test-utils");

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

const FIXTURES_DIR = "./tests/fixtures/ecma-features";

const testFiles = shelljs.find(FIXTURES_DIR)
    .filter(filename => filename.indexOf(".src.js") > -1)
    // strip off ".src.js"
    .map(filename => filename.substring(FIXTURES_DIR.length - 1, filename.length - 7))
    .filter(filename => !(/error-|invalid-|globalReturn/.test(filename)));

const regexFilenames = [
    "regexYFlag/regexp-y-simple",
    "regexUFlag/regex-u-simple",
    "regexUFlag/regex-u-extended-escape"
];

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("ecmaFeatures", () => {

    testFiles.forEach(filename => {

        // Uncomment and fill in filename to focus on a single file
        // var filename = "jsx/invalid-matching-placeholder-in-closing-tag";
        const feature = path.dirname(filename),
            code = shelljs.cat(`${path.resolve(FIXTURES_DIR, filename)}.src.js`),
            config = {
                loc: true,
                range: true,
                tokens: true,
                ecmaFeatures: {},
                errorOnUnknownASTType: true
            };

        if (regexFilenames.indexOf(filename) === -1) {
            test(`fixtures/${filename}.src`, () => {
                config.ecmaFeatures[feature] = true;
                testUtils.createSnapshotTestBlock(code, config)();
            });
            return;
        }

        /**
         * Some regexp flags have different ASTs depending on the current node version,
         * so we need to account for this in our test cases.
         *
         * NOTE: When running the tests for node v5, for example, the snapshots for node v6
         * are irrelevant. Therefore, in order to prevent Jest from marking them as obsolete
         * (which would cause the tests to exit with code 1), we make use of `test.skip`.
         */
        const nodeVersions = process.versions;
        const nodeVersionParts = nodeVersions.node.split(".");
        const nodeMajorVersion = parseInt(nodeVersionParts[0], 10);
        const NODE_6_AND_ABOVE = `REGEXP FLAG - NODE VERSION >=6: fixtures/${filename}.src`;
        const NODE_PRE_6 = `REGEXP FLAG - NODE VERSION <6: fixtures/${filename}.src`;

        if (nodeMajorVersion >= 6) {
            test.skip(NODE_PRE_6);
            test(NODE_6_AND_ABOVE, () => {
                config.ecmaFeatures[feature] = true;
                testUtils.createSnapshotTestBlock(code, config)();
            });
        } else {
            test.skip(NODE_6_AND_ABOVE);
            test(NODE_PRE_6, () => {
                config.ecmaFeatures[feature] = true;
                testUtils.createSnapshotTestBlock(code, config)();
            });
        }

    });


});
