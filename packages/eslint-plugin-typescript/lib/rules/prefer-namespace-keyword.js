/**
 * @fileoverview Enforces the use of the keyword `namespace` over `module` to declare custom TypeScript modules.
 * @author Patricio Trevino
 * @author Armano <https://github.com/armano2>
 */
"use strict";

const util = require("../util");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description:
                "Require the use of the `namespace` keyword instead of the `module` keyword to declare custom TypeScript modules.",
            extraDescription: [util.tslintRule("no-internal-module")],
            category: "TypeScript",
            url:
                "https://github.com/nzakas/eslint-plugin-typescript/blob/master/docs/rules/prefer-namespace-keyword.md",
        },
        fixable: "code",
        schema: [],
    },

    create(context) {
        const sourceCode = context.getSourceCode();

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            TSModuleDeclaration(node) {
                // Do nothing if the name is a string.
                if (!node.id || node.id.type === "Literal") {
                    return;
                }
                // Get tokens of the declaration header.
                const moduleType = sourceCode.getTokenBefore(node.id);

                if (
                    moduleType &&
                    moduleType.type === "Identifier" &&
                    moduleType.value === "module"
                ) {
                    context.report({
                        node,
                        message:
                            "Use 'namespace' instead of 'module' to declare custom TypeScript modules",
                        fix(fixer) {
                            return fixer.replaceText(moduleType, "namespace");
                        },
                    });
                }
            },
        };
    },
};
