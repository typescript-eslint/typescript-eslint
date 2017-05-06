/**
 * @fileoverview Tools for running test cases
 * @author Nicholas C. Zakas
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */

"use strict";

//------------------------------------------------------------------------------
//   Private
//--------------------------------------------------------------------------------

/**
 * Returns a raw copy of the given AST
 * @param  {Object} ast the AST object
 * @returns {Object}     copy of the AST object
 */
function getRaw(ast) {
    return JSON.parse(JSON.stringify(ast, (key, value) => {
        if ((key === "start" || key === "end") && typeof value === "number") {
            return undefined;
        }

        return value;
    }));
}

module.exports = {
    getRaw
};
