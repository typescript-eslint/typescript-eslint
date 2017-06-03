module.exports = {
    "type": "Program",
    "body": [
        {
            type: 'ExpressionStatement',
            expression: {
                type: 'ObjectExpression',
                properties: [{
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: 'f',
                        range: [2, 3],
                        loc: {
                            start: { line: 1, column: 2 },
                            end: { line: 1, column: 3 }
                        }
                    },
                    value: {
                        type: 'FunctionExpression',
                        id: null,
                        params: [{
                            type: 'ObjectPattern',
                            properties: [{
                                type: 'Property',
                                key: {
                                    type: 'Identifier',
                                    name: 'x',
                                    range: [15, 16],
                                    loc: {
                                        start: { line: 1, column: 15 },
                                        end: { line: 1, column: 16 }
                                    }
                                },
                                value: {
                                    type: 'Identifier',
                                    name: 'x',
                                    range: [15, 16],
                                    loc: {
                                        start: { line: 1, column: 15 },
                                        end: { line: 1, column: 16 }
                                    }
                                },
                                kind: 'init',
                                method: false,
                                shorthand: true,
                                computed: false,
                                range: [15, 16],
                                loc: {
                                    start: { line: 1, column: 15 },
                                    end: { line: 1, column: 16 }
                                }
                            }],
                            range: [14, 17],
                            loc: {
                                start: { line: 1, column: 14 },
                                end: { line: 1, column: 17 }
                            }
                        }],
                        defaults: [{
                            type: 'ObjectExpression',
                            properties: [{
                                type: 'Property',
                                key: {
                                    type: 'Identifier',
                                    name: 'x',
                                    range: [21, 22],
                                    loc: {
                                        start: { line: 1, column: 21 },
                                        end: { line: 1, column: 22 }
                                    }
                                },
                                value: {
                                    type: 'Literal',
                                    value: 10,
                                    raw: '10',
                                    range: [24, 26],
                                    loc: {
                                        start: { line: 1, column: 24 },
                                        end: { line: 1, column: 26 }
                                    }
                                },
                                kind: 'init',
                                method: false,
                                shorthand: false,
                                computed: false,
                                range: [21, 26],
                                loc: {
                                    start: { line: 1, column: 21 },
                                    end: { line: 1, column: 26 }
                                }
                            }],
                            range: [20, 27],
                            loc: {
                                start: { line: 1, column: 20 },
                                end: { line: 1, column: 27 }
                            }
                        }],
                        body: {
                            type: 'BlockStatement',
                            body: [],
                            range: [29, 31],
                            loc: {
                                start: { line: 1, column: 29 },
                                end: { line: 1, column: 31 }
                            }
                        },
                        rest: null,
                        generator: false,
                        expression: false,
                        async: false,
                        range: [5, 31],
                        loc: {
                            start: { line: 1, column: 5 },
                            end: { line: 1, column: 31 }
                        }
                    },
                    kind: 'init',
                    method: false,
                    shorthand: false,
                    computed: false,
                    range: [2, 31],
                    loc: {
                        start: { line: 1, column: 2 },
                        end: { line: 1, column: 31 }
                    }
                }],
                range: [1, 32],
                loc: {
                    start: { line: 1, column: 1 },
                    end: { line: 1, column: 32 }
                }
            },
            range: [0, 33],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 33 }
            }
        }
    ]
}
