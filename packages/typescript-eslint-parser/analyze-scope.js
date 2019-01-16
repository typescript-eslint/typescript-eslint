"use strict";

/* eslint-disable new-cap, no-underscore-dangle */

const escope = require("eslint-scope");
const { Definition, ParameterDefinition } = require("eslint-scope/lib/definition");
const OriginalPatternVisitor = require("eslint-scope/lib/pattern-visitor");
const Reference = require("eslint-scope/lib/reference");
const OriginalReferencer = require("eslint-scope/lib/referencer");
const Scope = require("eslint-scope/lib/scope").Scope;
const fallback = require("eslint-visitor-keys").getKeys;
const childVisitorKeys = require("./visitor-keys");

/**
 * Define the override function of `Scope#__define` for global augmentation.
 * @param {Function} define The original Scope#__define method.
 * @returns {Function} The override function.
 */
function overrideDefine(define) {
    return /* @this {Scope} */ function(node, definition) {
        define.call(this, node, definition);

        // Set `variable.eslintUsed` to tell ESLint that the variable is exported.
        const variable = this.set.get(node.name);
        if (variable) {
            variable.eslintUsed = true;
        }
    };
}

/** The scope class for enum. */
class EnumScope extends Scope {
    constructor(scopeManager, upperScope, block) {
        super(scopeManager, "enum", upperScope, block, false);
    }
}

class PatternVisitor extends OriginalPatternVisitor {
    Identifier(node) {
        super.Identifier(node);
        if (node.decorators) {
            this.rightHandNodes.push(...node.decorators);
        }
        if (node.typeAnnotation) {
            this.rightHandNodes.push(node.typeAnnotation);
        }
    }

    ArrayPattern(node) {
        node.elements.forEach(this.visit, this);
        if (node.decorators) {
            this.rightHandNodes.push(...node.decorators);
        }
        if (node.typeAnnotation) {
            this.rightHandNodes.push(node.typeAnnotation);
        }
    }

    ObjectPattern(node) {
        node.properties.forEach(this.visit, this);
        if (node.decorators) {
            this.rightHandNodes.push(...node.decorators);
        }
        if (node.typeAnnotation) {
            this.rightHandNodes.push(node.typeAnnotation);
        }
    }

    RestElement(node) {
        super.RestElement(node);
        if (node.typeAnnotation) {
            this.rightHandNodes.push(node.typeAnnotation);
        }
    }
}

class Referencer extends OriginalReferencer {
    constructor(...args) {
        super(...args);
        this.typeMode = false;
    }

    /**
     * Override to use PatternVisitor we overrode.
     * @param {Identifier} node The Identifier node to visit.
     * @param {Object} [options] The flag to visit right-hand side nodes.
     * @param {Function} callback The callback function for left-hand side nodes.
     * @returns {void}
     */
    visitPattern(node, options, callback) {
        if (!node) {
            return;
        }

        if (typeof options === "function") {
            callback = options;
            options = { processRightHandNodes: false };
        }

        const visitor = new PatternVisitor(this.options, node, callback);
        visitor.visit(node);

        if (options.processRightHandNodes) {
            visitor.rightHandNodes.forEach(this.visit, this);
        }
    }

    /**
     * Override.
     * Visit `node.typeParameters` and `node.returnType` additionally to find `typeof` expressions.
     * @param {FunctionDeclaration|FunctionExpression|ArrowFunctionExpression} node The function node to visit.
     * @returns {void}
     */
    visitFunction(node) {
        const { type, id, typeParameters, params, returnType, body } = node;
        const scopeManager = this.scopeManager;
        const upperScope = this.currentScope();

        // Process the name.
        if (type === "FunctionDeclaration" && id) {
            upperScope.__define(
                id,
                new Definition("FunctionName", id, node, null, null, null)
            );

            // Remove overload definition to avoid confusion of no-redeclare rule.
            const { defs, identifiers } = upperScope.set.get(id.name);
            for (let i = 0; i < defs.length; ++i) {
                const def = defs[i];
                if (def.type === "FunctionName" && def.node.type === "TSDeclareFunction") {
                    defs.splice(i, 1);
                    identifiers.splice(i, 1);
                    break;
                }
            }
        } else if (type === "FunctionExpression" && id) {
            scopeManager.__nestFunctionExpressionNameScope(node);
        }

        // Process the type parameters
        this.visit(typeParameters);

        // Open the function scope.
        scopeManager.__nestFunctionScope(node, this.isInnerMethodDefinition);
        const innerScope = this.currentScope();

        // Process parameter declarations.
        for (let i = 0; i < params.length; ++i) {
            this.visitPattern(
                params[i],
                { processRightHandNodes: true },
                (pattern, info) => {
                    innerScope.__define(
                        pattern,
                        new ParameterDefinition(
                            pattern,
                            node,
                            i,
                            info.rest
                        )
                    );
                    this.referencingDefaultValue(
                        pattern,
                        info.assignments,
                        null,
                        true
                    );
                }
            );
        }

        // Process the return type.
        this.visit(returnType);

        // Process the body.
        if (body.type === "BlockStatement") {
            this.visitChildren(body);
        } else {
            this.visit(body);
        }

        // Close the function scope.
        this.close(node);
    }

