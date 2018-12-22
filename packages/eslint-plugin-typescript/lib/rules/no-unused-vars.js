/**
 * @fileoverview Prevent TypeScript-specific variables being falsely marked as unused
 * @author James Henry
 */
"use strict";

const baseRule = require("eslint/lib/rules/no-unused-vars");
const util = require("../util");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = Object.assign({}, baseRule, {
    meta: {
        type: "problem",
        docs: {
            description: "Disallow unused variables",
            extraDescription: [util.tslintRule("no-unused-variable")],
            category: "Variables",
            url: util.metaDocsUrl("no-unused-vars"),
            recommended: "warning",
        },
        schema: baseRule.meta.schema,
    },

    create(context) {
        const rules = baseRule.create(context);

        /**
         * Mark this function parameter as used
         * @param {Identifier} node The node currently being traversed
         * @returns {void}
         */
        function markThisParameterAsUsed(node) {
            if (node.name) {
                const variable = context
                    .getScope()
                    .variables.find(scopeVar => scopeVar.name === node.name);

                if (variable) {
                    variable.eslintUsed = true;
                }
            }
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return Object.assign({}, rules, {
            "FunctionDeclaration Identifier[name='this']": markThisParameterAsUsed,
            "FunctionExpression Identifier[name='this']": markThisParameterAsUsed,
            "TSTypeReference Identifier"(node) {
                context.markVariableAsUsed(node.name);
            },
            "ClassImplements Identifier"(node) {
                context.markVariableAsUsed(node.name);
            },
            "TSParameterProperty Identifier"(node) {
                // just assume parameter properties are used
                context.markVariableAsUsed(node.name);
            },
            "TSEnumMember Identifier"(node) {
                context.markVariableAsUsed(node.name);
            },
        });
    },
});
