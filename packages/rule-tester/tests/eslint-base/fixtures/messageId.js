// Forked from https://github.com/eslint/eslint/tree/ad9dd6a933fd098a0d99c6a9aa059850535c23ee/tests/fixtures/testers/rule-tester/messageId.js

"use strict";

module.exports.withMetaWithData = {
    meta: {
        messages: {
            avoidFoo: "Avoid using variables named '{{ name }}'.",
            unused: "An unused key"
        }
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
                        }
                    });
                }
            }
        };
    }
};

module.exports.withMessageOnly = {
    create(context) {
        return {
            Identifier(node) {
                if (node.name === "foo") {
                    context.report({ node, message: "Avoid using variables named 'foo'."});
                }
            }
        };
    }
};