    /**
     * Override.
     * Visit decorators.
     * @param {ClassDeclaration|ClassExpression|TSAbstractClassDeclaration} node The class node to visit.
     * @returns {void}
     */
    visitClass(node) {
        this.visitDecorators(node.decorators);

        const upperTypeMode = this.typeMode;
        this.typeMode = true;
        if (node.superTypeParameters) {
            this.visit(node.superTypeParameters);
        }
        if (node.implements) {
            this.visit(node.implements);
        }
        this.typeMode = upperTypeMode;

        super.visitClass(node);
    }

    /**
     * Visit typeParameters.
     * @param {*} node The node to visit.
     * @returns {void}
     */
    visitTypeParameters(node) {
        if (node.typeParameters) {
            const upperTypeMode = this.typeMode;
            this.typeMode = true;
            this.visit(node.typeParameters);
            this.typeMode = upperTypeMode;
        }
    }

    /**
     * Override.
     * Don't create the reference object in the type mode.
     * @param {Identifier} node The Identifier node to visit.
     * @returns {void}
     */
    Identifier(node) {
        this.visitDecorators(node.decorators);

        if (!this.typeMode) {
            super.Identifier(node);
        }

        this.visit(node.typeAnnotation);
    }

    /**
     * Override.
     * Visit decorators.
     * @param {MethodDefinition} node The MethodDefinition node to visit.
     * @returns {void}
     */
    MethodDefinition(node) {
        this.visitDecorators(node.decorators);
        super.MethodDefinition(node);
    }

    /**
     * Don't create the reference object for the key if not computed.
     * @param {ClassProperty} node The ClassProperty node to visit.
     * @returns {void}
     */
    ClassProperty(node) {
        const upperTypeMode = this.typeMode;
        const { computed, decorators, key, typeAnnotation, value } = node;

        this.typeMode = false;
        this.visitDecorators(decorators);
        if (computed) {
            this.visit(key);
        }
        this.typeMode = true;
        this.visit(typeAnnotation);
        this.typeMode = false;
        this.visit(value);

        this.typeMode = upperTypeMode;
    }

    /**
     * Visit new expression.
     * @param {NewExpression} node The NewExpression node to visit.
     * @returns {void}
     */
    NewExpression(node) {
        this.visitTypeParameters(node);
        this.visit(node.callee);
        if (node.arguments) {
            node.arguments.forEach(this.visit, this);
        }
    }

    /**
     * Override.
     * Visit call expression.
     * @param {CallExpression} node The CallExpression node to visit.
     * @returns {void}
     */
    CallExpression(node) {
        this.visitTypeParameters(node);

        this.visit(node.callee);
        if (node.arguments) {
            node.arguments.forEach(this.visit, this);
        }
    }

    /**
     * Define the variable of this function declaration only once.
     * Because to avoid confusion of `no-redeclare` rule by overloading.
     * @param {TSDeclareFunction} node The TSDeclareFunction node to visit.
     * @returns {void}
     */
    TSDeclareFunction(node) {
        const upperTypeMode = this.typeMode;
        const scope = this.currentScope();
        const { id, typeParameters, params, returnType } = node;

        // Ignore this if other overloadings have already existed.
        if (id) {
            const variable = scope.set.get(id.name);
            const defs = variable && variable.defs;
            const existed = defs && defs.some(d => d.type === "FunctionName");
            if (!existed) {
                scope.__define(
                    id,
                    new Definition("FunctionName", id, node, null, null, null)
                );
            }
        }

        // Find `typeof` expressions.
        this.typeMode = true;
        this.visit(typeParameters);
        params.forEach(this.visit, this);
        this.visit(returnType);
        this.typeMode = upperTypeMode;
    }

