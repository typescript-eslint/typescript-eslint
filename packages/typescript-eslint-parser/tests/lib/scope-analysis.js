/**
 * @fileoverview Tests for TypeScript-specific scope analysis
 * @author Toru Nagashima <https://github.com/mysticatea>
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { Linter } = require("eslint");
const parser = require("../..");

/** Reference resolver. */
class ReferenceResolver {
    constructor() {
        this.map = new Map();
    }

    resolve(obj, properties) {
        const resolved = Object.assign({ $id: this.map.size }, properties);
        this.map.set(obj, resolved);
        return resolved;
    }

    ref(obj) {
        if (typeof obj !== "object" || obj === null) {
            return obj;
        }

        const { map } = this;
        return {
            get $ref() {
                return map.get(obj).$id;
            }
        };
    }
}

/**
 * Convert a given node object to JSON object.
 * This saves only type and range to know what the node is.
 * @param {ASTNode} node The AST node object.
 * @returns {Object} The object that can be used for JSON.stringify.
 */
function nodeToJSON(node) {
    if (!node) {
        return node;
    }

    const { type, name, range } = node;
    if (node.type === "Identifier") {
        return { type, name, range };
    }
    return { type, range };
}

/**
 * Convert a given variable object to JSON object.
 * @param {Variable} variable The eslint-scope's variable object.
 * @param {ReferenceResolver} resolver The reference resolver.
 * @returns {Object} The object that can be used for JSON.stringify.
 */
function variableToJSON(variable, resolver) {
    const { name, eslintUsed } = variable;
    const defs = variable.defs.map(d => ({
        type: d.type,
        name: nodeToJSON(d.name),
        node: nodeToJSON(d.node),
        parent: nodeToJSON(d.parent)
    }));
    const identifiers = variable.identifiers.map(nodeToJSON);
    const references = variable.references.map(resolver.ref, resolver);
    const scope = resolver.ref(variable.scope);

    return resolver.resolve(variable, {
        name,
        defs,
        identifiers,
        references,
        scope,
        eslintUsed
    });
}

/**
 * Convert a given reference object to JSON object.
 * @param {Reference} reference The eslint-scope's reference object.
 * @param {ReferenceResolver} resolver The reference resolver.
 * @returns {Object} The object that can be used for JSON.stringify.
 */
function referenceToJSON(reference, resolver) {
    const kind = `${reference.isRead() ? "r" : ""}${reference.isWrite() ? "w" : ""}`;
    const from = resolver.ref(reference.from);
    const identifier = nodeToJSON(reference.identifier);
    const writeExpr = nodeToJSON(reference.writeExpr);
    const resolved = resolver.ref(reference.resolved);

    return resolver.resolve(reference, {
        kind,
        from,
        identifier,
        writeExpr,
        resolved
    });
}

/**
 * Convert a given scope object to JSON object.
 * @param {Scope} scope The eslint-scope's scope object.
 * @param {ReferenceResolver} resolver The reference resolver.
 * @returns {Object} The object that can be used for JSON.stringify.
 */
function scopeToJSON(scope, resolver = new ReferenceResolver()) {
    const { type, functionExpressionScope, isStrict } = scope;
    const block = nodeToJSON(scope.block);
    const variables = scope.variables.map(v => variableToJSON(v, resolver));
    const references = scope.references.map(r => referenceToJSON(r, resolver));
    const variableMap = Array.from(scope.set.entries()).reduce((map, [name, variable]) => {
        map[name] = resolver.ref(variable);
        return map;
    }, {});
    const throughReferences = scope.through.map(resolver.ref, resolver);
    const variableScope = resolver.ref(scope.variableScope);
    const upperScope = resolver.ref(scope.upper);
    const childScopes = scope.childScopes.map(c => scopeToJSON(c, resolver));

    return resolver.resolve(scope, {
        type,
        functionExpressionScope,
        isStrict,
        block,
        variables,
        references,
        variableMap,
        throughReferences,
        variableScope,
        upperScope,
        childScopes
    });
}

