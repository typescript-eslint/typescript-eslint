module.exports = {
    "type": "Program",
    "body": [
        {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "ts",
                        "range": [
                            4,
                            6
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 4
                            },
                            "end": {
                                "line": 1,
                                "column": 6
                            }
                        }
                    },
                    "init": {
                        "type": "TemplateLiteral",
                        "quasis": [
                            {
                                "type": "TemplateElement",
                                "value": {
                                    "raw": "\\\\u{000042}\\\\u0042\\\\x42\\\\u0\\\\102\\\\A",
                                    "cooked": "\\u{000042}\\u0042\\x42\\u0\\102\\A"
                                },
                                "tail": true,
                                "range": [
                                    9,
                                    46
                                ],
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 9
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 46
                                    }
                                }
                            }
                        ],
                        "expressions": [],
                        "range": [
                            9,
                            46
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 9
                            },
                            "end": {
                                "line": 1,
                                "column": 46
                            }
                        }
                    },
                    "range": [
                        4,
                        46
                    ],
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 4
                        },
                        "end": {
                            "line": 1,
                            "column": 46
                        }
                    }
                }
            ],
            "kind": "var",
            "range": [
                0,
                47
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 47
                }
            }
        }
    ],
    "sourceType": "script",
    "range": [
        0,
        47
    ],
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 1,
            "column": 47
        }
    },
    "tokens": [
        {
            "type": "Keyword",
            "value": "var",
            "range": [
                0,
                3
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 3
                }
            }
        },
        {
            "type": "Identifier",
            "value": "ts",
            "range": [
                4,
                6
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 4
                },
                "end": {
                    "line": 1,
                    "column": 6
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "=",
            "range": [
                7,
                8
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 7
                },
                "end": {
                    "line": 1,
                    "column": 8
                }
            }
        },
        {
            "type": "Template",
            "value": "`\\\\u{000042}\\\\u0042\\\\x42\\\\u0\\\\102\\\\A`",
            "range": [
                9,
                46
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 9
                },
                "end": {
                    "line": 1,
                    "column": 46
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ";",
            "range": [
                46,
                47
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 46
                },
                "end": {
                    "line": 1,
                    "column": 47
                }
            }
        }
    ]
};