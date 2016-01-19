/**
 * @fileoverview Build file
 * @author nzakas
 */
/* global cat, cp, echo, exec, exit, find, mkdir, mv, rm, target, test */

"use strict";

/* eslint no-console: 0*/
//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

require("shelljs/make");

var checker = require("npm-license"),
    dateformat = require("dateformat"),
    nodeCLI = require("shelljs-nodecli"),
    semver = require("semver");

//------------------------------------------------------------------------------
// Settings
//------------------------------------------------------------------------------

var OPEN_SOURCE_LICENSES = [
    /MIT/, /BSD/, /Apache/, /ISC/, /WTF/, /Public Domain/
];

//------------------------------------------------------------------------------
// Data
//------------------------------------------------------------------------------

var NODE_MODULES = "./node_modules/",
    TEMP_DIR = "./tmp/",
    BUILD_DIR = "./build/",

    // Utilities - intentional extra space at the end of each string
    MOCHA = NODE_MODULES + "mocha/bin/_mocha ",

    // Files
    MAKEFILE = "./Makefile.js",
    /* eslint-disable no-use-before-define */
    JS_FILES = find("lib/").filter(fileType("js")).join(" ") + " espree.js",
    TEST_FILES = find("tests/lib/").filter(fileType("js")).join(" ");
    /* eslint-enable no-use-before-define */

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

/**
 * Executes a command and returns the output instead of printing it to stdout.
 * @param {string} cmd The command string to execute.
 * @returns {string} The result of the executed command.
 */
function execSilent(cmd) {
    return exec(cmd, { silent: true }).output;
}

/**
 * Creates a release version tag and pushes to origin.
 * @param {string} type The type of release to do (patch, minor, major)
 * @returns {void}
 */
function release(type) {
    var newVersion;

    target.test();
    newVersion = execSilent("npm version " + type).trim();
    target.changelog();

    // add changelog to commit
    exec("git add CHANGELOG.md");
    exec("git commit --amend --no-edit");

    // replace existing tag
    exec("git tag -f " + newVersion);

    // push all the things
    exec("git push origin master --tags");
    exec("npm publish");
}


/**
 * Splits a command result to separate lines.
 * @param {string} result The command result string.
 * @returns {array} The separated lines.
 */
function splitCommandResultToLines(result) {
    return result.trim().split("\n");
}

/**
 * Returns a list of sorted, valid semtantic-verisioning git tags
 * @returns {string[]} The version tags
 */
function getVersionTags() {
    var tags = splitCommandResultToLines(exec("git tag", { silent: true }).output);

    return tags.reduce(function(list, tag) {
        if (semver.valid(tag)) {
            list.push(tag);
        }
        return list;
    }, []).sort(semver.compare);
}

//------------------------------------------------------------------------------
// Tasks
//------------------------------------------------------------------------------

target.all = function() {
    target.test();
};

target.lint = function() {
    var errors = 0,
        lastReturn;

    echo("Validating Makefile.js");
    lastReturn = nodeCLI.exec("eslint", MAKEFILE);
    if (lastReturn.code !== 0) {
        errors++;
    }

    echo("Validating JavaScript files");
    lastReturn = nodeCLI.exec("eslint", JS_FILES);
    if (lastReturn.code !== 0) {
        errors++;
    }

    echo("Validating JavaScript test files");
    lastReturn = nodeCLI.exec("eslint", TEST_FILES);
    if (lastReturn.code !== 0) {
        errors++;
    }

    if (errors) {
        exit(1);
    }
};

target.test = function() {
    // target.lint();

    var errors = 0,
        lastReturn;

    lastReturn = nodeCLI.exec("istanbul", "cover", MOCHA, "-- -c", TEST_FILES);

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

target.browserify = function() {

    // 1. create temp and build directory
    if (!test("-d", TEMP_DIR)) {
        mkdir(TEMP_DIR);
        mkdir(TEMP_DIR + "/lib");
    }

    if (!test("-d", BUILD_DIR)) {
        mkdir(BUILD_DIR);
    }

    // 2. copy files into temp directory
    cp("-r", "lib/*", TEMP_DIR + "/lib");
    cp("espree.js", TEMP_DIR);
    cp("package.json", TEMP_DIR);


    // 3. browserify the temp directory
    nodeCLI.exec("browserify", TEMP_DIR + "espree.js", "-o", BUILD_DIR + "espree.js", "-s espree");

    // 4. remove temp directory
    rm("-r", TEMP_DIR);
};

target.changelog = function() {

    // get most recent two tags
    var tags = getVersionTags(),
        rangeTags = tags.slice(tags.length - 2),
        now = new Date(),
        timestamp = dateformat(now, "mmmm d, yyyy");

    // output header
    (rangeTags[1] + " - " + timestamp + "\n").to("CHANGELOG.tmp");

    // get log statements
    var logs = exec("git log --pretty=format:\"* %s (%an)\" " + rangeTags.join(".."), {silent: true}).output.split(/\n/g);
    logs = logs.filter(function(line) {
        return line.indexOf("Merge pull request") === -1 && line.indexOf("Merge branch") === -1;
    });
    logs.push(""); // to create empty lines
    logs.unshift("");

    // output log statements
    logs.join("\n").toEnd("CHANGELOG.tmp");

    // switch-o change-o
    cat("CHANGELOG.tmp", "CHANGELOG.md").to("CHANGELOG.md.tmp");
    rm("CHANGELOG.tmp");
    rm("CHANGELOG.md");
    mv("CHANGELOG.md.tmp", "CHANGELOG.md");
};

target.checkLicenses = function() {

    /**
     * Returns true if the given dependency's licenses are all permissable for use in OSS
     * @param  {object}  dependency object containing the name and licenses of the given dependency
     * @returns {boolean} is permissable dependency
     */
    function isPermissible(dependency) {
        var licenses = dependency.licenses;

        if (Array.isArray(licenses)) {
            return licenses.some(function(license) {
                return isPermissible({
                    name: dependency.name,
                    licenses: license
                });
            });
        }

        return OPEN_SOURCE_LICENSES.some(function(license) {
            return license.test(licenses);
        });
    }

    echo("Validating licenses");

    checker.init({
        start: __dirname
    }, function(deps) {
        var impermissible = Object.keys(deps).map(function(dependency) {
            return {
                name: dependency,
                licenses: deps[dependency].licenses
            };
        }).filter(function(dependency) {
            return !isPermissible(dependency);
        });

        if (impermissible.length) {
            impermissible.forEach(function(dependency) {
                console.error("%s license for %s is impermissible.",
                    dependency.licenses,
                    dependency.name
                );
            });
            exit(1);
        }
    });
};

target.patch = function() {
    release("patch");
};

target.minor = function() {
    release("minor");
};

target.major = function() {
    release("major");
};