describe("TypeScript scope analysis", () => {
    const root = "tests/fixtures/scope-analysis";
    const files = fs.readdirSync(root).map(filename => path.join(root, filename).replace(/\\/g, "/"));

    for (const filePath of files) {
        test(filePath, () => {
            const code = fs.readFileSync(filePath, "utf8");
            const { scopeManager } = parser.parseForESLint(code, {
                loc: true,
                range: true,
                tokens: true,
                ecmaFeatures: {}
            });
            const { globalScope } = scopeManager;

            // Do the postprocess to test.
            // https://github.com/eslint/eslint/blob/4fe328787dd02d7a1f6fc21167f6175c860825e3/lib/linter.js#L222
            globalScope.through = globalScope.through.filter(reference => {
                const name = reference.identifier.name;
                const variable = globalScope.set.get(name);
                if (variable) {
                    reference.resolved = variable;
                    variable.references.push(reference);
                    return false;
                }
                return true;
            });

            const scopeTree = scopeToJSON(globalScope);
            expect(scopeTree).toMatchSnapshot();
        });
    }

    const linter = new Linter();
    linter.defineParser("typescript-eslint-parser", parser);

    test("https://github.com/eslint/typescript-eslint-parser/issues/416", () => {
        const code = `
export type SomeThing = {
    id: string;
}
`;
        const config = {
            parser: "typescript-eslint-parser",
            rules: {
                "no-undef": "error"
            }
        };
        const messages = linter.verify(code, config, { filename: "issue416.ts" });

        expect(messages).toStrictEqual([]);
    });

    test("https://github.com/eslint/typescript-eslint-parser/issues/435", () => {
        const code = `
interface Foo {
    bar: string
}
const bar = 'blah'
`;
        const config = {
            parser: "typescript-eslint-parser",
            rules: {
                "no-use-before-define": "error"
            }
        };
        const messages = linter.verify(code, config, { filename: "issue435.ts" });

        expect(messages).toStrictEqual([]);
    });

    test("https://github.com/eslint/typescript-eslint-parser/issues/437", () => {
        const code = `
interface Runnable {
  run (): Result
  toString (): string
}
`;
        const config = {
            parser: "typescript-eslint-parser",
            rules: {
                "no-undef": "error"
            }
        };
        const messages = linter.verify(code, config, { filename: "issue437.ts" });

        expect(messages).toStrictEqual([]);
    });

    test("https://github.com/eslint/typescript-eslint-parser/issues/443", () => {
        const code = `
const Foo = 1;
type Foo = 1;
`;
        const config = {
            parser: "typescript-eslint-parser",
            rules: {
                "no-redeclare": "error"
            }
        };
        const messages = linter.verify(code, config, { filename: "issue443.ts" });

        expect(messages).toStrictEqual([]);
    });

    test("https://github.com/eslint/typescript-eslint-parser/issues/459", () => {
        const code = `
type foo = any;
function bar(foo: any) {}
`;
        const config = {
            parser: "typescript-eslint-parser",
            rules: {
                "no-shadow": "error"
            }
        };
        const messages = linter.verify(code, config, { filename: "issue.ts" });

        expect(messages).toStrictEqual([]);
    });

    test("https://github.com/eslint/typescript-eslint-parser/issues/466", () => {
        const code = `
/*globals document, selector */
const links = document.querySelectorAll( selector ) as NodeListOf<HTMLElement>
`;
        const config = {
            parser: "typescript-eslint-parser",
            rules: {
                "no-undef": "error"
            }
        };
        const messages = linter.verify(code, config, { filename: "issue.ts" });

        expect(messages).toStrictEqual([]);
    });

    test("https://github.com/eslint/typescript-eslint-parser/issues/471", () => {
        const code = `
class X {
  field = {}
}
`;
        const config = {
            parser: "typescript-eslint-parser",
            rules: {
                "no-undef": "error"
            }
        };
        const messages = linter.verify(code, config, { filename: "issue.ts" });

        expect(messages).toStrictEqual([]);
    });

    test("https://github.com/eslint/typescript-eslint-parser/issues/487", () => {
        const code = `
export default class Test {
    private status: string;
    getStatus() {
        return this.status;
    }
}
`;
        const config = {
            parser: "typescript-eslint-parser",
            rules: {
                "no-restricted-globals": ["error", "status"]
            }
        };
        const messages = linter.verify(code, config, { filename: "issue.ts" });

        expect(messages).toStrictEqual([]);
    });

    test("https://github.com/eslint/typescript-eslint-parser/issues/535", () => {
        const code = `
function foo({ bar }: { bar: string }) {
    console.log(bar);
}
`;
        const config = {
            parser: "typescript-eslint-parser",
            rules: {
                "no-dupe-args": "error",
                "no-redeclare": "error"
            }
        };
        const messages = linter.verify(code, config, { filename: "issue.ts" });

        expect(messages).toStrictEqual([]);
    });

    test("https://github.com/eslint/typescript-eslint-parser/issues/535", () => {
        const code = `
import {
  observable,
} from 'mobx';

export default class ListModalStore {
  @observable
  orderList: IObservableArray<BizPurchaseOrderTO> = observable([]);
}
`;
        const config = {
            parser: "typescript-eslint-parser",
            rules: {
                "no-unused-vars": "error"
            }
        };
        const messages = linter.verify(code, config, { filename: "issue.ts" });

        expect(messages).toStrictEqual([]);
    });
});
