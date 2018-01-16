/**
 * @fileoverview Enforces triple slash references are not used.
 * @author Danny Fritz
 */
"use strict";

const util = require("../util");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: 'Disallow `/// <reference path="" />` comments',
            extraDescription: [util.tslintRule("no-reference")],
            category: "TypeScript",
            url:
                "https://github.com/nzakas/eslint-plugin-typescript/blob/master/docs/rules/no-triple-slash-reference.md"
        },
        schema: []
    },

    create(context) {
        const referenceRegExp = /^\/\s*<reference/;
        const sourceCode = context.getSourceCode();

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * Checks if property has an accessibility modifier.
         * @param {ASTNode} program The node representing a Program.
         * @returns {void}
         * @private
         */
        function checkTripleSlashReference(program) {
            const commentsBefore = sourceCode.getCommentsBefore(program);

            commentsBefore.forEach(comment => {
                if (comment.type !== "Line") {
                    return;
                }
                if (referenceRegExp.test(comment.value)) {
                    context.report({
                        node: comment,
                        message: "Do not use a triple slash reference"
                    });
                }
            });
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            Program: checkTripleSlashReference
        };
    }
};
