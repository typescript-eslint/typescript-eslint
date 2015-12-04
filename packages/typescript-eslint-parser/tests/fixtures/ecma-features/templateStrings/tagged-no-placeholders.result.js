module.exports = {
    "type": "Program",
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 1,
            "column": 9
        }
    },
    "range": [
        0,
        9
    ],
    "body": [
        {
            "type": "ExpressionStatement",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 9
                }
            },
            "range": [
                0,
                9
            ],
            "expression": {
                "type": "TaggedTemplateExpression",
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 0
                    },
                    "end": {
                        "line": 1,
                        "column": 8
                    }
                },
                "range": [
                    0,
                    8
                ],
                "tag": {
                    "type": "Identifier",
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 0
                        },
                        "end": {
                            "line": 1,
                            "column": 3
                        }
                    },
                    "range": [
                        0,
                        3
                    ],
                    "name": "foo"
                },
                "quasi": {
                    "type": "TemplateLiteral",
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 3
                        },
                        "end": {
                            "line": 1,
                            "column": 8
                        }
                    },
                    "range": [
                        3,
                        8
                    ],
                    "expressions": [],
                    "quasis": [
                        {
                            "type": "TemplateElement",
                            "loc": {
                                "start": {
                                    "line": 1,
                                    "column": 3
                                },
                                "end": {
                                    "line": 1,
                                    "column": 8
                                }
                            },
                            "range": [
                                3,
                                8
                            ],
                            "value": {
                                "raw": "foo",
                                "cooked": "foo"
                            },
                            "tail": true
                        }
                    ]
                }
            }
        }
    ],
    "sourceType": "script",
    "tokens": [
        {
            "type": "Identifier",
            "value": "foo",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 3
                }
            },
            "range": [
                0,
                3
            ]
        },
        {
            "type": "Template",
            "value": "`foo`",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 3
                },
                "end": {
                    "line": 1,
                    "column": 8
                }
            },
            "range": [
                3,
                8
            ]
        },
        {
            "type": "Punctuator",
            "value": ";",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 8
                },
                "end": {
                    "line": 1,
                    "column": 9
                }
            },
            "range": [
                8,
                9
            ]
        }
    ]
};