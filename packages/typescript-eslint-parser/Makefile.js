/**
 * @fileoverview Build file
 * @author nzakas
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */
/* global echo, exit, find, target */

"use strict";

/* eslint no-console: 0*/
//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

require("shelljs/make");

const checker = require("npm-license"),
    nodeCLI = require("shelljs-nodecli");

//------------------------------------------------------------------------------
// Settings
//------------------------------------------------------------------------------

const OPEN_SOURCE_LICENSES = [
    /MIT/, /BSD/, /Apache/, /ISC/, /WTF/, /Public Domain/
];

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Generates a function that matches files with a particular extension.
 * @param {string} extension The file extension (i.e. "js")
 * @returns {Function} The function to pass into a filter method.
 * @private
 */
function fileType(extension) {
    return function(filename) {
        return filename.substring(filename.lastIndexOf(".") + 1) === extension;
    };
}

//------------------------------------------------------------------------------
// Data
//------------------------------------------------------------------------------

const JEST = "jest",
    LINT_OPTIONS = "--report-unused-disable-directives",

    // Files
    MAKEFILE = "./Makefile.js",
    JS_FILES = "parser.js",
    TEST_FILES = find("tests/lib/").filter(fileType("js")).join(" "),
    TOOLS_FILES = find("tools/").filter(fileType("js")).join(" ");

//------------------------------------------------------------------------------
// Tasks
//------------------------------------------------------------------------------

target.all = function() {
    target.test();
};

target.lint = function() {
    let errors = 0,
        lastReturn;

    echo("Validating Makefile.js");
    lastReturn = nodeCLI.exec("eslint", MAKEFILE, LINT_OPTIONS);
    if (lastReturn.code !== 0) {
        errors++;
    }

    echo("Validating JavaScript files");
    lastReturn = nodeCLI.exec("eslint", JS_FILES, LINT_OPTIONS);
    if (lastReturn.code !== 0) {
        errors++;
    }

    echo("Validating JavaScript test files");
    lastReturn = nodeCLI.exec("eslint", TEST_FILES, LINT_OPTIONS);
    if (lastReturn.code !== 0) {
        errors++;
    }

    echo("Validating JavaScript tools files");
    lastReturn = nodeCLI.exec("eslint", TOOLS_FILES, LINT_OPTIONS);
    if (lastReturn.code !== 0) {
        errors++;
    }

    if (errors) {
        exit(1);
    }
};

target.test = function() {
    target.lint();

    const lastReturn = nodeCLI.exec(JEST);
    let errors = 0;

    if (lastReturn.code !== 0) {
        errors++;
    }

    if (errors) {
        exit(1);
    }

    // target.checkLicenses();
};

target.docs = function() {
    echo("Generating documentation");
    nodeCLI.exec("jsdoc", "-d jsdoc lib");
    echo("Documentation has been output to /jsdoc");
};

target.checkLicenses = function() {

    /**
     * Returns true if the given dependency's licenses are all permissable for use in OSS
     * @param  {Object}  dependency object containing the name and licenses of the given dependency
     * @returns {boolean} is permissable dependency
     */
    function isPermissible(dependency) {
        const licenses = dependency.licenses;

        if (Array.isArray(licenses)) {
            return licenses.some(license => isPermissible({
                name: dependency.name,
                licenses: license
            }));
        }

        return OPEN_SOURCE_LICENSES.some(license => license.test(licenses));
    }

    echo("Validating licenses");

    checker.init({
        start: __dirname
    }, deps => {
        const impermissible = Object.keys(deps).map(dependency => ({
            name: dependency,
            licenses: deps[dependency].licenses
        })).filter(dependency => !isPermissible(dependency));

        if (impermissible.length) {
            impermissible.forEach(dependency => {
                console.error("%s license for %s is impermissible.",
                    dependency.licenses,
                    dependency.name
                );
            });
            exit(1);
        }
    });
};
