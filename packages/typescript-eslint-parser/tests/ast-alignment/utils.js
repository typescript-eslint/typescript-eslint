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
                break;
            }
            omitDeep(val, keysToOmit);
        } else if (Array.isArray(val)) {
            if (shouldOmit(key, val)) {
                delete obj[key];
                break;
            }
            for (const i of val) {
                omitDeep(i, keysToOmit);
            }
        } else if (shouldOmit(key, val)) {
            delete obj[key];
        }
    }
    return obj;
}

module.exports = {
    normalizeNodeTypes,
    omitDeep
};
