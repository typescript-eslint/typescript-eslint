/**
 * @fileoverview Enforces naming conventions for class members by visibility.
 * @author Ian MacLeod
 */
"use strict";

const util = require("../util");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const defaultOptions = [{}];

module.exports = {
    meta: {
        type: "suggestion",
        docs: {
            description:
                "Enforces naming conventions for class members by visibility.",
            category: "TypeScript",
            url: util.metaDocsUrl("member-naming"),
            recommended: false,
        },
        schema: [
            {
                type: "object",
                properties: {
                    public: {
                        type: "string",
                        minLength: 1,
                        format: "regex",
                    },
                    protected: {
                        type: "string",
                        minLength: 1,
                        format: "regex",
                    },
                    private: {
                        type: "string",
                        minLength: 1,
                        format: "regex",
                    },
                },
                additionalProperties: false,
                minProperties: 1,
            },
        ],
    },

    create(context) {
        const config = util.applyDefault(defaultOptions, context.options)[0];
        const conventions = Object.keys(config).reduce((acc, accessibility) => {
            acc[accessibility] = new RegExp(config[accessibility]);

            return acc;
        }, {});

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * Check that the property name matches the convention for its
         * accessibility.
         * @param {ASTNode} node the named node to evaluate.
         * @returns {void}
         * @private
         */
        function validateName(node) {
            const name = node.key.name;
            const accessibility = node.accessibility || "public";
            const convention = conventions[accessibility];

            if (!convention || convention.test(name)) return;

            context.report({
                node: node.key,
                message:
                    "{{accessibility}} property {{name}} should match {{convention}}.",
                data: { accessibility, name, convention },
            });
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        return {
            MethodDefinition: validateName,
            ClassProperty: validateName,
        };
    },
};
