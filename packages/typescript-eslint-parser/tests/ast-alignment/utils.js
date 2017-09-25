"use strict";

const isPlainObject = require("lodash.isplainobject");

/**
 * By default, pretty-format (within Jest matchers) retains the names/types of nodes from the babylon AST,
 * quick and dirty way to avoid that is to JSON.stringify and then JSON.parser the
 * ASTs before comparing them with pretty-format
 *
 * @param {Object} ast raw AST
 * @returns {Object} normalized AST
 */
function normalizeNodeTypes(ast) {
    return JSON.parse(JSON.stringify(ast));
}

/**
 * Removes the given keys from the given AST object recursively
 * @param {Object} obj A JavaScript object to remove keys from
 * @param {Object[]} keysToOmit Names and predicate functions use to determine what keys to omit from the final object
 * @returns {Object} formatted object
 */
function omitDeep(obj, keysToOmit) {
    keysToOmit = keysToOmit || [];
    function shouldOmit(keyName, val) { // eslint-disable-line
        if (!keysToOmit || !keysToOmit.length) {
            return false;
        }
        for (const keyConfig of keysToOmit) {
            if (keyConfig.key !== keyName) {
                continue;
            }
            return keyConfig.predicate(val);
        }
        return false;
    }

    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) {
            continue;
        }
        const val = obj[key];
        if (isPlainObject(val)) {
            if (shouldOmit(key, val)) {
                delete obj[key];
                // re-run with the same arguments
                // in case the object has multiple keys to omit
                return omitDeep(obj, keysToOmit);
            }
            omitDeep(val, keysToOmit);
        } else if (Array.isArray(val)) {
            if (shouldOmit(key, val)) {
                delete obj[key];
                // re-run with the same arguments
                // in case the object has multiple keys to omit
                return omitDeep(obj, keysToOmit);
            }
            for (const i of val) {
                omitDeep(i, keysToOmit);
            }
        } else if (shouldOmit(key, val)) {
            delete obj[key];
            // re-run with the same arguments
            // in case the object has multiple keys to omit
            return omitDeep(obj, keysToOmit);
        }
    }
    return obj;
}

/* eslint-disable */
/**
 * Common predicates for Babylon AST preprocessing
 */
const always = () => true;
const ifNumber = (val) => typeof val === "number";
/* eslint-enable */

/**
 * - Babylon wraps the "Program" node in an extra "File" node, normalize this for simplicity for now...
 * - Remove "start" and "end" values from Babylon nodes to reduce unimportant noise in diffs ("loc" data will still be in
 * each final AST and compared).
 *
 * @param {Object} ast raw babylon AST
 * @returns {Object} processed babylon AST
 */
function preprocessBabylonAST(ast) {
    return omitDeep(ast.program, [
        {
            key: "start",
            // only remove the "start" number (not the "start" object within loc)
            predicate: ifNumber
        },
        {
            key: "end",
            // only remove the "end" number (not the "end" object within loc)
            predicate: ifNumber
        },
        {
            key: "identifierName",
            predicate: always
        },
        {
            key: "extra",
            predicate: always
        },
        {
            key: "directives",
            predicate: always
        },
        {
            key: "directive",
            predicate: always
        },
        {
            key: "innerComments",
            predicate: always
        },
        {
            key: "leadingComments",
            predicate: always
        },
        {
            key: "trailingComments",
            predicate: always
        },
        {
            key: "guardedHandlers",
            predicate: always
        }
    ]);
}

/**
 * There is currently a really awkward difference in location data for Program nodes
 * between different parsers in the ecosystem. Hack around this by removing the data
 * before comparing the ASTs.
 *
 * See: https://github.com/babel/babylon/issues/673
 *
 * @param {Object} ast the raw AST with a Program node at its top level
 * @returns {Object} the ast with the location data removed from the Program node
 */
function removeLocationDataFromProgramNode(ast) {
    delete ast.loc;
    delete ast.range;
    return ast;
}

module.exports = {
    normalizeNodeTypes,
    preprocessBabylonAST,
    removeLocationDataFromProgramNode
};