    /**
     * Create reference objects for the references in parameters and return type.
     * @param {TSEmptyBodyFunctionExpression} node The TSEmptyBodyFunctionExpression node to visit.
     * @returns {void}
     */
    TSEmptyBodyFunctionExpression(node) {
        const upperTypeMode = this.typeMode;
        const { typeParameters, params, returnType } = node;

        this.typeMode = true;
        this.visit(typeParameters);
        params.forEach(this.visit, this);
        this.visit(returnType);
        this.typeMode = upperTypeMode;
    }

    /**
     * Don't make variable because it declares only types.
     * Switch to the type mode and visit child nodes to find `typeof x` expression in type declarations.
     * @param {TSInterfaceDeclaration} node The TSInterfaceDeclaration node to visit.
     * @returns {void}
     */
    TSInterfaceDeclaration(node) {
        this.visitTypeNodes(node);
    }

    /**
     * Don't make variable because it declares only types.
     * Switch to the type mode and visit child nodes to find `typeof x` expression in type declarations.
     * @param {TSClassImplements} node The TSClassImplements node to visit.
     * @returns {void}
     */
    TSClassImplements(node) {
        this.visitTypeNodes(node);
    }

    /**
     * Don't make variable because it declares only types.
     * Switch to the type mode and visit child nodes to find `typeof x` expression in type declarations.
     * @param {TSIndexSignature} node The TSIndexSignature node to visit.
     * @returns {void}
     */
    TSIndexSignature(node) {
        this.visitTypeNodes(node);
    }

    /**
     * Visit type assertion.
     * @param {TSTypeAssertion} node The TSTypeAssertion node to visit.
     * @returns {void}
     */
    TSTypeAssertion(node) {
        if (this.typeMode) {
            this.visit(node.typeAnnotation);
        } else {
            this.typeMode = true;
            this.visit(node.typeAnnotation);
            this.typeMode = false;
        }

        this.visit(node.expression);
    }

    /**
     * Visit as expression.
     * @param {TSAsExpression} node The TSAsExpression node to visit.
     * @returns {void}
     */
    TSAsExpression(node) {
        this.visit(node.expression);

        if (this.typeMode) {
            this.visit(node.typeAnnotation);
        } else {
            this.typeMode = true;
            this.visit(node.typeAnnotation);
            this.typeMode = false;
        }
    }

    /**
     * Switch to the type mode and visit child nodes to find `typeof x` expression in type declarations.
     * @param {TSTypeAnnotation} node The TSTypeAnnotation node to visit.
     * @returns {void}
     */
    TSTypeAnnotation(node) {
        this.visitTypeNodes(node);
    }

    /**
     * Switch to the type mode and visit child nodes to find `typeof x` expression in type declarations.
     * @param {TSTypeParameterDeclaration} node The TSTypeParameterDeclaration node to visit.
     * @returns {void}
     */
    TSTypeParameterDeclaration(node) {
        this.visitTypeNodes(node);
    }

    /**
     * Create reference objects for the references in `typeof` expression.
     * @param {TSTypeQuery} node The TSTypeQuery node to visit.
     * @returns {void}
     */
    TSTypeQuery(node) {
        if (this.typeMode) {
            this.typeMode = false;
            this.visitChildren(node);
            this.typeMode = true;
        } else {
            this.visitChildren(node);
        }
    }

    /**
     * @param {TSTypeParameter} node The TSTypeParameter node to visit.
     * @returns {void}
     */
    TSTypeParameter(node) {
        this.visitTypeNodes(node);
    }

    /**
     * @param {TSInferType} node The TSInferType node to visit.
     * @returns {void}
     */
    TSInferType(node) {
        this.visitTypeNodes(node);
    }

    /**
     * @param {TSTypeReference} node The TSTypeReference node to visit.
     * @returns {void}
     */
    TSTypeReference(node) {
        this.visitTypeNodes(node);
    }

