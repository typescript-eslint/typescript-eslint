// @ts-check
/**
 * @fileoverview Warns for any two overloads that could be unified into one by using a union or an optional/rest parameter.
 * @author Armando Aguirre
 */
"use strict";
const ts = require("typescript");
const tsutils = require("tsutils");
const util = require("../util");
const { Syntax } = require("@typescript-eslint/parser")

/** @typedef {import("estree").Node} Node */
/** @typedef {import("eslint").Rule.RuleContext} Context */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import("eslint").Rule.RuleModule} */
module.exports = {
    meta: {
        docs: {
            description: "Warns for any two overloads that could be unified into one by using a union or an optional/rest parameter.",
            category: "TypeScript-specific",
            recommended: false,
            extraDescription: [util.tslintRule('unified-signatures')],
            url: util.metaDocsUrl(" unified-signature")
        },
        fixable: "code",
        type: "suggestion"
    },

    create: function (context) {

        const sourceCode = context.getSourceCode();

        /**
         * @typedef Failure
         * @type {object}
         * @property {Unify} unify
         * @property {boolean} only2
         */
        /**
         * @typedef Unify
         * @type {{kind: 'single-parameter-difference', p0: any, p1: any} | {kind: 'extra-parameter', extraParameter: any, otherSignature: any}}
         */
        /**
         * Given a node, if it could potentially be an overload, return its signature and key.
         * All signatures which are overloads should have equal keys.
         * @template T
         * @callback GetOverload
         * @param {T} node
         * @returns {{signature: any, key: string} | undefined}
         */
        /**
         * Returns true if typeName is the name of an *outer* type parameter.
         * In: `interface I<T> { m<U>(x: U): T }`, only `T` is an outer type parameter.
         * @callback IsTypeParameter
         * @param {string} typeName
         * @returns {boolean}
         */
        /**
         * @template T
         * @template Out
         * @callback ForEachPairCallback
         * @param {T} a
         * @param {T} b
         * @returns {Out | undefined}
         */

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * @param {number} [otherLine]
         */
        function FAILURE_STRING_OMITTING_SINGLE_PARAMETER(otherLine) {
            return `${FAILURE_STRING_START(otherLine)} with an optional parameter.`;
        }

        /**
         * @param {number} [otherLine]
         */
        function FAILURE_STRING_OMITTING_REST_PARAMETER(otherLine) {
            return `${FAILURE_STRING_START(otherLine)} with a rest parameter.`;
        }

        /**
         * @param {number | undefined} otherLine
         * @param {string} type1
         * @param {string} type2
         */
        function FAILURE_STRING_SINGLE_PARAMETER_DIFFERENCE(otherLine, type1, type2) {
            return `${FAILURE_STRING_START(otherLine)} taking \`${type1} | ${type2}\`.`;
        }

        /**
         * @param {number} [otherLine]
         * @returns {string}
         */
        function FAILURE_STRING_START(otherLine) {
            // For only 2 overloads we don't need to specify which is the other one.
            const overloads =
                otherLine === undefined
                    ? "These overloads"
                    : `This overload and the one on line ${otherLine}`;
            return `${overloads} can be combined into one signature`;
        }

        /**
         * @param {Array} statements
         * @returns {void}
         */
        function checkStatements(statements) {
            addFailures(
                checkOverloads(statements, undefined, statement => {
                    if (statement.type === Syntax.TSDeclareFunction) {
                        const { body, id } = statement;
                        return body === undefined && id !== undefined
                            ? { signature: statement, key: id.name }
                            : undefined;
                    } else {
                        return undefined;
                    }
                })
            );
        }

        /**
         * @param {Array} members
         * @param {Array} [typeParameters]
         * @returns {void}
         */
        function checkMembers(members, typeParameters) {
            addFailures(
                checkOverloads(members, typeParameters, member => {
                    switch (member.type) {
                        case Syntax.TSCallSignatureDeclaration:
                        case Syntax.TSConstructSignatureDeclaration:
                        case Syntax.TSMethodSignature:
                            break;
                        case Syntax.TSAbstractMethodDefinition:
                        case Syntax.MethodDefinition:
                            if (member.value.body !== null) {
                                return undefined;
                            }
                            break;
                        default:
                            return undefined;

                    }

                    const key = getOverloadKey(member);
                    return key === undefined ? undefined : { signature: member, key };
                })
            );
        }

        /**
         * @param {Failure[]} failures
         */
        function addFailures(failures) {
            for (const failure of failures) {
                const { unify, only2 } = failure;
                switch (unify.kind) {
                    case "single-parameter-difference": {
                        const { p0, p1 } = unify;
                        const lineOfOtherOverload = only2 ? undefined : p0.loc.start.line
                        context.report({
                            loc: p1.loc,
                            message: FAILURE_STRING_SINGLE_PARAMETER_DIFFERENCE(
                                lineOfOtherOverload,
                                sourceCode.getText(p0.typeAnnotation.typeAnnotation),
                                sourceCode.getText(p1.typeAnnotation.typeAnnotation)
                            ),
                        });
                        break;
                    }
                    case "extra-parameter": {
                        const { extraParameter, otherSignature } = unify;
                        const lineOfOtherOverload = only2 ? undefined : otherSignature.loc.start.line;

                        context.report({
                            loc: extraParameter.loc,
                            message: extraParameter.type === Syntax.RestElement
                                ? FAILURE_STRING_OMITTING_REST_PARAMETER(lineOfOtherOverload)
                                : FAILURE_STRING_OMITTING_SINGLE_PARAMETER(lineOfOtherOverload)
                        });
                    }
                }
            }
        }

        /**
         * @template T
         * @param {Array<T>} signatures
         * @param {Array | undefined} typeParameters
         * @param {GetOverload<T>} getOverload
         * @return {Failure[]}
         */
        function checkOverloads(signatures, typeParameters, getOverload) {
            /** @type {Failure[]} */
            const result = [];
            const isTypeParameter = getIsTypeParameter(typeParameters);
            for (const overloads of collectOverloads(signatures, getOverload)) {
                if (overloads.length === 2) {

                    // Classes returns parameters on its value property
                    const signature0 = overloads[0].value || overloads[0];
                    const signature1 = overloads[1].value || overloads[1];

                    const unify = compareSignatures(signature0, signature1, isTypeParameter);
                    if (unify !== undefined)  {
                        result.push({ unify, only2: true });
                    }
                } else {
                    forEachPair(overloads, (a, b) => {
                        const unify = compareSignatures(a, b, isTypeParameter);
                        if (unify !== undefined) {
                            result.push({ unify, only2: false });
                        }
                    });
                }
            }
            return result;
        }

        /**
         * @param {any} a
         * @param {any} b
         * @param {IsTypeParameter} isTypeParameter
         * @returns {Unify | undefined}
         */
        function compareSignatures(a, b, isTypeParameter) {
            if (!signaturesCanBeUnified(a, b, isTypeParameter)) {
                return undefined;
            }

            return a.params.length === b.params.length
                ? signaturesDifferBySingleParameter(a.params, b.params)
                : signaturesDifferByOptionalOrRestParameter(a, b);
        }

        /**
         * @param {any} a
         * @param {any} b
         * @param {IsTypeParameter} isTypeParameter
         * @returns {boolean}
         */
        function signaturesCanBeUnified(a, b, isTypeParameter) {
            // Must return the same type.

            const aTypeParams = a.typeParameters !== undefined ? a.typeParameters.params : undefined;
            const bTypeParams = b.typeParameters !== undefined ? b.typeParameters.params : undefined;

            return (
                typesAreEqual(a.returnType, b.returnType) &&
                // Must take the same type parameters.
                // If one uses a type parameter (from outside) and the other doesn't, they shouldn't be joined.
                util.arraysAreEqual(aTypeParams, bTypeParams, typeParametersAreEqual) &&
                signatureUsesTypeParameter(a, isTypeParameter) === signatureUsesTypeParameter(b, isTypeParameter)
            );
        }

        /**
         * Detect `a(x: number, y: number, z: number)` and `a(x: number, y: string, z: number)`.
         * @param {Array} types1
         * @param {Array} types2
         * @returns {Unify | undefined}
         */
        function signaturesDifferBySingleParameter(types1, types2) {
            const index = getIndexOfFirstDifference(types1, types2, parametersAreEqual);
            if (index === undefined) {
                return undefined;
            }

            // If remaining arrays are equal, the signatures differ by just one parameter type
            if (!util.arraysAreEqual(types1.slice(index + 1), types2.slice(index + 1), parametersAreEqual)) {
                return undefined;
            }

            const a = types1[index];
            const b = types2[index];
            // Can unify `a?: string` and `b?: number`. Can't unify `...args: string[]` and `...args: number[]`.
            // See https://github.com/Microsoft/TypeScript/issues/5077
            return parametersHaveEqualSigils(a, b) && a.type !== Syntax.RestElement
                ? { kind: "single-parameter-difference", p0: a, p1: b }
                : undefined;
        }

        /**
         * Detect `a(): void` and `a(x: number): void`.
         * Returns the parameter declaration (`x: number` in this example) that should be optional/rest, and overload it's a part of.
         * @param {any} a
         * @param {any} b
         * @returns {Unify | undefined}
         */
        function signaturesDifferByOptionalOrRestParameter(a, b) {

            const sig1 = a.params;
            const sig2 = b.params;

            const minLength = Math.min(sig1.length, sig2.length);
            const longer = sig1.length < sig2.length ? sig2 : sig1;
            const shorter = sig1.length < sig2.length ? sig1 : sig2;
            const shorterSig = sig1.length < sig2.length ? a : b;

            // If one is has 2+ parameters more than the other, they must all be optional/rest.
            // Differ by optional parameters: f() and f(x), f() and f(x, ?y, ...z)
            // Not allowed: f() and f(x, y)
            for (let i = minLength + 1; i < longer.length; i++) {
                if (!parameterMayBeMissing(longer[i])) {
                    return undefined;
                }
            }

            for (let i = 0; i < minLength; i++) {
                if (!typesAreEqual(sig1[i].typeAnnotation, sig2[i].typeAnnotation)) {
                    return undefined;
                }
            }

            if (minLength > 0 && shorter[minLength - 1].type === Syntax.RestElement) {
                return undefined;
            }

            return {
                extraParameter: longer[longer.length - 1],
                kind: "extra-parameter",
                otherSignature: shorterSig,
            };
        }

        /**
         * Given type parameters, returns a function to test whether a type is one of those parameters.
         * @param {any} [typeParameters]
         * @returns {IsTypeParameter}
         */
        function getIsTypeParameter(typeParameters) {
            if (typeParameters === undefined) {
                return () => false;
            }

            /** @type {Set<string>} */
            const set = new Set([]);
            for (const t of typeParameters.params) {
                set.add(t.name.name);
            }
            return (typeName) => set.has(typeName);
        }

        /**
         * True if any of the outer type parameters are used in a signature.
         * @param {any} sig
         * @param {IsTypeParameter} isTypeParameter
         * @returns {boolean}
         */
        function signatureUsesTypeParameter(sig, isTypeParameter) {
            return sig.params.some(
                p => typeContainsTypeParameter(p.typeAnnotation) === true,
            );

            /**
             * @param {any} type
             * @returns {boolean | undefined}
             */
            function typeContainsTypeParameter(type) {
                if (!type) {
                    return false;
                }

                if (type.type === Syntax.TSTypeReference) {
                    const typeName = type.typeName;
                    if (typeName.type === Syntax.Identifier && isTypeParameter(typeName.name)) {
                        return true;
                    }
                }

                return typeContainsTypeParameter(type.typeAnnotation || type.elementType);
            }
        }

        /**
         * Given all signatures, collects an array of arrays of signatures which are all overloads.
         * Does not rely on overloads being adjacent. This is similar to code in adjacentOverloadSignaturesRule.ts, but not the same.
         * @template T
         * @param {Array<T>} nodes
         * @param {GetOverload<T>} getOverload
        * @returns {any[][]}
         */
        function collectOverloads(nodes, getOverload) {
            /** @type {Map<string, Array[]>} */
            const map = new Map();
            for (const sig of nodes) {
                const overload = getOverload(sig);
                if (overload === undefined) {
                    continue;
                }

                const { signature, key } = overload;
                const overloads = map.get(key);
                if (overloads !== undefined) {
                    overloads.push(signature);
                } else {
                    map.set(key, [signature]);
                }
            }
            return Array.from(map.values());
        }

        /**
         * @param {any} a
         * @param {any} b
         * @returns {boolean}
         */
        function parametersAreEqual(a, b) {
            return parametersHaveEqualSigils(a, b) && typesAreEqual(a.typeAnnotation, b.typeAnnotation);
        }

        /**
         * True for optional/rest parameters.
         * @param {any} p
         * @returns {boolean}
         */
        function parameterMayBeMissing(p) {
            return p.type === Syntax.RestElement || p.optional;
        }

        /**
         * False if one is optional and the other isn't, or one is a rest parameter and the other isn't.
         * @param {any} a
         * @param {any} b
         * @returns {boolean}
         */
        function parametersHaveEqualSigils(a, b) {
            return (
                (a.type === Syntax.RestElement) === (b.type === Syntax.RestElement) &&
                (a.optional !== undefined) === (b.optional !== undefined)
            );
        }

        /**
         * @param {any} a
         * @param {any} b
         * @returns {boolean}
         */
        function typeParametersAreEqual(a, b) {
            return a.name.name === b.name.name && constraintsAreEqual(a.constraint, b.constraint);
        }

        /**
         * @param {any} a
         * @param {any} b
         * @returns {boolean}
         */
        function typesAreEqual(a, b) {
            // TODO: Could traverse AST so that formatting differences don't affect this.
            return a === b || (a !== undefined && b !== undefined && a.typeAnnotation.type === b.typeAnnotation.type);
        }

        /**
         *
         * @param {any} a
         * @param {any} b
         * @returns {boolean}
         */
        function constraintsAreEqual(a, b) {
            return a === b || (a !== undefined && b !== undefined && a.type === b.type);
        }

        /**
         * Returns the first index where `a` and `b` differ.
         * @template T
         * @param {Array<T>} a
         * @param {Array<T>} b
         * @param {util.Equal<T>} equal
         * @returns {number | undefined}
         */
        function getIndexOfFirstDifference(a, b, equal) {
            for (let i = 0; i < a.length && i < b.length; i++) {
                if (!equal(a[i], b[i])) {
                    return i;
                }
            }
            return undefined;
        }

        /**
         * Calls `action` for every pair of values in `values`.
         * @template T
         * @template Out
         * @param {Array<T>} values
         * @param {ForEachPairCallback<T, Out>} action
         * @returns {Out | undefined}
         */
        function forEachPair(values, action) {
            for (let i = 0; i < values.length; i++) {
                for (let j = i + 1; j < values.length; j++) {
                    const result = action(values[i], values[j]);
                    if (result !== undefined) {
                        return result;
                    }
                }
            }
            return undefined;
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        return {
            Program(node) {
                checkStatements(node.body)
            },
            TSModuleBlock(node) {
                checkStatements(node.body);
            },
            TSInterfaceDeclaration(node) {
                checkMembers(node.body.body, node.typeParameters);
            },
            ClassDeclaration(node) {
                checkMembers(node.body.body, node.typeParameters);
            },
            TSTypeLiteral(node) {
                checkMembers(node.members);
            }
        };
    }
};

/**
 * @param {any} node
 * @returns {string | undefined}
 */
function getOverloadKey(node) {
    const info = getOverloadInfo(node);
    if (info === undefined) {
        return undefined;
    }

    return (node.computed ? "0" : "1") + (node.static ? "0" : "1") + info;
}

/**
 * @param {any} node
 * @returns {string | { name: string; computed?: boolean } | undefined}
 */
function getOverloadInfo(node) {
    switch (node.type) {
        case Syntax.TSConstructSignatureDeclaration:
            return "constructor";
        case Syntax.TSCallSignatureDeclaration:
            return "()";
        default: {
            const { key } = node;
            if (key === undefined) {
                return undefined;
            }

            switch (key.type) {
                case Syntax.Identifier:
                    return key.name;
                case Syntax.Property:
                    const { value } = key;
                    return tsutils.isLiteralExpression(value)
                        ? value.name
                        : { name: value.getText(), computed: true };
                default:
                    return tsutils.isLiteralExpression(key) ? key.name : undefined;
            }
        }
    }
}
