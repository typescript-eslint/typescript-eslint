/**
 * @fileoverview Converts TypeScript AST into ESTree format.
 * @author Nicholas C. Zakas
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const nodeUtils = require("./node-utils"),
    AST_NODE_TYPES = require("./ast-node-types");

//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

const SyntaxKind = nodeUtils.SyntaxKind;

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

/**
 * Converts a TypeScript node into an ESTree node
 * @param  {Object} config configuration options for the conversion
 * @param  {TSNode} config.node   the TSNode
 * @param  {TSNode} config.parent the parent TSNode
 * @param  {TSNode} config.ast the full TypeScript AST
 * @param  {Object} config.additionalOptions additional options for the conversion
 * @param  {Object} config.additionalOptions.errorOnUnknownASTType whether whether or not to throw an error if an unknown AST Node Type is encountered
 * @returns {ESTreeNode}        the converted ESTreeNode
 */
module.exports = function convert(config) {

    const node = config.node;
    const parent = config.parent;
    const ast = config.ast;
    const additionalOptions = config.additionalOptions || {};

    /**
     * Exit early for null and undefined
     */
    if (!node) {
        return null;
    }

    /**
     * Create a new ESTree node
     */
    let result = {
        type: "",
        range: [node.getStart(), node.end],
        loc: nodeUtils.getLoc(node, ast)
    };

    /**
     * Copies the result object into an ESTree node with just a type property.
     * This is used only for leaf nodes that have no other properties.
     * @returns {void}
     */
    function simplyCopy() {
        Object.assign(result, {
            type: SyntaxKind[node.kind]
        });
    }

    /**
     * If we are parsing for ESLint we need to perform a custom namespacing step
     * on functions which have no body so that we do not break any ESLint rules which
     * rely on them to have one.
     *
     * @param {ESTreeNode} functionNode the converted ESTreeNode
     * @returns {void}
     */
    function namespaceEmptyBodyFunctionForESLint(functionNode) {
        if (!config.additionalOptions.parseForESLint || functionNode.body) {
            return;
        }
        functionNode.type = `TSEmptyBody${functionNode.type}`;
    }

    /**
     * Converts a TypeScript node into an ESTree node.
     * @param  {TSNode} child the child TSNode
     * @returns {ESTreeNode}       the converted ESTree node
     */
    function convertChild(child) {
        return convert({ node: child, parent: node, ast, additionalOptions });
    }

    /**
     * Converts a child into a type annotation. This creates an intermediary
     * TypeAnnotation node to match what Flow does.
     * @param {TSNode} child The TypeScript AST node to convert.
     * @returns {ESTreeNode} The type annotation node.
     */
    function convertTypeAnnotation(child) {
        const annotation = convertChild(child);
        const annotationStartCol = child.getFullStart() - 1;
        const loc = nodeUtils.getLocFor(annotationStartCol, child.end, ast);
        return {
            type: AST_NODE_TYPES.TSTypeAnnotation,
            loc,
            range: [annotationStartCol, child.end],
            typeAnnotation: annotation
        };
    }

    /**
     * Converts a TSNode's typeArguments array to a flow-like typeParameters node
     * @param {TSNode[]} typeArguments TSNode typeArguments
     * @returns {TypeParameterInstantiation} TypeParameterInstantiation node
     */
    function convertTypeArgumentsToTypeParameters(typeArguments) {
        /**
         * Even if typeArguments is an empty array, TypeScript sets a `pos` and `end`
         * property on the array object so we can safely read the values here
         */
        const start = typeArguments.pos - 1;
        let end = typeArguments.end + 1;
        if (typeArguments && typeArguments.length) {
            const firstTypeArgument = typeArguments[0];
            const typeArgumentsParent = firstTypeArgument.parent;
            /**
             * In the case of the parent being a CallExpression or a TypeReference we have to use
             * slightly different logic to calculate the correct end position
             */
            if (typeArgumentsParent && (typeArgumentsParent.kind === SyntaxKind.CallExpression || typeArgumentsParent.kind === SyntaxKind.TypeReference)) {
                const lastTypeArgument = typeArguments[typeArguments.length - 1];
                const greaterThanToken = nodeUtils.findNextToken(lastTypeArgument, ast);
                end = greaterThanToken.end;
            }
        }
        return {
            type: AST_NODE_TYPES.TSTypeParameterInstantiation,
            range: [
                start,
                end
            ],
            loc: nodeUtils.getLocFor(start, end, ast),
            params: typeArguments.map(typeArgument => {
                if (nodeUtils.isTypeKeyword(typeArgument.kind)) {
                    return {
                        type: AST_NODE_TYPES[`TS${SyntaxKind[typeArgument.kind]}`],
                        range: [
                            typeArgument.getStart(),
                            typeArgument.getEnd()
                        ],
                        loc: nodeUtils.getLoc(typeArgument, ast)
                    };
                }
                return {
                    type: AST_NODE_TYPES.TSTypeReference,
                    range: [
                        typeArgument.getStart(),
                        typeArgument.getEnd()
                    ],
                    loc: nodeUtils.getLoc(typeArgument, ast),
                    typeName: convertChild(typeArgument.typeName || typeArgument),
                    typeParameters: (typeArgument.typeArguments)
                        ? convertTypeArgumentsToTypeParameters(typeArgument.typeArguments)
                        : undefined
                };
            })
        };
    }

    /**
     * Converts a TSNode's typeParameters array to a flow-like TypeParameterDeclaration node
     * @param {TSNode[]} typeParameters TSNode typeParameters
     * @returns {TypeParameterDeclaration} TypeParameterDeclaration node
     */
    function convertTSTypeParametersToTypeParametersDeclaration(typeParameters) {
        const firstTypeParameter = typeParameters[0];
        const lastTypeParameter = typeParameters[typeParameters.length - 1];

        const greaterThanToken = nodeUtils.findNextToken(lastTypeParameter, ast);

        return {
            type: AST_NODE_TYPES.TSTypeParameterDeclaration,
            range: [
                firstTypeParameter.pos - 1,
                greaterThanToken.end
            ],
            loc: nodeUtils.getLocFor(firstTypeParameter.pos - 1, greaterThanToken.end, ast),
            params: typeParameters.map(typeParameter => {
                const name = nodeUtils.unescapeIdentifier(typeParameter.name.text);

                const constraint = typeParameter.constraint
                    ? convert({ node: typeParameter.constraint, parent: typeParameter, ast, additionalOptions })
                    : undefined;

                const defaultParameter = typeParameter.default
                    ? convert({ node: typeParameter.default, parent: typeParameter, ast, additionalOptions })
                    : typeParameter.default;

                return {
                    type: AST_NODE_TYPES.TSTypeParameter,
                    range: [
                        typeParameter.getStart(),
                        typeParameter.getEnd()
                    ],
                    loc: nodeUtils.getLoc(typeParameter, ast),
                    name,
                    constraint,
                    default: defaultParameter
                };
            })
        };
    }

    /**
     * Converts a child into a class implements node. This creates an intermediary
     * ClassImplements node to match what Flow does.
     * @param {TSNode} child The TypeScript AST node to convert.
     * @returns {ESTreeNode} The type annotation node.
     */
    function convertClassImplements(child) {
        const id = convertChild(child.expression);
        const classImplementsNode = {
            type: AST_NODE_TYPES.ClassImplements,
            loc: id.loc,
            range: id.range,
            id
        };
        if (child.typeArguments && child.typeArguments.length) {
            classImplementsNode.typeParameters = convertTypeArgumentsToTypeParameters(child.typeArguments);
        }
        return classImplementsNode;
    }

    /**
     * Converts a child into a interface heritage node.
     * @param {TSNode} child The TypeScript AST node to convert.
     * @returns {ESTreeNode} The type annotation node.
     */
    function convertInterfaceHeritageClause(child) {
        const id = convertChild(child.expression);
        const classImplementsNode = {
            type: AST_NODE_TYPES.TSInterfaceHeritage,
            loc: id.loc,
            range: id.range,
            id
        };

        if (child.typeArguments && child.typeArguments.length) {
            classImplementsNode.typeParameters = convertTypeArgumentsToTypeParameters(child.typeArguments);
        }
        return classImplementsNode;
    }

    /**
     * Converts an array of TSNode decorators into an array of ESTreeNode decorators
     * @param  {TSNode[]} decorators An array of TSNode decorators to be converted
     * @returns {ESTreeNode[]}       an array of converted ESTreeNode decorators
     */
    function convertDecorators(decorators) {
        if (!decorators || !decorators.length) {
            return [];
        }
        return decorators.map(decorator => {
            const expression = convertChild(decorator.expression);
            return {
                type: AST_NODE_TYPES.Decorator,
                range: [decorator.getStart(), decorator.end],
                loc: nodeUtils.getLoc(decorator, ast),
                expression
            };
        });
    }

    /**
     * Converts an array of TSNode parameters into an array of ESTreeNode params
     * @param  {TSNode[]} parameters An array of TSNode params to be converted
     * @returns {ESTreeNode[]}       an array of converted ESTreeNode params
     */
    function convertParameters(parameters) {
        if (!parameters || !parameters.length) {
            return [];
        }
        return parameters.map(param => {
            const convertedParam = convertChild(param);
            if (!param.decorators || !param.decorators.length) {
                return convertedParam;
            }
            return Object.assign(convertedParam, {
                decorators: convertDecorators(param.decorators)
            });
        });
    }

    /**
     * For nodes that are copied directly from the TypeScript AST into
     * ESTree mostly as-is. The only difference is the addition of a type
     * property instead of a kind property. Recursively copies all children.
     * @returns {void}
     */
    function deeplyCopy() {
        const customType = `TS${SyntaxKind[node.kind]}`;
        /**
         * If the "errorOnUnknownASTType" option is set to true, throw an error,
         * otherwise fallback to just inlcuding the unknown type as-is.
         */
        if (additionalOptions.errorOnUnknownASTType && !AST_NODE_TYPES[customType]) {
            throw new Error(`Unknown AST_NODE_TYPE: "${customType}"`);
        }
        result.type = customType;
        Object
            .keys(node)
            .filter(key => !(/^(?:_children|kind|parent|pos|end|flags|modifierFlagsCache|jsDoc)$/.test(key)))
            .forEach(key => {
                if (key === "type") {
                    result.typeAnnotation = (node.type) ? convertTypeAnnotation(node.type) : null;
                } else if (key === "typeArguments") {
                    result.typeParameters = (node.typeArguments)
                        ? convertTypeArgumentsToTypeParameters(node.typeArguments)
                        : null;
                } else if (key === "typeParameters") {
                    result.typeParameters = (node.typeParameters)
                        ? convertTSTypeParametersToTypeParametersDeclaration(node.typeParameters)
                        : null;
                } else if (key === "decorators") {
                    const decorators = convertDecorators(node.decorators);
                    if (decorators && decorators.length) {
                        result.decorators = decorators;
                    }
                } else {
                    if (Array.isArray(node[key])) {
                        result[key] = node[key].map(convertChild);
                    } else if (node[key] && typeof node[key] === "object") {
                        result[key] = convertChild(node[key]);
                    } else {
                        result[key] = node[key];
                    }
                }
            });
    }

    /**
     * Converts a TypeScript JSX node.tagName into an ESTree node.name
     * @param {Object} tagName  the tagName object from a JSX TSNode
     * @param  {Object} ast   the AST object
     * @returns {Object}    the converted ESTree name object
     */
    function convertTypeScriptJSXTagNameToESTreeName(tagName) {
        const tagNameToken = nodeUtils.convertToken(tagName, ast);

        if (tagNameToken.type === AST_NODE_TYPES.JSXMemberExpression) {

            const isNestedMemberExpression = (node.tagName.expression.kind === SyntaxKind.PropertyAccessExpression);

            // Convert TSNode left and right objects into ESTreeNode object
            // and property objects
            tagNameToken.object = convertChild(node.tagName.expression);
            tagNameToken.property = convertChild(node.tagName.name);

            // Assign the appropriate types
            tagNameToken.object.type = (isNestedMemberExpression) ? AST_NODE_TYPES.JSXMemberExpression : AST_NODE_TYPES.JSXIdentifier;
            tagNameToken.property.type = AST_NODE_TYPES.JSXIdentifier;
            if (tagName.expression.kind === SyntaxKind.ThisKeyword) {
                tagNameToken.object.name = "this";
            }
        } else {
            tagNameToken.type = AST_NODE_TYPES.JSXIdentifier;
            tagNameToken.name = tagNameToken.value;
        }

        delete tagNameToken.value;

        return tagNameToken;
    }

    /**
     * Applies the given TS modifiers to the given result object.
     * @param {TSNode[]} modifiers original TSNodes from the node.modifiers array
     * @returns {void} (the current result object will be mutated)
     */
    function applyModifiersToResult(modifiers) {
        if (!modifiers || !modifiers.length) {
            return;
        }
        /**
         * Some modifiers are explicitly handled by applying them as
         * boolean values on the result node. As well as adding them
         * to the result, we remove them from the array, so that they
         * are not handled twice.
         */
        const handledModifierIndices = {};
        for (let i = 0; i < modifiers.length; i++) {
            const modifier = modifiers[i];
            switch (modifier.kind) {
                /**
                 * Ignore ExportKeyword and DefaultKeyword, they are handled
                 * via the fixExports utility function
                 */
                case SyntaxKind.ExportKeyword:
                case SyntaxKind.DefaultKeyword:
                    handledModifierIndices[i] = true;
                    break;
                case SyntaxKind.ConstKeyword:
                    result.const = true;
                    handledModifierIndices[i] = true;
                    break;
                case SyntaxKind.DeclareKeyword:
                    result.declare = true;
                    handledModifierIndices[i] = true;
                    break;
                default:
            }
        }
        /**
         * If there are still valid modifiers available which have
         * not been explicitly handled above, we just convert and
         * add the modifiers array to the result node.
         */
        const remainingModifiers = modifiers.filter((_, i) => !handledModifierIndices[i]);
        if (!remainingModifiers || !remainingModifiers.length) {
            return;
        }
        result.modifiers = remainingModifiers.map(convertChild);
    }

    /**
     * Uses the current TSNode's end location for its `type` to adjust the location data of the given
     * ESTreeNode, which should be the parent of the final typeAnnotation node
     * @param {ESTreeNode} typeAnnotationParent The node that will have its location data mutated
     * @returns {void}
     */
    function fixTypeAnnotationParentLocation(typeAnnotationParent) {
        const end = node.type.getEnd();
        typeAnnotationParent.range[1] = end;
        const loc = nodeUtils.getLocFor(typeAnnotationParent.range[0], typeAnnotationParent.range[1], ast);
        typeAnnotationParent.loc = loc;
    }

    /**
     * The core of the conversion logic:
     * Identify and convert each relevant TypeScript SyntaxKind
     */
    switch (node.kind) {

        case SyntaxKind.SourceFile:
            Object.assign(result, {
                type: AST_NODE_TYPES.Program,
                body: [],
                sourceType: node.externalModuleIndicator ? "module" : "script"
            });

            // filter out unknown nodes for now
            node.statements.forEach(statement => {
                const convertedStatement = convertChild(statement);
                if (convertedStatement) {
                    result.body.push(convertedStatement);
                }
            });

            result.range[1] = node.endOfFileToken.end;
            result.loc = nodeUtils.getLocFor(node.getStart(), result.range[1], ast);
            break;

        case SyntaxKind.Block:
            Object.assign(result, {
                type: AST_NODE_TYPES.BlockStatement,
                body: node.statements.map(convertChild)
            });
            break;

        case SyntaxKind.Identifier:
            Object.assign(result, {
                type: AST_NODE_TYPES.Identifier,
                name: nodeUtils.unescapeIdentifier(node.text)
            });
            break;

        case SyntaxKind.WithStatement:
            Object.assign(result, {
                type: AST_NODE_TYPES.WithStatement,
                object: convertChild(node.expression),
                body: convertChild(node.statement)
            });
            break;

        // Control Flow

        case SyntaxKind.ReturnStatement:
            Object.assign(result, {
                type: AST_NODE_TYPES.ReturnStatement,
                argument: convertChild(node.expression)
            });
            break;

        case SyntaxKind.LabeledStatement:
            Object.assign(result, {
                type: AST_NODE_TYPES.LabeledStatement,
                label: convertChild(node.label),
                body: convertChild(node.statement)
            });
            break;

        case SyntaxKind.BreakStatement:
        case SyntaxKind.ContinueStatement:
            Object.assign(result, {
                type: SyntaxKind[node.kind],
                label: convertChild(node.label)
            });
            break;

        // Choice

        case SyntaxKind.IfStatement:
            Object.assign(result, {
                type: AST_NODE_TYPES.IfStatement,
                test: convertChild(node.expression),
                consequent: convertChild(node.thenStatement),
                alternate: convertChild(node.elseStatement)
            });
            break;

        case SyntaxKind.SwitchStatement:
            Object.assign(result, {
                type: AST_NODE_TYPES.SwitchStatement,
                discriminant: convertChild(node.expression),
                cases: node.caseBlock.clauses.map(convertChild)
            });
            break;

        case SyntaxKind.CaseClause:
        case SyntaxKind.DefaultClause:
            Object.assign(result, {
                type: AST_NODE_TYPES.SwitchCase,
                test: convertChild(node.expression),
                consequent: node.statements.map(convertChild)
            });
            break;

        // Exceptions

        case SyntaxKind.ThrowStatement:
            Object.assign(result, {
                type: AST_NODE_TYPES.ThrowStatement,
                argument: convertChild(node.expression)
            });
            break;

        case SyntaxKind.TryStatement:
            Object.assign(result, {
                type: AST_NODE_TYPES.TryStatement,
                block: convert({ node: node.tryBlock, parent: null, ast, additionalOptions }),
                handler: convertChild(node.catchClause),
                finalizer: convertChild(node.finallyBlock)
            });
            break;

        case SyntaxKind.CatchClause:
            Object.assign(result, {
                type: AST_NODE_TYPES.CatchClause,
                param: node.variableDeclaration ? convertChild(node.variableDeclaration.name) : null,
                body: convertChild(node.block)
            });
            break;

        // Loops

        case SyntaxKind.WhileStatement:
            Object.assign(result, {
                type: AST_NODE_TYPES.WhileStatement,
                test: convertChild(node.expression),
                body: convertChild(node.statement)
            });
            break;

        /**
         * Unlike other parsers, TypeScript calls a "DoWhileStatement"
         * a "DoStatement"
         */
        case SyntaxKind.DoStatement:
            Object.assign(result, {
                type: AST_NODE_TYPES.DoWhileStatement,
                test: convertChild(node.expression),
                body: convertChild(node.statement)
            });
            break;

        case SyntaxKind.ForStatement:
            Object.assign(result, {
                type: AST_NODE_TYPES.ForStatement,
                init: convertChild(node.initializer),
                test: convertChild(node.condition),
                update: convertChild(node.incrementor),
                body: convertChild(node.statement)
            });
            break;

        case SyntaxKind.ForInStatement:
        case SyntaxKind.ForOfStatement: {
            const isAwait = !!(node.awaitModifier && node.awaitModifier.kind === SyntaxKind.AwaitKeyword);
            Object.assign(result, {
                type: SyntaxKind[node.kind],
                left: convertChild(node.initializer),
                right: convertChild(node.expression),
                body: convertChild(node.statement),
                await: isAwait
            });
            break;
        }

        // Declarations

        case SyntaxKind.FunctionDeclaration: {

            let functionDeclarationType = AST_NODE_TYPES.FunctionDeclaration;

            if (node.modifiers && node.modifiers.length) {
                const isDeclareFunction = nodeUtils.hasModifier(SyntaxKind.DeclareKeyword, node);
                if (isDeclareFunction) {
                    functionDeclarationType = AST_NODE_TYPES.DeclareFunction;
                }
            }

            Object.assign(result, {
                type: functionDeclarationType,
                id: convertChild(node.name),
                generator: !!node.asteriskToken,
                expression: false,
                async: nodeUtils.hasModifier(SyntaxKind.AsyncKeyword, node),
                params: convertParameters(node.parameters),
                body: convertChild(node.body)
            });

            // Process returnType
            if (node.type) {
                result.returnType = convertTypeAnnotation(node.type);
            }

            // Process typeParameters
            if (node.typeParameters && node.typeParameters.length) {
                result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(node.typeParameters);
            }

            namespaceEmptyBodyFunctionForESLint(result);

            // check for exports
            result = nodeUtils.fixExports(node, result, ast);

            break;

        }

        case SyntaxKind.VariableDeclaration: {
            Object.assign(result, {
                type: AST_NODE_TYPES.VariableDeclarator,
                id: convertChild(node.name),
                init: convertChild(node.initializer)
            });

            if (node.exclamationToken) {
                result.definite = true;
            }

            if (node.type) {
                result.id.typeAnnotation = convertTypeAnnotation(node.type);
                fixTypeAnnotationParentLocation(result.id);
            }
            break;
        }

        case SyntaxKind.VariableStatement:
            Object.assign(result, {
                type: AST_NODE_TYPES.VariableDeclaration,
                declarations: node.declarationList.declarations.map(convertChild),
                kind: nodeUtils.getDeclarationKind(node.declarationList)
            });

            // check for exports
            result = nodeUtils.fixExports(node, result, ast);
            break;

        // mostly for for-of, for-in
        case SyntaxKind.VariableDeclarationList:
            Object.assign(result, {
                type: AST_NODE_TYPES.VariableDeclaration,
                declarations: node.declarations.map(convertChild),
                kind: nodeUtils.getDeclarationKind(node)
            });
            break;

        // Expressions

        case SyntaxKind.ExpressionStatement:
            Object.assign(result, {
                type: AST_NODE_TYPES.ExpressionStatement,
                expression: convertChild(node.expression)
            });
            break;

        case SyntaxKind.ThisKeyword:
            Object.assign(result, {
                type: AST_NODE_TYPES.ThisExpression
            });
            break;

        case SyntaxKind.ArrayLiteralExpression: {

            const arrayAssignNode = nodeUtils.findAncestorOfKind(node, SyntaxKind.BinaryExpression);
            const arrayIsInForOf = node.parent && node.parent.kind === SyntaxKind.ForOfStatement;
            const arrayIsInForIn = node.parent && node.parent.kind === SyntaxKind.ForInStatement;
            let arrayIsInAssignment;

            if (arrayAssignNode) {
                if (arrayAssignNode.left === node) {
                    arrayIsInAssignment = true;
                } else {
                    arrayIsInAssignment = (nodeUtils.findChildOfKind(arrayAssignNode.left, SyntaxKind.ArrayLiteralExpression, ast) === node);
                }
            }

            // TypeScript uses ArrayLiteralExpression in destructuring assignment, too
            if (arrayIsInAssignment || arrayIsInForOf || arrayIsInForIn) {
                Object.assign(result, {
                    type: AST_NODE_TYPES.ArrayPattern,
                    elements: node.elements.map(convertChild)
                });
            } else {
                Object.assign(result, {
                    type: AST_NODE_TYPES.ArrayExpression,
                    elements: node.elements.map(convertChild)
                });
            }
            break;

        }

        case SyntaxKind.ObjectLiteralExpression: {

            const ancestorNode = nodeUtils.findFirstMatchingAncestor(
                node,
                parentNode =>
                    (parentNode.kind === SyntaxKind.BinaryExpression || parentNode.kind === SyntaxKind.ArrowFunction)
            );
            const objectAssignNode = (
                ancestorNode &&
                ancestorNode.kind === SyntaxKind.BinaryExpression &&
                ancestorNode.operatorToken.kind === SyntaxKind.FirstAssignment
            ) ? ancestorNode : null;

            let objectIsInAssignment = false;

            if (objectAssignNode) {
                if (objectAssignNode.left === node) {
                    objectIsInAssignment = true;
                } else {
                    objectIsInAssignment = (nodeUtils.findChildOfKind(objectAssignNode.left, SyntaxKind.ObjectLiteralExpression, ast) === node);
                }
            }

            // TypeScript uses ObjectLiteralExpression in destructuring assignment, too
            if (objectIsInAssignment) {
                Object.assign(result, {
                    type: AST_NODE_TYPES.ObjectPattern,
                    properties: node.properties.map(convertChild)
                });
            } else {
                Object.assign(result, {
                    type: AST_NODE_TYPES.ObjectExpression,
                    properties: node.properties.map(convertChild)
                });
            }

            break;

        }

        case SyntaxKind.PropertyAssignment:
            Object.assign(result, {
                type: AST_NODE_TYPES.Property,
                key: convertChild(node.name),
                value: convertChild(node.initializer),
                computed: nodeUtils.isComputedProperty(node.name),
                method: false,
                shorthand: false,
                kind: "init"
            });
            break;

        case SyntaxKind.ShorthandPropertyAssignment: {
            if (node.objectAssignmentInitializer) {
                Object.assign(result, {
                    type: AST_NODE_TYPES.Property,
                    key: convertChild(node.name),
                    value: {
                        type: AST_NODE_TYPES.AssignmentPattern,
                        left: convertChild(node.name),
                        right: convertChild(node.objectAssignmentInitializer),
                        loc: result.loc,
                        range: result.range
                    },
                    computed: false,
                    method: false,
                    shorthand: true,
                    kind: "init"
                });
            } else {
                Object.assign(result, {
                    type: AST_NODE_TYPES.Property,
                    key: convertChild(node.name),
                    value: convertChild(node.initializer || node.name),
                    computed: false,
                    method: false,
                    shorthand: true,
                    kind: "init"
                });
            }
            break;
        }

        case SyntaxKind.ComputedPropertyName:

            if (parent.kind === SyntaxKind.ObjectLiteralExpression) {
                Object.assign(result, {
                    type: AST_NODE_TYPES.Property,
                    key: convertChild(node.name),
                    value: convertChild(node.name),
                    computed: false,
                    method: false,
                    shorthand: true,
                    kind: "init"
                });
            } else {
                return convertChild(node.expression);
            }
            break;

        case SyntaxKind.PropertyDeclaration: {
            const isAbstract = nodeUtils.hasModifier(SyntaxKind.AbstractKeyword, node);
            Object.assign(result, {
                type: (isAbstract) ? AST_NODE_TYPES.TSAbstractClassProperty : AST_NODE_TYPES.ClassProperty,
                key: convertChild(node.name),
                value: convertChild(node.initializer),
                computed: nodeUtils.isComputedProperty(node.name),
                static: nodeUtils.hasStaticModifierFlag(node),
                readonly: nodeUtils.hasModifier(SyntaxKind.ReadonlyKeyword, node) || undefined
            });

            if (node.type) {
                result.typeAnnotation = convertTypeAnnotation(node.type);
            }

            if (node.decorators) {
                result.decorators = convertDecorators(node.decorators);
            }

            const accessibility = nodeUtils.getTSNodeAccessibility(node);
            if (accessibility) {
                result.accessibility = accessibility;
            }

            if (node.name.kind === SyntaxKind.Identifier && node.questionToken) {
                result.key.optional = true;
            }

            if (node.exclamationToken) {
                result.definite = true;
            }

            if (result.key.type === AST_NODE_TYPES.Literal && node.questionToken) {
                result.optional = true;
            }
            break;
        }

        case SyntaxKind.GetAccessor:
        case SyntaxKind.SetAccessor:
        case SyntaxKind.MethodDeclaration: {

            const openingParen = nodeUtils.findFirstMatchingToken(node.name, ast, token => {
                if (!token || !token.kind) {
                    return false;
                }
                return nodeUtils.getTextForTokenKind(token.kind) === "(";
            });

            const methodLoc = ast.getLineAndCharacterOfPosition(openingParen.getStart()),
                nodeIsMethod = (node.kind === SyntaxKind.MethodDeclaration),
                method = {
                    type: AST_NODE_TYPES.FunctionExpression,
                    id: null,
                    generator: !!node.asteriskToken,
                    expression: false,
                    async: nodeUtils.hasModifier(SyntaxKind.AsyncKeyword, node),
                    body: convertChild(node.body),
                    range: [node.parameters.pos - 1, result.range[1]],
                    loc: {
                        start: {
                            line: methodLoc.line + 1,
                            column: methodLoc.character
                        },
                        end: result.loc.end
                    }
                };

            if (node.type) {
                method.returnType = convertTypeAnnotation(node.type);
            }

            if (parent.kind === SyntaxKind.ObjectLiteralExpression) {

                method.params = node.parameters.map(convertChild);

                Object.assign(result, {
                    type: AST_NODE_TYPES.Property,
                    key: convertChild(node.name),
                    value: method,
                    computed: nodeUtils.isComputedProperty(node.name),
                    method: nodeIsMethod,
                    shorthand: false,
                    kind: "init"
                });

            } else { // class

                /**
                 * Unlike in object literal methods, class method params can have decorators
                 */
                method.params = convertParameters(node.parameters);

                /**
                 * TypeScript class methods can be defined as "abstract"
                 */
                const methodDefinitionType = nodeUtils.hasModifier(SyntaxKind.AbstractKeyword, node)
                    ? AST_NODE_TYPES.TSAbstractMethodDefinition
                    : AST_NODE_TYPES.MethodDefinition;

                Object.assign(result, {
                    type: methodDefinitionType,
                    key: convertChild(node.name),
                    value: method,
                    computed: nodeUtils.isComputedProperty(node.name),
                    static: nodeUtils.hasStaticModifierFlag(node),
                    kind: "method"
                });

                if (node.decorators) {
                    result.decorators = convertDecorators(node.decorators);
                }

                const accessibility = nodeUtils.getTSNodeAccessibility(node);
                if (accessibility) {
                    result.accessibility = accessibility;
                }

            }

            if (result.key.type === AST_NODE_TYPES.Identifier && node.questionToken) {
                result.key.optional = true;
            }

            if (node.kind === SyntaxKind.GetAccessor) {
                result.kind = "get";
            } else if (node.kind === SyntaxKind.SetAccessor) {
                result.kind = "set";
            } else if (!result.static && node.name.kind === SyntaxKind.StringLiteral && node.name.text === "constructor") {
                result.kind = "constructor";
            }

            // Process typeParameters
            if (node.typeParameters && node.typeParameters.length) {
                method.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(node.typeParameters);
            }

            namespaceEmptyBodyFunctionForESLint(result.value);

            break;

        }

        // TypeScript uses this even for static methods named "constructor"
        case SyntaxKind.Constructor: {

            const constructorIsStatic = nodeUtils.hasStaticModifierFlag(node),
                constructorIsAbstract = nodeUtils.hasModifier(SyntaxKind.AbstractKeyword, node),
                firstConstructorToken = constructorIsStatic ? nodeUtils.findNextToken(node.getFirstToken(), ast) : node.getFirstToken(),
                constructorLoc = ast.getLineAndCharacterOfPosition(node.parameters.pos - 1),
                constructor = {
                    type: AST_NODE_TYPES.FunctionExpression,
                    id: null,
                    params: convertParameters(node.parameters),
                    generator: false,
                    expression: false,
                    async: false,
                    body: convertChild(node.body),
                    range: [node.parameters.pos - 1, result.range[1]],
                    loc: {
                        start: {
                            line: constructorLoc.line + 1,
                            column: constructorLoc.character
                        },
                        end: result.loc.end
                    }
                };

            const constructorIdentifierLocStart = ast.getLineAndCharacterOfPosition(firstConstructorToken.getStart()),
                constructorIdentifierLocEnd = ast.getLineAndCharacterOfPosition(firstConstructorToken.getEnd()),
                constructorIsComputed = !!node.name && nodeUtils.isComputedProperty(node.name);

            let constructorKey;

            if (constructorIsComputed) {
                constructorKey = {
                    type: AST_NODE_TYPES.Literal,
                    value: "constructor",
                    raw: node.name.getText(),
                    range: [firstConstructorToken.getStart(), firstConstructorToken.end],
                    loc: {
                        start: {
                            line: constructorIdentifierLocStart.line + 1,
                            column: constructorIdentifierLocStart.character
                        },
                        end: {
                            line: constructorIdentifierLocEnd.line + 1,
                            column: constructorIdentifierLocEnd.character
                        }
                    }
                };
            } else {
                constructorKey = {
                    type: AST_NODE_TYPES.Identifier,
                    name: "constructor",
                    range: [firstConstructorToken.getStart(), firstConstructorToken.end],
                    loc: {
                        start: {
                            line: constructorIdentifierLocStart.line + 1,
                            column: constructorIdentifierLocStart.character
                        },
                        end: {
                            line: constructorIdentifierLocEnd.line + 1,
                            column: constructorIdentifierLocEnd.character
                        }
                    }
                };
            }

            Object.assign(result, {
                type: constructorIsAbstract ? AST_NODE_TYPES.TSAbstractMethodDefinition : AST_NODE_TYPES.MethodDefinition,
                key: constructorKey,
                value: constructor,
                computed: constructorIsComputed,
                static: constructorIsStatic,
                kind: (constructorIsStatic || constructorIsComputed) ? "method" : "constructor"
            });

            const accessibility = nodeUtils.getTSNodeAccessibility(node);
            if (accessibility) {
                result.accessibility = accessibility;
            }

            namespaceEmptyBodyFunctionForESLint(result.value);

            break;

        }

        case SyntaxKind.FunctionExpression:
            Object.assign(result, {
                type: AST_NODE_TYPES.FunctionExpression,
                id: convertChild(node.name),
                generator: !!node.asteriskToken,
                params: convertParameters(node.parameters),
                body: convertChild(node.body),
                async: nodeUtils.hasModifier(SyntaxKind.AsyncKeyword, node),
                expression: false
            });

            // Process returnType
            if (node.type) {
                result.returnType = convertTypeAnnotation(node.type);
            }

            // Process typeParameters
            if (node.typeParameters && node.typeParameters.length) {
                result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(node.typeParameters);
            }
            break;

        case SyntaxKind.SuperKeyword:
            Object.assign(result, {
                type: AST_NODE_TYPES.Super
            });
            break;

        case SyntaxKind.ArrayBindingPattern:
            Object.assign(result, {
                type: AST_NODE_TYPES.ArrayPattern,
                elements: node.elements.map(convertChild)
            });
            break;

        // occurs with missing array elements like [,]
        case SyntaxKind.OmittedExpression:
            return null;

        case SyntaxKind.ObjectBindingPattern:
            Object.assign(result, {
                type: AST_NODE_TYPES.ObjectPattern,
                properties: node.elements.map(convertChild)
            });
            break;

        case SyntaxKind.BindingElement:

            if (parent.kind === SyntaxKind.ArrayBindingPattern) {
                const arrayItem = convert({ node: node.name, parent, ast, additionalOptions });

                if (node.initializer) {
                    Object.assign(result, {
                        type: AST_NODE_TYPES.AssignmentPattern,
                        left: arrayItem,
                        right: convertChild(node.initializer)
                    });
                } else if (node.dotDotDotToken) {
                    Object.assign(result, {
                        type: AST_NODE_TYPES.RestElement,
                        argument: arrayItem
                    });
                } else {
                    return arrayItem;
                }
            } else if (parent.kind === SyntaxKind.ObjectBindingPattern) {

                if (node.dotDotDotToken) {
                    Object.assign(result, {
                        type: AST_NODE_TYPES.ExperimentalRestProperty,
                        argument: convertChild(node.propertyName || node.name),
                        computed: Boolean(node.propertyName && node.propertyName.kind === SyntaxKind.ComputedPropertyName),
                        shorthand: !node.propertyName
                    });
                } else {
                    Object.assign(result, {
                        type: AST_NODE_TYPES.Property,
                        key: convertChild(node.propertyName || node.name),
                        value: convertChild(node.name),
                        computed: Boolean(node.propertyName && node.propertyName.kind === SyntaxKind.ComputedPropertyName),
                        method: false,
                        shorthand: !node.propertyName,
                        kind: "init"
                    });
                }

                if (node.initializer) {
                    result.value = {
                        type: AST_NODE_TYPES.AssignmentPattern,
                        left: convertChild(node.name),
                        right: convertChild(node.initializer),
                        range: [node.name.getStart(), node.initializer.end],
                        loc: nodeUtils.getLocFor(node.name.getStart(), node.initializer.end, ast)
                    };
                }
            }
            break;


        case SyntaxKind.ArrowFunction:
            Object.assign(result, {
                type: AST_NODE_TYPES.ArrowFunctionExpression,
                generator: false,
                id: null,
                params: convertParameters(node.parameters),
                body: convertChild(node.body),
                async: nodeUtils.hasModifier(SyntaxKind.AsyncKeyword, node),
                expression: node.body.kind !== SyntaxKind.Block
            });

            // Process returnType
            if (node.type) {
                result.returnType = convertTypeAnnotation(node.type);
            }

            // Process typeParameters
            if (node.typeParameters && node.typeParameters.length) {
                result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(node.typeParameters);
            }
            break;

        case SyntaxKind.YieldExpression:
            Object.assign(result, {
                type: AST_NODE_TYPES.YieldExpression,
                delegate: !!node.asteriskToken,
                argument: convertChild(node.expression)
            });
            break;

        case SyntaxKind.AwaitExpression:
            Object.assign(result, {
                type: AST_NODE_TYPES.AwaitExpression,
                argument: convertChild(node.expression)
            });
            break;

        // Template Literals

        case SyntaxKind.NoSubstitutionTemplateLiteral:
            Object.assign(result, {
                type: AST_NODE_TYPES.TemplateLiteral,
                quasis: [
                    {
                        type: AST_NODE_TYPES.TemplateElement,
                        value: {
                            raw: ast.text.slice(node.getStart() + 1, node.end - 1),
                            cooked: node.text
                        },
                        tail: true,
                        range: result.range,
                        loc: result.loc
                    }
                ],
                expressions: []
            });
            break;

        case SyntaxKind.TemplateExpression:
            Object.assign(result, {
                type: AST_NODE_TYPES.TemplateLiteral,
                quasis: [convertChild(node.head)],
                expressions: []
            });

            node.templateSpans.forEach(templateSpan => {
                result.expressions.push(convertChild(templateSpan.expression));
                result.quasis.push(convertChild(templateSpan.literal));
            });
            break;

        case SyntaxKind.TaggedTemplateExpression:
            Object.assign(result, {
                type: AST_NODE_TYPES.TaggedTemplateExpression,
                typeParameters: (node.typeArguments)
                    ? convertTypeArgumentsToTypeParameters(node.typeArguments)
                    : undefined,
                tag: convertChild(node.tag),
                quasi: convertChild(node.template)
            });
            break;

        case SyntaxKind.TemplateHead:
        case SyntaxKind.TemplateMiddle:
        case SyntaxKind.TemplateTail: {
            const tail = (node.kind === SyntaxKind.TemplateTail);
            Object.assign(result, {
                type: AST_NODE_TYPES.TemplateElement,
                value: {
                    raw: ast.text.slice(node.getStart() + 1, node.end - (tail ? 1 : 2)),
                    cooked: node.text
                },
                tail
            });
            break;
        }

        // Patterns

        case SyntaxKind.SpreadElement: {
            let type = AST_NODE_TYPES.SpreadElement;

            if (node.parent &&
                node.parent.parent &&
                node.parent.parent.kind === SyntaxKind.BinaryExpression
            ) {
                if (node.parent.parent.left === node.parent) {
                    type = AST_NODE_TYPES.RestElement;
                } else if (node.parent.parent.right === node.parent) {
                    type = AST_NODE_TYPES.SpreadElement;
                }
            }

            Object.assign(result, {
                type,
                argument: convertChild(node.expression)
            });
            break;
        }
        case SyntaxKind.SpreadAssignment: {
            let type = AST_NODE_TYPES.ExperimentalSpreadProperty;

            if (node.parent &&
                node.parent.parent &&
                node.parent.parent.kind === SyntaxKind.BinaryExpression
            ) {
                if (node.parent.parent.right === node.parent) {
                    type = AST_NODE_TYPES.ExperimentalSpreadProperty;
                } else if (node.parent.parent.left === node.parent) {
                    type = AST_NODE_TYPES.ExperimentalRestProperty;
                }
            }

            Object.assign(result, {
                type,
                argument: convertChild(node.expression)
            });
            break;
        }

        case SyntaxKind.Parameter: {
            let parameter;

            if (node.dotDotDotToken) {
                parameter = convertChild(node.name);
                Object.assign(result, {
                    type: AST_NODE_TYPES.RestElement,
                    argument: parameter
                });
            } else if (node.initializer) {
                parameter = convertChild(node.name);
                Object.assign(result, {
                    type: AST_NODE_TYPES.AssignmentPattern,
                    left: parameter,
                    right: convertChild(node.initializer)
                });
            } else {
                parameter = convert({ node: node.name, parent, ast, additionalOptions });
                result = parameter;
            }

            if (node.type) {
                parameter.typeAnnotation = convertTypeAnnotation(node.type);
                fixTypeAnnotationParentLocation(parameter);
            }

            if (node.questionToken) {
                parameter.optional = true;
            }

            if (node.modifiers) {
                return {
                    type: AST_NODE_TYPES.TSParameterProperty,
                    range: [node.getStart(), node.end],
                    loc: nodeUtils.getLoc(node, ast),
                    accessibility: nodeUtils.getTSNodeAccessibility(node) || undefined,
                    readonly: nodeUtils.hasModifier(SyntaxKind.ReadonlyKeyword, node) || undefined,
                    static: nodeUtils.hasModifier(SyntaxKind.StaticKeyword, node) || undefined,
                    export: nodeUtils.hasModifier(SyntaxKind.ExportKeyword, node) || undefined,
                    parameter: result
                };
            }

            break;

        }

        // Classes

        case SyntaxKind.ClassDeclaration:
        case SyntaxKind.ClassExpression: {

            const heritageClauses = node.heritageClauses || [];

            let classNodeType = SyntaxKind[node.kind];
            let lastClassToken = heritageClauses.length ? heritageClauses[heritageClauses.length - 1] : node.name;

            if (node.typeParameters && node.typeParameters.length) {
                const lastTypeParameter = node.typeParameters[node.typeParameters.length - 1];

                if (!lastClassToken || lastTypeParameter.pos > lastClassToken.pos) {
                    lastClassToken = nodeUtils.findNextToken(lastTypeParameter, ast);
                }
                result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(node.typeParameters);
            }

            if (node.modifiers && node.modifiers.length) {

                /**
                 * TypeScript class declarations can be defined as "abstract"
                 */
                if (node.kind === SyntaxKind.ClassDeclaration) {
                    if (nodeUtils.hasModifier(SyntaxKind.AbstractKeyword, node)) {
                        classNodeType = `TSAbstract${classNodeType}`;
                    }
                }

                /**
                 * We need check for modifiers, and use the last one, as there
                 * could be multiple before the open brace
                 */
                const lastModifier = node.modifiers[node.modifiers.length - 1];

                if (!lastClassToken || lastModifier.pos > lastClassToken.pos) {
                    lastClassToken = nodeUtils.findNextToken(lastModifier, ast);
                }

            } else if (!lastClassToken) { // no name
                lastClassToken = node.getFirstToken();
            }

            const openBrace = nodeUtils.findNextToken(lastClassToken, ast);
            const superClass = heritageClauses.find(clause => clause.token === SyntaxKind.ExtendsKeyword);

            if (superClass && superClass.types[0] && superClass.types[0].typeArguments) {
                result.superTypeParameters = convertTypeArgumentsToTypeParameters(superClass.types[0].typeArguments);
            }

            const implementsClause = heritageClauses.find(clause => clause.token === SyntaxKind.ImplementsKeyword);

            Object.assign(result, {
                type: classNodeType,
                id: convertChild(node.name),
                body: {
                    type: AST_NODE_TYPES.ClassBody,
                    body: [],

                    // TODO: Fix location info
                    range: [openBrace.getStart(), result.range[1]],
                    loc: nodeUtils.getLocFor(openBrace.getStart(), node.end, ast)
                },
                superClass: (superClass && superClass.types[0] ? convertChild(superClass.types[0].expression) : null)
            });

            if (implementsClause) {
                result.implements = implementsClause.types.map(convertClassImplements);
            }

            if (node.decorators) {
                result.decorators = convertDecorators(node.decorators);
            }

            const filteredMembers = node.members.filter(nodeUtils.isESTreeClassMember);

            if (filteredMembers.length) {
                result.body.body = filteredMembers.map(convertChild);
            }

            // check for exports
            result = nodeUtils.fixExports(node, result, ast);

            break;

        }

        // Modules
        case SyntaxKind.ModuleBlock:
            Object.assign(result, {
                type: AST_NODE_TYPES.TSModuleBlock,
                body: node.statements.map(convertChild)
            });
            break;

        case SyntaxKind.ImportDeclaration:
            Object.assign(result, {
                type: AST_NODE_TYPES.ImportDeclaration,
                source: convertChild(node.moduleSpecifier),
                specifiers: []
            });

            if (node.importClause) {
                if (node.importClause.name) {
                    result.specifiers.push(convertChild(node.importClause));
                }

                if (node.importClause.namedBindings) {
                    if (node.importClause.namedBindings.kind === SyntaxKind.NamespaceImport) {
                        result.specifiers.push(convertChild(node.importClause.namedBindings));
                    } else {
                        result.specifiers = result.specifiers.concat(node.importClause.namedBindings.elements.map(convertChild));
                    }
                }
            }

            break;

        case SyntaxKind.NamespaceImport:
            Object.assign(result, {
                type: AST_NODE_TYPES.ImportNamespaceSpecifier,
                local: convertChild(node.name)
            });
            break;

        case SyntaxKind.ImportSpecifier:
            Object.assign(result, {
                type: AST_NODE_TYPES.ImportSpecifier,
                local: convertChild(node.name),
                imported: convertChild(node.propertyName || node.name)
            });
            break;

        case SyntaxKind.ImportClause:
            Object.assign(result, {
                type: AST_NODE_TYPES.ImportDefaultSpecifier,
                local: convertChild(node.name)
            });

            // have to adjust location information due to tree differences
            result.range[1] = node.name.end;
            result.loc = nodeUtils.getLocFor(result.range[0], result.range[1], ast);
            break;

        case SyntaxKind.NamedImports:
            Object.assign(result, {
                type: AST_NODE_TYPES.ImportDefaultSpecifier,
                local: convertChild(node.name)
            });
            break;

        case SyntaxKind.ExportDeclaration:
            if (node.exportClause) {
                Object.assign(result, {
                    type: AST_NODE_TYPES.ExportNamedDeclaration,
                    source: convertChild(node.moduleSpecifier),
                    specifiers: node.exportClause.elements.map(convertChild),
                    declaration: null
                });
            } else {
                Object.assign(result, {
                    type: AST_NODE_TYPES.ExportAllDeclaration,
                    source: convertChild(node.moduleSpecifier)
                });
            }
            break;

        case SyntaxKind.ExportSpecifier:
            Object.assign(result, {
                type: AST_NODE_TYPES.ExportSpecifier,
                local: convertChild(node.propertyName || node.name),
                exported: convertChild(node.name)
            });
            break;

        case SyntaxKind.ExportAssignment:
            if (node.isExportEquals) {
                Object.assign(result, {
                    type: AST_NODE_TYPES.TSExportAssignment,
                    expression: convertChild(node.expression)
                });
            } else {
                Object.assign(result, {
                    type: AST_NODE_TYPES.ExportDefaultDeclaration,
                    declaration: convertChild(node.expression)
                });
            }
            break;

        // Unary Operations

        case SyntaxKind.PrefixUnaryExpression:
        case SyntaxKind.PostfixUnaryExpression: {
            const operator = nodeUtils.getTextForTokenKind(node.operator);
            Object.assign(result, {
                /**
                 * ESTree uses UpdateExpression for ++/--
                 */
                type: /^(?:\+\+|--)$/.test(operator) ? AST_NODE_TYPES.UpdateExpression : AST_NODE_TYPES.UnaryExpression,
                operator,
                prefix: node.kind === SyntaxKind.PrefixUnaryExpression,
                argument: convertChild(node.operand)
            });
            break;
        }

        case SyntaxKind.DeleteExpression:
            Object.assign(result, {
                type: AST_NODE_TYPES.UnaryExpression,
                operator: "delete",
                prefix: true,
                argument: convertChild(node.expression)
            });
            break;

        case SyntaxKind.VoidExpression:
            Object.assign(result, {
                type: AST_NODE_TYPES.UnaryExpression,
                operator: "void",
                prefix: true,
                argument: convertChild(node.expression)
            });
            break;

        case SyntaxKind.TypeOfExpression:
            Object.assign(result, {
                type: AST_NODE_TYPES.UnaryExpression,
                operator: "typeof",
                prefix: true,
                argument: convertChild(node.expression)
            });
            break;

        case SyntaxKind.TypeOperator:
            Object.assign(result, {
                type: AST_NODE_TYPES.TSTypeOperator,
                operator: nodeUtils.getTextForTokenKind(node.operator),
                typeAnnotation: convertChild(node.type)
            });
            break;

        // Binary Operations

        case SyntaxKind.BinaryExpression:

            // TypeScript uses BinaryExpression for sequences as well
            if (nodeUtils.isComma(node.operatorToken)) {
                Object.assign(result, {
                    type: AST_NODE_TYPES.SequenceExpression,
                    expressions: []
                });

                const left = convertChild(node.left),
                    right = convertChild(node.right);

                if (left.type === AST_NODE_TYPES.SequenceExpression) {
                    result.expressions = result.expressions.concat(left.expressions);
                } else {
                    result.expressions.push(left);
                }

                if (right.type === AST_NODE_TYPES.SequenceExpression) {
                    result.expressions = result.expressions.concat(right.expressions);
                } else {
                    result.expressions.push(right);
                }

            } else if (node.operatorToken && node.operatorToken.kind === SyntaxKind.AsteriskAsteriskEqualsToken) {
                Object.assign(result, {
                    type: AST_NODE_TYPES.AssignmentExpression,
                    operator: nodeUtils.getTextForTokenKind(node.operatorToken.kind),
                    left: convertChild(node.left),
                    right: convertChild(node.right)
                });
            } else {
                Object.assign(result, {
                    type: nodeUtils.getBinaryExpressionType(node.operatorToken),
                    operator: nodeUtils.getTextForTokenKind(node.operatorToken.kind),
                    left: convertChild(node.left),
                    right: convertChild(node.right)
                });

                // if the binary expression is in a destructured array, switch it
                if (result.type === AST_NODE_TYPES.AssignmentExpression) {
                    const upperArrayNode = nodeUtils.findAncestorOfKind(node, SyntaxKind.ArrayLiteralExpression),
                        upperArrayAssignNode = upperArrayNode && nodeUtils.findAncestorOfKind(upperArrayNode, SyntaxKind.BinaryExpression);

                    let upperArrayIsInAssignment;

                    if (upperArrayAssignNode) {
                        if (upperArrayAssignNode.left === upperArrayNode) {
                            upperArrayIsInAssignment = true;
                        } else {
                            upperArrayIsInAssignment = (nodeUtils.findChildOfKind(upperArrayAssignNode.left, SyntaxKind.ArrayLiteralExpression, ast) === upperArrayNode);
                        }
                    }

                    if (upperArrayIsInAssignment) {
                        delete result.operator;
                        result.type = AST_NODE_TYPES.AssignmentPattern;
                    }
                }
            }
            break;

        case SyntaxKind.PropertyAccessExpression:
            if (nodeUtils.isJSXToken(parent)) {
                const jsxMemberExpression = {
                    type: AST_NODE_TYPES.MemberExpression,
                    object: convertChild(node.expression),
                    property: convertChild(node.name)
                };
                const isNestedMemberExpression = (node.expression.kind === SyntaxKind.PropertyAccessExpression);
                if (node.expression.kind === SyntaxKind.ThisKeyword) {
                    jsxMemberExpression.object.name = "this";
                }

                jsxMemberExpression.object.type = (isNestedMemberExpression) ? AST_NODE_TYPES.MemberExpression : AST_NODE_TYPES.JSXIdentifier;
                jsxMemberExpression.property.type = AST_NODE_TYPES.JSXIdentifier;
                Object.assign(result, jsxMemberExpression);
            } else {
                Object.assign(result, {
                    type: AST_NODE_TYPES.MemberExpression,
                    object: convertChild(node.expression),
                    property: convertChild(node.name),
                    computed: false
                });
            }
            break;

        case SyntaxKind.ElementAccessExpression:
            Object.assign(result, {
                type: AST_NODE_TYPES.MemberExpression,
                object: convertChild(node.expression),
                property: convertChild(node.argumentExpression),
                computed: true
            });
            break;

        case SyntaxKind.ConditionalExpression:
            Object.assign(result, {
                type: AST_NODE_TYPES.ConditionalExpression,
                test: convertChild(node.condition),
                consequent: convertChild(node.whenTrue),
                alternate: convertChild(node.whenFalse)
            });
            break;

        case SyntaxKind.CallExpression:
            Object.assign(result, {
                type: AST_NODE_TYPES.CallExpression,
                callee: convertChild(node.expression),
                arguments: node.arguments.map(convertChild)
            });
            if (node.typeArguments && node.typeArguments.length) {
                result.typeParameters = convertTypeArgumentsToTypeParameters(node.typeArguments);
            }
            break;

        case SyntaxKind.NewExpression:
            Object.assign(result, {
                type: AST_NODE_TYPES.NewExpression,
                callee: convertChild(node.expression),
                arguments: (node.arguments) ? node.arguments.map(convertChild) : []
            });
            if (node.typeArguments && node.typeArguments.length) {
                result.typeParameters = convertTypeArgumentsToTypeParameters(node.typeArguments);
            }
            break;

        case SyntaxKind.MetaProperty: {
            const newToken = nodeUtils.convertToken(node.getFirstToken(), ast);
            Object.assign(result, {
                type: AST_NODE_TYPES.MetaProperty,
                meta: {
                    type: AST_NODE_TYPES.Identifier,
                    range: newToken.range,
                    loc: newToken.loc,
                    name: nodeUtils.getTextForTokenKind(node.keywordToken)
                },
                property: convertChild(node.name)
            });
            break;
        }

        // Literals

        case SyntaxKind.StringLiteral:
            Object.assign(result, {
                type: AST_NODE_TYPES.Literal,
                raw: ast.text.slice(result.range[0], result.range[1])
            });
            if (parent.name && parent.name === node) {
                result.value = nodeUtils.unescapeIdentifier(node.text);
            } else {
                result.value = nodeUtils.unescapeStringLiteralText(node.text);
            }
            break;

        case SyntaxKind.NumericLiteral:
            Object.assign(result, {
                type: AST_NODE_TYPES.Literal,
                value: Number(node.text),
                raw: ast.text.slice(result.range[0], result.range[1])
            });
            break;

        case SyntaxKind.RegularExpressionLiteral: {
            const pattern = node.text.slice(1, node.text.lastIndexOf("/"));
            const flags = node.text.slice(node.text.lastIndexOf("/") + 1);

            let regex = null;
            try {
                regex = new RegExp(pattern, flags);
            } catch (exception) {
                regex = null;
            }

            Object.assign(result, {
                type: AST_NODE_TYPES.Literal,
                value: regex,
                raw: node.text,
                regex: {
                    pattern,
                    flags
                }
            });
            break;
        }

        case SyntaxKind.TrueKeyword:
            Object.assign(result, {
                type: AST_NODE_TYPES.Literal,
                value: true,
                raw: "true"
            });
            break;

        case SyntaxKind.FalseKeyword:
            Object.assign(result, {
                type: AST_NODE_TYPES.Literal,
                value: false,
                raw: "false"
            });
            break;

        case SyntaxKind.NullKeyword: {
            if (nodeUtils.isWithinTypeAnnotation(node)) {
                Object.assign(result, {
                    type: AST_NODE_TYPES.TSNullKeyword
                });
            } else {
                Object.assign(result, {
                    type: AST_NODE_TYPES.Literal,
                    value: null,
                    raw: "null"
                });
            }
            break;
        }

        case SyntaxKind.ImportKeyword:
            Object.assign(result, {
                type: AST_NODE_TYPES.Import
            });
            break;

        case SyntaxKind.EmptyStatement:
        case SyntaxKind.DebuggerStatement:
            simplyCopy();
            break;

        // JSX

        case SyntaxKind.JsxElement:
            Object.assign(result, {
                type: AST_NODE_TYPES.JSXElement,
                openingElement: convertChild(node.openingElement),
                closingElement: convertChild(node.closingElement),
                children: node.children.map(convertChild)
            });

            break;

        case SyntaxKind.JsxSelfClosingElement: {
            /**
             * Convert SyntaxKind.JsxSelfClosingElement to SyntaxKind.JsxOpeningElement,
             * TypeScript does not seem to have the idea of openingElement when tag is self-closing
             */
            node.kind = SyntaxKind.JsxOpeningElement;

            const openingElement = convertChild(node);
            openingElement.selfClosing = true;

            Object.assign(result, {
                type: AST_NODE_TYPES.JSXElement,
                openingElement,
                closingElement: null,
                children: []
            });

            break;

        }

        case SyntaxKind.JsxOpeningElement:
            Object.assign(result, {
                type: AST_NODE_TYPES.JSXOpeningElement,
                typeParameters: (node.typeArguments)
                    ? convertTypeArgumentsToTypeParameters(node.typeArguments)
                    : undefined,
                selfClosing: false,
                name: convertTypeScriptJSXTagNameToESTreeName(node.tagName),
                attributes: node.attributes.properties.map(convertChild)
            });
            break;

        case SyntaxKind.JsxClosingElement:
            Object.assign(result, {
                type: AST_NODE_TYPES.JSXClosingElement,
                name: convertTypeScriptJSXTagNameToESTreeName(node.tagName)
            });
            break;

        case SyntaxKind.JsxExpression: {
            const eloc = ast.getLineAndCharacterOfPosition(result.range[0] + 1);
            const expression = (node.expression) ? convertChild(node.expression) : {
                type: AST_NODE_TYPES.JSXEmptyExpression,
                loc: {
                    start: {
                        line: eloc.line + 1,
                        column: eloc.character
                    },
                    end: {
                        line: result.loc.end.line,
                        column: result.loc.end.column - 1
                    }
                },
                range: [result.range[0] + 1, result.range[1] - 1]
            };

            Object.assign(result, {
                type: AST_NODE_TYPES.JSXExpressionContainer,
                expression
            });

            break;

        }

        case SyntaxKind.JsxAttribute: {
            const attributeName = nodeUtils.convertToken(node.name, ast);
            attributeName.type = AST_NODE_TYPES.JSXIdentifier;
            attributeName.name = attributeName.value;
            delete attributeName.value;

            Object.assign(result, {
                type: AST_NODE_TYPES.JSXAttribute,
                name: attributeName,
                value: convertChild(node.initializer)
            });

            break;

        }

        /**
         * The JSX AST changed the node type for string literals
         * inside a JSX Element from `Literal` to `JSXText`. We
         * provide a flag to support both types until `Literal`
         * node type is deprecated in ESLint v5.
         */
        case SyntaxKind.JsxText: {
            const start = node.getFullStart();
            const end = node.getEnd();

            const type = (additionalOptions.useJSXTextNode)
                ? AST_NODE_TYPES.JSXText : AST_NODE_TYPES.Literal;

            Object.assign(result, {
                type,
                value: ast.text.slice(start, end),
                raw: ast.text.slice(start, end)
            });

            result.loc = nodeUtils.getLocFor(start, end, ast);
            result.range = [start, end];

            break;
        }

        case SyntaxKind.JsxSpreadAttribute:
            Object.assign(result, {
                type: AST_NODE_TYPES.JSXSpreadAttribute,
                argument: convertChild(node.expression)
            });

            break;

        case SyntaxKind.FirstNode: {
            Object.assign(result, {
                type: AST_NODE_TYPES.TSQualifiedName,
                left: convertChild(node.left),
                right: convertChild(node.right)
            });

            break;
        }

        // TypeScript specific

        case SyntaxKind.ParenthesizedExpression:
            return convert({ node: node.expression, parent, ast, additionalOptions });

        /**
         * Convert TypeAliasDeclaration node into VariableDeclaration
         * to allow core rules such as "semi" to work automatically
         */
        case SyntaxKind.TypeAliasDeclaration: {
            const typeAliasDeclarator = {
                type: AST_NODE_TYPES.VariableDeclarator,
                id: convertChild(node.name),
                init: convertChild(node.type),
                range: [node.name.getStart(), node.end]
            };

            typeAliasDeclarator.loc = nodeUtils.getLocFor(typeAliasDeclarator.range[0], typeAliasDeclarator.range[1], ast);

            // Process typeParameters
            if (node.typeParameters && node.typeParameters.length) {
                typeAliasDeclarator.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(node.typeParameters);
            }

            Object.assign(result, {
                type: AST_NODE_TYPES.VariableDeclaration,
                kind: nodeUtils.getDeclarationKind(node),
                declarations: [typeAliasDeclarator]
            });

            // check for exports
            result = nodeUtils.fixExports(node, result, ast);

            break;

        }

        case SyntaxKind.MethodSignature: {
            Object.assign(result, {
                type: AST_NODE_TYPES.TSMethodSignature,
                optional: nodeUtils.isOptional(node),
                computed: nodeUtils.isComputedProperty(node.name),
                key: convertChild(node.name),
                params: convertParameters(node.parameters),
                typeAnnotation: (node.type) ? convertTypeAnnotation(node.type) : null,
                readonly: nodeUtils.hasModifier(SyntaxKind.ReadonlyKeyword, node) || undefined,
                static: nodeUtils.hasModifier(SyntaxKind.StaticKeyword, node),
                export: nodeUtils.hasModifier(SyntaxKind.ExportKeyword, node) || undefined
            });

            const accessibility = nodeUtils.getTSNodeAccessibility(node);
            if (accessibility) {
                result.accessibility = accessibility;
            }

            if (node.typeParameters) {
                result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(node.typeParameters);
            }

            break;
        }

        case SyntaxKind.PropertySignature: {
            Object.assign(result, {
                type: AST_NODE_TYPES.TSPropertySignature,
                optional: nodeUtils.isOptional(node) || undefined,
                computed: nodeUtils.isComputedProperty(node.name),
                key: convertChild(node.name),
                typeAnnotation: (node.type) ? convertTypeAnnotation(node.type) : undefined,
                initializer: convertChild(node.initializer) || undefined,
                readonly: nodeUtils.hasModifier(SyntaxKind.ReadonlyKeyword, node) || undefined,
                static: nodeUtils.hasModifier(SyntaxKind.StaticKeyword, node) || undefined,
                export: nodeUtils.hasModifier(SyntaxKind.ExportKeyword, node) || undefined
            });

            const accessibility = nodeUtils.getTSNodeAccessibility(node);
            if (accessibility) {
                result.accessibility = accessibility;
            }

            break;
        }

        case SyntaxKind.IndexSignature: {
            Object.assign(result, {
                type: AST_NODE_TYPES.TSIndexSignature,
                index: convertChild(node.parameters[0]),
                typeAnnotation: (node.type) ? convertTypeAnnotation(node.type) : null,
                readonly: nodeUtils.hasModifier(SyntaxKind.ReadonlyKeyword, node) || undefined,
                static: nodeUtils.hasModifier(SyntaxKind.StaticKeyword, node),
                export: nodeUtils.hasModifier(SyntaxKind.ExportKeyword, node) || undefined
            });

            const accessibility = nodeUtils.getTSNodeAccessibility(node);
            if (accessibility) {
                result.accessibility = accessibility;
            }

            break;
        }

        case SyntaxKind.ConstructSignature: {
            Object.assign(result, {
                type: AST_NODE_TYPES.TSConstructSignature,
                params: convertParameters(node.parameters),
                typeAnnotation: (node.type) ? convertTypeAnnotation(node.type) : null
            });

            if (node.typeParameters) {
                result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(node.typeParameters);
            }

            break;
        }

        case SyntaxKind.InterfaceDeclaration: {
            const interfaceHeritageClauses = node.heritageClauses || [];

            let interfaceLastClassToken = interfaceHeritageClauses.length ? interfaceHeritageClauses[interfaceHeritageClauses.length - 1] : node.name;

            if (node.typeParameters && node.typeParameters.length) {
                const interfaceLastTypeParameter = node.typeParameters[node.typeParameters.length - 1];

                if (!interfaceLastClassToken || interfaceLastTypeParameter.pos > interfaceLastClassToken.pos) {
                    interfaceLastClassToken = nodeUtils.findNextToken(interfaceLastTypeParameter, ast);
                }
                result.typeParameters = convertTSTypeParametersToTypeParametersDeclaration(node.typeParameters);
            }

            const hasImplementsClause = interfaceHeritageClauses.length > 0;
            const hasAbstractKeyword = nodeUtils.hasModifier(SyntaxKind.AbstractKeyword, node);
            const interfaceOpenBrace = nodeUtils.findNextToken(interfaceLastClassToken, ast);

            const interfaceBody = {
                type: AST_NODE_TYPES.TSInterfaceBody,
                body: node.members.map(member => convertChild(member)),
                range: [interfaceOpenBrace.getStart(), result.range[1]],
                loc: nodeUtils.getLocFor(interfaceOpenBrace.getStart(), node.end, ast)
            };

            Object.assign(result, {
                abstract: hasAbstractKeyword,
                type: AST_NODE_TYPES.TSInterfaceDeclaration,
                body: interfaceBody,
                id: convertChild(node.name),
                heritage: hasImplementsClause ? interfaceHeritageClauses[0].types.map(convertInterfaceHeritageClause) : []
            });
            /**
             * Semantically, decorators are not allowed on interface declarations,
             * but the TypeScript compiler will parse them and produce a valid AST,
             * so we handle them here too.
             */
            if (node.decorators) {
                result.decorators = convertDecorators(node.decorators);
            }
            // check for exports
            result = nodeUtils.fixExports(node, result, ast);

            break;

        }

        case SyntaxKind.FirstTypeNode:
            Object.assign(result, {
                type: AST_NODE_TYPES.TSTypePredicate,
                parameterName: convertChild(node.parameterName),
                typeAnnotation: convertTypeAnnotation(node.type)
            });
            /**
             * Specific fix for type-guard location data
             */
            result.typeAnnotation.loc = result.typeAnnotation.typeAnnotation.loc;
            result.typeAnnotation.range = result.typeAnnotation.typeAnnotation.range;
            break;

        case SyntaxKind.EnumDeclaration: {
            Object.assign(result, {
                type: AST_NODE_TYPES.TSEnumDeclaration,
                id: convertChild(node.name),
                members: node.members.map(convertChild)
            });
            // apply modifiers first...
            applyModifiersToResult(node.modifiers);
            // ...then check for exports
            result = nodeUtils.fixExports(node, result, ast);
            /**
             * Semantically, decorators are not allowed on enum declarations,
             * but the TypeScript compiler will parse them and produce a valid AST,
             * so we handle them here too.
             */
            if (node.decorators) {
                result.decorators = convertDecorators(node.decorators);
            }
            break;
        }

        case SyntaxKind.EnumMember: {
            Object.assign(result, {
                type: AST_NODE_TYPES.TSEnumMember,
                id: convertChild(node.name)
            });
            if (node.initializer) {
                result.initializer = convertChild(node.initializer);
            }
            break;
        }

        case SyntaxKind.AbstractKeyword: {
            Object.assign(result, {
                type: AST_NODE_TYPES.TSAbstractKeyword
            });
            break;
        }

        case SyntaxKind.ModuleDeclaration: {
            Object.assign(result, {
                type: AST_NODE_TYPES.TSModuleDeclaration,
                id: convertChild(node.name)
            });
            if (node.body) {
                result.body = convertChild(node.body);
            }
            // apply modifiers first...
            applyModifiersToResult(node.modifiers);
            // ...then check for exports
            result = nodeUtils.fixExports(node, result, ast);
            break;
        }

        default:
            deeplyCopy();
    }

    return result;

};
