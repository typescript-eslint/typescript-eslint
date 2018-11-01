/**
 * @fileoverview Enforces the use of the keyword `namespace` over `module` to declare custom TypeScript modules.
 * @author Patricio Trevino
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
                "https://github.com/nzakas/eslint-plugin-typescript/blob/master/docs/rules/prefer-namespace-keyword.md"
        },
        fixable: "code",
        schema: []
    },

    create(context) {
        const sourceCode = context.getSourceCode();

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            TSModuleDeclaration(node) {
                // Get tokens of the declaration header.
                const firstToken = sourceCode.getFirstToken(node);
                const tokens = [firstToken].concat(
                    sourceCode.getTokensBetween(
                        firstToken,
                        sourceCode.getFirstToken(node.body)
                    )
                );

                // Get 'module' token and the next one.
                const moduleKeywordIndex = tokens.findIndex(
                    t => t.type === "Identifier" && t.value === "module"
                );
                const moduleKeywordToken =
                    moduleKeywordIndex === -1
                        ? null
                        : tokens[moduleKeywordIndex];
                const moduleNameToken = tokens[moduleKeywordIndex + 1];

                // Do nothing if the 'module' token was not found or the module name is a string.
                if (!moduleKeywordToken || moduleNameToken.type === "String") {
                    return;
                }

                context.report({
                    node,
                    message:
                        "Use 'namespace' instead of 'module' to declare custom TypeScript modules",
                    fix(fixer) {
                        return fixer.replaceText(
                            moduleKeywordToken,
                            "namespace"
                        );
                    }
                });
            }
        };
    }
};
