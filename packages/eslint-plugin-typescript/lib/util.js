"use strict";

exports.tslintRule = name => `\`${name}\` from TSLint`;

/**
 * Check if the context file name is *.ts or *.tsx
 * @param {string} fileName The context file name
 * @returns {boolean} `true` if the file name ends in *.ts or *.tsx
 * @private
 */
exports.isTypescript = fileName => /\.tsx?$/.test(fileName);

/**
 * Pure function - doesn't mutate either parameter!
 * Merges two objects together deeply, overwriting the properties in first with the properties in second
 * @template TFirst,TSecond
 * @param {TFirst} first The first object
 * @param {TSecond} second The second object
 * @returns {Record<string, any>} a new object
 */
function deepMerge(first = {}, second = {}) {
    // get the unique set of keys across both objects
    const keys = new Set(Object.keys(first).concat(Object.keys(second)));

    return Array.from(keys).reduce((acc, key) => {
        const firstHasKey = key in first;
        const secondHasKey = key in second;

        if (firstHasKey && secondHasKey) {
            if (
                typeof first[key] === "object" &&
                !Array.isArray(first[key]) &&
                typeof second[key] === "object" &&
                !Array.isArray(second[key])
            ) {
                // object type
                acc[key] = deepMerge(first[key], second[key]);
            } else {
                // value type
                acc[key] = second[key];
            }
        } else if (firstHasKey) {
            acc[key] = first[key];
        } else {
            acc[key] = second[key];
        }

        return acc;
    }, {});
}
exports.deepMerge = deepMerge;
