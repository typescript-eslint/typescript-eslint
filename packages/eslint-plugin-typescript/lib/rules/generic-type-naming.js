/**
 * @fileoverview Enforces naming of generic type variables.
 */
"use strict";

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
                        message:
                            "Type parameter {{name}} does not match rule {{rule}}",
                        data
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
            url:
                "https://github.com/nzakas/eslint-plugin-typescript/blob/master/docs/rules/generic-type-naming.md"
        }
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
            CallSignature: checkTypeParameters
        };
    }
};
