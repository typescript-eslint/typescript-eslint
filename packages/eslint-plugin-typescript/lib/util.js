"use strict";

exports.tslintRule = name => `\`${name}\` from TSLint`;

/**
 * Check if the context file name is *.ts or *.tsx
 * @param {string} fileName The context file name
 * @returns {boolean} `true` if the file name ends in *.ts or *.tsx
 * @private
 */
exports.isTypescript = fileName => /\.tsx?$/.test(fileName);
