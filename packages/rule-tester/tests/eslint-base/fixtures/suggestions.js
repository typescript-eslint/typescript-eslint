// Forked from https://github.com/eslint/eslint/tree/ad9dd6a933fd098a0d99c6a9aa059850535c23ee/tests/fixtures/testers/rule-tester/suggestions.js

"use strict";

module.exports.basic = {
    meta: { hasSuggestions: true },
    create(context) {
        return {
            Identifier(node) {
                if (node.name === "foo") {
                    context.report({
                        node,
                        message: "Avoid using identifiers named 'foo'.",
                        suggest: [{
                            desc: "Rename identifier 'foo' to 'bar'",
                            fix: fixer => fixer.replaceText(node, 'bar')
                        }]
                    });
                }
            }
        };
    }
};

module.exports.withMessageIds = {
    meta: {
        messages: {
            avoidFoo: "Avoid using identifiers named '{{ name }}'.",
            unused: "An unused key",
            renameFoo: "Rename identifier 'foo' to '{{ newName }}'"
        },
        hasSuggestions: true
    },
    create(context) {
        return {
            Identifier(node) {
                if (node.name === "foo") {
                    context.report({
                        node,
                        messageId: "avoidFoo",
                        data: {
                            name: "foo"
                        },
                        suggest: [{
                            messageId: "renameFoo",
                            data: {
                                newName: "bar"
                            },
                            fix: fixer => fixer.replaceText(node, "bar")
                        }, {
                            messageId: "renameFoo",
                            data: {
                                newName: "baz"
                            },
                            fix: fixer => fixer.replaceText(node, "baz")
                        }]
                    });
                }
            }
        };
    }
};

module.exports.withoutHasSuggestionsProperty = {
    create(context) {
        return {
            Identifier(node) {
                context.report({
                    node,
                    message: "some message",
                    suggest: [{ desc: "some suggestion", fix: fixer => fixer.replaceText(node, 'bar') }]
                });
            }
        };
    }
};