    /**
     * @param {TSTypeLiteral} node The TSTypeLiteral node to visit.
     * @returns {void}
     */
    TSTypeLiteral(node) {
        this.visitTypeNodes(node);
    }

    /**
     * @param {TSLiteralType} node The TSLiteralType node to visit.
     * @returns {void}
     */
    TSLiteralType(node) {
        this.visitTypeNodes(node);
    }

    /**
     * @param {TSIntersectionType} node The TSIntersectionType node to visit.
     * @returns {void}
     */
    TSIntersectionType(node) {
        this.visitTypeNodes(node);
    }

    /**
     * @param {TSConditionalType} node The TSConditionalType node to visit.
     * @returns {void}
     */
    TSConditionalType(node) {
        this.visitTypeNodes(node);
    }

    /**
     * @param {TSIndexedAccessType} node The TSIndexedAccessType node to visit.
     * @returns {void}
     */
    TSIndexedAccessType(node) {
        this.visitTypeNodes(node);
    }

    /**
     * @param {TSMappedType} node The TSMappedType node to visit.
     * @returns {void}
     */
    TSMappedType(node) {
        this.visitTypeNodes(node);
    }

    /**
     * @param {TSOptionalType} node The TSOptionalType node to visit.
     * @returns {void}
     */
    TSOptionalType(node) {
        this.visitTypeNodes(node);
    }

    /**
     * @param {TSParenthesizedType} node The TSParenthesizedType node to visit.
     * @returns {void}
     */
    TSParenthesizedType(node) {
        this.visitTypeNodes(node);
    }

    /**
     * @param {TSRestType} node The TSRestType node to visit.
     * @returns {void}
     */
    TSRestType(node) {
        this.visitTypeNodes(node);
    }

    /**
     * @param {TSTupleType} node The TSTupleType node to visit.
     * @returns {void}
     */
    TSTupleType(node) {
        this.visitTypeNodes(node);
    }

    /**
     * Create reference objects for the object part. (This is `obj.prop`)
     * @param {TSQualifiedName} node The TSQualifiedName node to visit.
     * @returns {void}
     */
    TSQualifiedName(node) {
        this.visit(node.left);
    }

    /**
     * Create reference objects for the references in computed keys.
     * @param {TSPropertySignature} node The TSPropertySignature node to visit.
     * @returns {void}
     */
    TSPropertySignature(node) {
        const upperTypeMode = this.typeMode;
        const { computed, key, typeAnnotation, initializer } = node;

        if (computed) {
            this.typeMode = false;
            this.visit(key);
            this.typeMode = true;
        } else {
            this.typeMode = true;
            this.visit(key);
        }
        this.visit(typeAnnotation);
        this.visit(initializer);

        this.typeMode = upperTypeMode;
    }

    /**
     * Create reference objects for the references in computed keys.
     * @param {TSMethodSignature} node The TSMethodSignature node to visit.
     * @returns {void}
     */
    TSMethodSignature(node) {
        const upperTypeMode = this.typeMode;
        const { computed, key, typeParameters, params, returnType } = node;

        if (computed) {
            this.typeMode = false;
            this.visit(key);
            this.typeMode = true;
        } else {
            this.typeMode = true;
            this.visit(key);
        }
        this.visit(typeParameters);
        params.forEach(this.visit, this);
        this.visit(returnType);

        this.typeMode = upperTypeMode;
    }

    /**
     * Create variable object for the enum.
     * The enum declaration creates a scope for the enum members.
     *
     * enum E {
     *   A,
     *   B,
     *   C = A + B // A and B are references to the enum member.
     * }
     *
     * const a = 0
     * enum E {
     *   A = a // a is above constant.
     * }
     *
     * @param {TSEnumDeclaration} node The TSEnumDeclaration node to visit.
     * @returns {void}
     */
    TSEnumDeclaration(node) {
        const { id, members } = node;
        const scopeManager = this.scopeManager;
        const scope = this.currentScope();

        if (id) {
            scope.__define(id, new Definition("EnumName", id, node));
        }

        scopeManager.__nestScope(new EnumScope(scopeManager, scope, node));
        for (const member of members) {
            this.visit(member);
        }
        this.close(node);
    }

