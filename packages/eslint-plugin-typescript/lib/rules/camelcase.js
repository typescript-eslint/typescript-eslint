/**
 * @fileoverview Rule to flag non-camelcased identifiers
 * @author Patricio Trevino
 */
"use strict";

const baseRule = require("eslint/lib/rules/camelcase");
const util = require("../util");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/* eslint-disable eslint-plugin/require-meta-type */
module.exports = {
    meta: Object.assign({}, baseRule.meta, {
        docs: {
            description: "Enforce camelCase naming convention",
            url: util.metaDocsUrl("ban-types"),
        },
    }),

    create(context) {
        const rules = baseRule.create(context);
        const TS_PROPERTY_TYPES = [
            "TSPropertySignature",
            "ClassProperty",
            "TSParameterProperty",
            "TSAbstractClassProperty",
        ];

        const options = context.options[0] || {};
        let properties = options.properties || "";
        const allow = options.allow || [];

        if (properties !== "always" && properties !== "never") {
            properties = "always";
        }

        /**
         * Checks if a string contains an underscore and isn't all upper-case
         * @param {string} name The string to check.
         * @returns {boolean} if the string is underscored
         * @private
         */
        function isUnderscored(name) {
            // if there's an underscore, it might be A_CONSTANT, which is okay
            return name.indexOf("_") > -1 && name !== name.toUpperCase();
        }

        /**
         * Checks if a string match the ignore list
         * @param {string} name The string to check.
         * @returns {boolean} if the string is ignored
         * @private
         */
        function isAllowed(name) {
            return (
                allow.findIndex(
                    entry => name === entry || name.match(new RegExp(entry))
                ) !== -1
            );
        }

        /**
         * Checks if the the node is a valid TypeScript property type.
         * @param {Node} node the node to be validated.
         * @returns {boolean} true if the node is a TypeScript property type.
         * @private
         */
        function isTSPropertyType(node) {
            if (!node.parent) return false;
            if (TS_PROPERTY_TYPES.includes(node.parent.type)) return true;

            if (node.parent.type === "AssignmentPattern") {
                return (
                    node.parent.parent &&
                    TS_PROPERTY_TYPES.includes(node.parent.parent.type)
                );
            }

            return false;
        }

        return {
            Identifier(node) {
                /*
                 * Leading and trailing underscores are commonly used to flag
                 * private/protected identifiers, strip them
                 */
                const name = node.name.replace(/^_+|_+$/g, "");

                // First, we ignore the node if it match the ignore list
                if (isAllowed(name)) {
                    return;
                }

                // Check TypeScript specific nodes
                if (isTSPropertyType(node)) {
                    if (properties === "always" && isUnderscored(name)) {
                        context.report({
                            node,
                            messageId: "notCamelCase",
                            data: { name: node.name },
                        });
                    }

                    return;
                }

                // Let the base rule deal with the rest
                // eslint-disable-next-line new-cap
                rules.Identifier(node);
            },
        };
    },
};
