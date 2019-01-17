/**
 * @fileoverview Enforces naming of generic type variables.
 */
"use strict";

const util = require("../util");

/**
 *
 * @param {any} context ESLint context
 * @param {string} rule Option
 * @returns {Function} Node's visitor function
 */
function createTypeParameterChecker(context, rule) {
    const regex = new RegExp(rule);

    return function checkTypeParameters(pnode) {
        const params = pnode.typeParameters && pnode.typeParameters.params;

        if (!Array.isArray(params) || params.length === 0) {
            return;
        }
        params.forEach(node => {
            const type = node.type;

            if (type === "TSTypeParameter" || type === "TypeParameter") {
                const name = node.name;

                if (name && !regex.test(name)) {
                    const data = { name, rule };

                    context.report({
                        node,
                        messageId: "paramNotMatchRule",
                        data,
                    });
                }
            }
        });
    };
}

module.exports = {
    meta: {
        docs: {
            description: "Enforces naming of generic type variables",
            category: "TypeScript",
            url: util.metaDocsUrl("generic-type-naming"),
        },
        messages: {
            paramNotMatchRule:
                "Type parameter {{name}} does not match rule {{rule}}.",
        },
    },

    create(context) {
        const rule = context.options[0];

        if (!rule) {
            return {};
        }

        const checkTypeParameters = createTypeParameterChecker(context, rule);

        return {
            VariableDeclarator: checkTypeParameters,
            ClassDeclaration: checkTypeParameters,
            InterfaceDeclaration: checkTypeParameters,
            TSInterfaceDeclaration: checkTypeParameters,
            FunctionDeclaration: checkTypeParameters,
            TSCallSignature: checkTypeParameters,
            CallSignature: checkTypeParameters,
        };
    },
};
