/**
 * @fileoverview Disallow generic `Array` constructors
 * @author Jed Fox
 * @author Matt DuVall <http://www.mattduvall.com/>
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Disallow generic `Array` constructors",
            category: "Stylistic Issues",
            recommended: false,
            url:
                "https://github.com/nzakas/eslint-plugin-typescript/blob/master/docs/rules/no-array-constructor.md"
        },
        fixable: "code",
        schema: []
    },

    create(context) {
        /**
         * Disallow construction of dense arrays using the Array constructor
         * @param {ASTNode} node node to evaluate
         * @returns {void}
         * @private
         */
        function check(node) {
            if (
                node.arguments.length !== 1 &&
                node.callee.type === "Identifier" &&
                node.callee.name === "Array" &&
                !node.typeParameters
            ) {
                context.report({
                    node,
                    message: "The array literal notation [] is preferrable.",
                    fix(fixer) {
                        if (node.arguments.length === 0) {
                            return fixer.replaceText(node, "[]");
                        }
                        const fullText = context.getSourceCode().getText(node);
                        const preambleLength =
                            node.callee.range[1] - node.range[0];

                        return fixer.replaceText(
                            node,
                            `[${fullText.slice(preambleLength + 1, -1)}]`
                        );
                    }
                });
            }
        }

        return {
            CallExpression: check,
            NewExpression: check
        };
    }
};
