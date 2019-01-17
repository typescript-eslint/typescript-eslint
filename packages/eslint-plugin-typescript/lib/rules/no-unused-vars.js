/**
 * @fileoverview Prevent TypeScript-specific variables being falsely marked as unused
 * @author James Henry
 */
"use strict";

/**
 * Record that a particular variable has been used in code
 *
 * @param {Object} context The current rule context.
 * @param {string} name The name of the variable to mark as used.
 * @returns {boolean} True if the variable was found and marked as used, false if not.
 */
function markVariableAsUsed(context, name) {
    let scope = context.getScope();
    let variables;
    let i;
    let len;
    let found = false;

    // Special Node.js scope means we need to start one level deeper
    if (scope.type === "global") {
        while (scope.childScopes.length) {
            scope = scope.childScopes[0];
        }
    }

    do {
        variables = scope.variables;
        for (i = 0, len = variables.length; i < len; i++) {
            if (variables[i].name === name) {
                variables[i].eslintUsed = true;
                found = true;
            }
        }
        scope = scope.upper;
    } while (scope);

    return found;
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description:
                "Prevent TypeScript-specific constructs from being erroneously flagged as unused",
            category: "TypeScript",
            recommended: true
        },
        schema: []
    },

    create(context) {
        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * Checks the given node type annotation and marks it as used.
         * @param {ASTNode} node the relevant AST node.
         * @returns {void}
         * @private
         */
        function markTypeAnnotationAsUsed(node) {
            const annotation = node.typeAnnotation || node;

            switch (annotation.type) {
                case "TSArrayType": {
                    markTypeAnnotationAsUsed(annotation.elementType);
                    break;
                }
                case "TSTypeReference": {
                    if (annotation.typeName.type === "TSArrayType") {
                        markTypeAnnotationAsUsed(
                            annotation.typeName.elementType
                        );
                    } else {
                        markVariableAsUsed(context, annotation.typeName.name);
                        if (
                            annotation.typeParameters &&
                            annotation.typeParameters.params
                        ) {
                            annotation.typeParameters.params.forEach(param => {
                                markTypeAnnotationAsUsed(param);
                            });
                        }
                    }

                    break;
                }
                case "TSUnionType":
                case "TSIntersectionType":
                    annotation.types.forEach(type => {
                        markTypeAnnotationAsUsed(type);
                    });

                    break;

                default:
                    break;
            }
        }

        /**
         * Checks the given decorator and marks it as used.
         * @param {ASTNode} node The relevant AST node.
         * @returns {void}
         * @private
         */
        function markDecoratorAsUsed(node) {
            /**
             * Decorator
             */
            if (node.name) {
                markVariableAsUsed(context, node.name);
                return;
            }

            if (node.expression && node.expression.name) {
                markVariableAsUsed(context, node.expression.name);
                return;
            }

            /**
             * Decorator Factory
             */
            if (node.callee && node.callee.name) {
                markVariableAsUsed(context, node.callee.name);
            }

            if (
                node.expression &&
                node.expression.callee &&
                node.expression.callee.name
            ) {
                markVariableAsUsed(context, node.expression.callee.name);
            }
        }

        /**
         * Checks the given interface and marks it as used.
         * Generic arguments are also included in the check.
         * @param {ASTNode} node The relevant AST node.
         * @returns {void}
         * @private
         */
        function markImplementedInterfaceAsUsed(node) {
            if (!node || !node.id || !node.id.name) {
                return;
            }
            markVariableAsUsed(context, node.id.name);

            if (!node.typeParameters || !node.typeParameters.params) {
                return;
            }
            node.typeParameters.params.forEach(markTypeAnnotationAsUsed);
        }

        /**
         * Checks the given class has a super class and marks it as used.
         * Generic arguments are also included in the check.
         * @param {ASTNode} node The relevant AST node.
         * @returns {void}
         * @private
         */
        function markSuperClassAsUsed(node) {
            if (!node.superClass) {
                return;
            }
            markVariableAsUsed(context, node.superClass.name);

            if (!node.superTypeParameters || !node.superTypeParameters.params) {
                return;
            }
            node.superTypeParameters.params.forEach(markTypeAnnotationAsUsed);
        }

        /**
         * Checks the given interface and marks it as used.
         * Generic arguments are also included in the check.
         * This is used when interfaces are extending other interfaces.
         * @param {ASTNode} node the relevant AST node.
         * @returns {void}
         * @private
         */
        function markExtendedInterfaceAsUsed(node) {
            if (!node || !node.id || !node.id.name) {
                return;
            }
            markVariableAsUsed(context, node.id.name);

            if (!node.typeParameters || !node.typeParameters.params) {
                return;
            }
            node.typeParameters.params.forEach(markTypeAnnotationAsUsed);
        }

        /**
         * Checks the given function return type and marks it as used.
         * @param {ASTNode} node the relevant AST node.
         * @returns {void}
         * @private
         */
        function markFunctionReturnTypeAsUsed(node) {
            if (node.returnType) {
                markTypeAnnotationAsUsed(node.returnType);
            }
        }

        /**
         * Checks the given class and marks super classes, interfaces and decoratores as used.
         * @param {ASTNode} node the relevant AST node.
         * @returns {void}
         * @private
         */
        function markClassOptionsAsUsed(node) {
            markSuperClassAsUsed(node);
            if (node.implements) {
                node.implements.forEach(markImplementedInterfaceAsUsed);
            }
            if (node.decorators) {
                node.decorators.forEach(markDecoratorAsUsed);
            }
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            Identifier(node) {
                if (node.typeAnnotation) {
                    markTypeAnnotationAsUsed(node.typeAnnotation);
                }

                if (node.decorators) {
                    node.decorators.forEach(markDecoratorAsUsed);
                }
            },

            TypeAnnotation(node) {
                if (node.typeAnnotation) {
                    markTypeAnnotationAsUsed(node.typeAnnotation);
                }
            },

            FunctionDeclaration: markFunctionReturnTypeAsUsed,
            FunctionExpression: markFunctionReturnTypeAsUsed,
            ArrowFunctionExpression: markFunctionReturnTypeAsUsed,

            Decorator: markDecoratorAsUsed,
            TSInterfaceHeritage: markExtendedInterfaceAsUsed,

            ClassDeclaration: markClassOptionsAsUsed,
            ClassExpression: markClassOptionsAsUsed,

            MethodDefinition(node) {
                if (node.decorators) {
                    node.decorators.forEach(markDecoratorAsUsed);
                }
            }
        };
    }
};
