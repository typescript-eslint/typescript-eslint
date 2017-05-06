module.exports = {
    body: [{
        async: false,
        body: {
            body: [],
            loc: {
                end: {
                    column: 35,
                    line: 1
                },
                start: {
                    column: 33,
                    line: 1
                }
            },
            range: [33, 35],
            type: "BlockStatement"
        },
        expression: false,
        generator: false,
        id: {
            loc: {
                end: {
                    column: 16,
                    line: 1
                },
                start: {
                    column: 9,
                    line: 1
                }
            },
            name: "compare",
            range: [9, 16],
            type: "Identifier"
        },
        loc: {
            end: {
                column: 35,
                line: 1
            },
            start: {
                column: 0,
                line: 1
            }
        },
        params: [],
        range: [0, 35],
        type: "FunctionDeclaration",
        typeParameters: {
            loc: {
                end: {
                    column: 30,
                    line: 1
                },
                start: {
                    column: 16,
                    line: 1
                }
            },
            params: [{
                constraint: null,
                loc: {
                    end: {
                        column: 29,
                        line: 1
                    },
                    start: {
                        column: 28,
                        line: 1
                    }
                },
                name: "T",
                range: [28, 29],
                type: "TypeParameter"
            }],
            range: [16, 30],
            type: "TypeParameterDeclaration"
        }
    }],
    loc: {
        end: {
            column: 35,
            line: 1
        },
        start: {
            column: 0,
            line: 1
        }
    },
    range: [0, 35],
    sourceType: "script",
    tokens: [{
            loc: {
                end: {
                    column: 8,
                    line: 1
                },
                start: {
                    column: 0,
                    line: 1
                }
            },
            range: [0, 8],
            type: "Keyword",
            value: "function"
        },
        {
            loc: {
                end: {
                    column: 16,
                    line: 1
                },
                start: {
                    column: 9,
                    line: 1
                }
            },
            range: [9, 16],
            type: "Identifier",
            value: "compare"
        },
        {
            loc: {
                end: {
                    column: 17,
                    line: 1
                },
                start: {
                    column: 16,
                    line: 1
                }
            },
            range: [16, 17],
            type: "Punctuator",
            value: "<"
        },
        {
            loc: {
                end: {
                    column: 29,
                    line: 1
                },
                start: {
                    column: 28,
                    line: 1
                }
            },
            range: [28, 29],
            type: "Identifier",
            value: "T"
        },
        {
            loc: {
                end: {
                    column: 30,
                    line: 1
                },
                start: {
                    column: 29,
                    line: 1
                }
            },
            range: [29, 30],
            type: "Punctuator",
            value: ">"
        },
        {
            loc: {
                end: {
                    column: 31,
                    line: 1
                },
                start: {
                    column: 30,
                    line: 1
                }
            },
            range: [30, 31],
            type: "Punctuator",
            value: "("
        },
        {
            loc: {
                end: {
                    column: 32,
                    line: 1
                },
                start: {
                    column: 31,
                    line: 1
                }
            },
            range: [31, 32],
            type: "Punctuator",
            value: ")"
        },
        {
            loc: {
                end: {
                    column: 34,
                    line: 1
                },
                start: {
                    column: 33,
                    line: 1
                }
            },
            range: [33, 34],
            type: "Punctuator",
            value: "{"
        },
        {
            loc: {
                end: {
                    column: 35,
                    line: 1
                },
                start: {
                    column: 34,
                    line: 1
                }
            },
            range: [34, 35],
            type: "Punctuator",
            value: "}"
        }
    ],
    type: "Program"
};