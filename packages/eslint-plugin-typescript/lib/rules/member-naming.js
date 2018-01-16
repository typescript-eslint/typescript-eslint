/**
 * @fileoverview Enforces naming conventions for class members by visibility.
 * @author Ian MacLeod
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description:
                "Enforces naming conventions for class members by visibility.",
            category: "TypeScript",
            url:
                "https://github.com/nzakas/eslint-plugin-typescript/blob/master/docs/rules/member-naming.md"
        },
        schema: [
            {
                type: "object",
                properties: {
                    public: { type: "string" },
                    protected: { type: "string" },
                    private: { type: "string" }
                },
                additionalProperties: false
            }
        ]
    },

    create(context) {
        const config = context.options[0] || {};
        const conventions = {};

        for (const accessibility of Object.getOwnPropertyNames(config)) {
            conventions[accessibility] = new RegExp(config[accessibility]);
        }

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
                    "{{accessibility}} property {{name}} should match {{convention}}",
                data: { accessibility, name, convention }
            });
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        return {
            MethodDefinition: validateName,
            ClassProperty: validateName
        };
    }
};