    /**
     * Create variable object for the enum member and create reference object for the initializer.
     * And visit the initializer.
     *
     * @param {TSEnumMember} node The TSEnumMember node to visit.
     * @returns {void}
     */
    TSEnumMember(node) {
        const { id, initializer } = node;
        const scope = this.currentScope();

        scope.__define(id, new Definition("EnumMemberName", id, node));
        if (initializer) {
            scope.__referencing(
                id,
                Reference.WRITE,
                initializer,
                null,
                false,
                true
            );
            this.visit(initializer);
        }
    }

    /**
     * Create the variable object for the module name, and visit children.
     * @param {TSModuleDeclaration} node The TSModuleDeclaration node to visit.
     * @returns {void}
     */
    TSModuleDeclaration(node) {
        const scope = this.currentScope();
        const { id, body } = node;

        if (node.global) {
            this.visitGlobalAugmentation(node);
            return;
        }

        if (id && id.type === "Identifier") {
            scope.__define(
                id,
                new Definition("NamespaceName", id, node, null, null, null)
            );
        }
        this.visit(body);
    }

    TSTypeAliasDeclaration(node) {
        this.typeMode = true;
        this.visitChildren(node);
        this.typeMode = false;
    }

    /**
     * Process the module block.
     * @param {TSModuleBlock} node The TSModuleBlock node to visit.
     * @returns {void}
     */
    TSModuleBlock(node) {
        this.scopeManager.__nestBlockScope(node);
        this.visitChildren(node);
        this.close(node);
    }

    TSAbstractClassDeclaration(node) {
        this.ClassDeclaration(node);
    }
    TSAbstractClassProperty(node) {
        this.ClassProperty(node);
    }
    TSAbstractMethodDefinition(node) {
        this.MethodDefinition(node);
    }

    /**
     * Process import equal declaration
     * @param {TSImportEqualsDeclaration} node The TSImportEqualsDeclaration node to visit.
     * @returns {void}
     */
    TSImportEqualsDeclaration(node) {
        const { id, moduleReference } = node;
        if (id && id.type === "Identifier") {
            this.currentScope().__define(
                id,
                new Definition("ImportBinding", id, node, null, null, null)
            );
        }
        this.visit(moduleReference);
    }

    /**
     * Process the global augmentation.
     * 1. Set the global scope as the current scope.
     * 2. Configure the global scope to set `variable.eslintUsed = true` for all defined variables. This means `no-unused-vars` doesn't warn those.
     * @param {TSModuleDeclaration} node The TSModuleDeclaration node to visit.
     * @returns {void}
     */
    visitGlobalAugmentation(node) {
        const scopeManager = this.scopeManager;
        const currentScope = this.currentScope();
        const globalScope = scopeManager.globalScope;
        const originalDefine = globalScope.__define;

        globalScope.__define = overrideDefine(originalDefine);
        scopeManager.__currentScope = globalScope;

        // Skip TSModuleBlock to avoid to create that block scope.
        for (const moduleItem of node.body.body) {
            this.visit(moduleItem);
        }

        scopeManager.__currentScope = currentScope;
        globalScope.__define = originalDefine;
    }

    /**
     * Process decorators.
     * @param {Decorator[]|undefined} decorators The decorator nodes to visit.
     * @returns {void}
     */
    visitDecorators(decorators) {
        if (decorators) {
            decorators.forEach(this.visit, this);
        }
    }

    /**
     * Process all child of type nodes
     * @param {any} node node to be processed
     * @returns {void}
     */
    visitTypeNodes(node) {
        if (this.typeMode) {
            this.visitChildren(node);
        } else {
            this.typeMode = true;
            this.visitChildren(node);
            this.typeMode = false;
        }
    }
}

module.exports = function(ast, parserOptions) {
    const options = {
        ignoreEval: true,
        optimistic: false,
        directive: false,
        nodejsScope:
            parserOptions.sourceType === "script" &&
            (parserOptions.ecmaFeatures &&
                parserOptions.ecmaFeatures.globalReturn) === true,
        impliedStrict: false,
        sourceType: parserOptions.sourceType,
        ecmaVersion: parserOptions.ecmaVersion || 2018,
        childVisitorKeys,
        fallback
    };

    const scopeManager = new escope.ScopeManager(options);
    const referencer = new Referencer(options, scopeManager);

    referencer.visit(ast);

    return scopeManager;
};
