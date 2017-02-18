module.exports = {
    "type": "Program",
    "body": [
        {
            "type": "FunctionDeclaration",
            "expression": false,
            "generator": false,
            "async": true,
            "id": {
                "type": "Identifier",
                "name": "hope",
                "loc": {
                    "end": {
                        "column": 19,
                        "line": 1
                    },
                    "start": {
                        "column": 15,
                        "line": 1
                    }
                },
                "range": [
                    15,
                    19
                ]
            },
            "params": [
                {
                    "loc": {
                        "end": {
                            "column": 26,
                            "line": 1
                        },
                        "start": {
                            "column": 20,
                            "line": 1
                        }
                    },
                    "name": "future",
                    "range": [
                        20,
                        26
                    ],
                    "type": "Identifier"
                }
            ],
            "body": {
                "type": "BlockStatement",
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "expression": {
                            "type": "AwaitExpression",
                            "argument": {
                                "type": "Identifier",
                                "loc": {
                                    "end": {
                                        "column": 16,
                                        "line": 2
                                    },
                                    "start": {
                                        "column": 10,
                                        "line": 2
                                    }
                                },
                                "name": "future",
                                "range": [
                                    40,
                                    46
                                ]
                            },
                            "loc": {
                                "end": {
                                    "column": 16,
                                    "line": 2
                                },
                                "start": {
                                    "column": 4,
                                    "line": 2
                                }
                            },
                            "range": [
                                34,
                                46
                            ]
                        },
                        "loc": {
                            "end": {
                                "column": 17,
                                "line": 2
                            },
                            "start": {
                                "column": 4,
                                "line": 2
                            }
                        },
                        "range": [
                            34,
                            47
                        ]
                    }
                ],
                "loc": {
                    "end": {
                        "column": 1,
                        "line": 3
                    },
                    "start": {
                        "column": 28,
                        "line": 1
                    }
                },
                "range": [
                    28,
                    49
                ]
            },
            "loc": {
                "end": {
                    "column": 1,
                    "line": 3
                },
                "start": {
                    "column": 0,
                    "line": 1
                }
            },
            "range": [
                0,
                49
            ]
        }
    ],
    "loc": {
        "end": {
            "column": 1,
            "line": 3
        },
        "start": {
            "column": 0,
            "line": 1
        }
    },
    "range": [
        0,
        49
    ],
    "sourceType": "script",
    "tokens": [
        {
            "type": "Identifier",
            "value": "async",
            "loc": {
                "end": {
                    "column": 5,
                    "line": 1
                },
                "start": {
                    "column": 0,
                    "line": 1
                }
            },
            "range": [
                0,
                5
            ]
        },
        {
            "type": "Keyword",
            "value": "function",
            "loc": {
                "end": {
                    "column": 14,
                    "line": 1
                },
                "start": {
                    "column": 6,
                    "line": 1
                }
            },
            "range": [
                6,
                14
            ]
        },
        {
            "type": "Identifier",
            "value": "hope",
            "loc": {
                "end": {
                    "column": 19,
                    "line": 1
                },
                "start": {
                    "column": 15,
                    "line": 1
                }
            },
            "range": [
                15,
                19
            ]
        },
        {
            "type": "Punctuator",
            "value": "(",
            "loc": {
                "end": {
                    "column": 20,
                    "line": 1
                },
                "start": {
                    "column": 19,
                    "line": 1
                }
            },
            "range": [
                19,
                20
            ]
        },
        {
            "type": "Identifier",
            "value": "future",
            "loc": {
                "end": {
                    "column": 26,
                    "line": 1
                },
                "start": {
                    "column": 20,
                    "line": 1
                }
            },
            "range": [
                20,
                26
            ]
        },
        {
            "type": "Punctuator",
            "value": ")",
            "loc": {
                "end": {
                    "column": 27,
                    "line": 1
                },
                "start": {
                    "column": 26,
                    "line": 1
                }
            },
            "range": [
                26,
                27
            ]
        },
        {
            "type": "Punctuator",
            "value": "{",
            "loc": {
                "end": {
                    "column": 29,
                    "line": 1
                },
                "start": {
                    "column": 28,
                    "line": 1
                }
            },
            "range": [
                28,
                29
            ]
        },
        {
            "type": "Identifier",
            "value": "await",
            "loc": {
                "end": {
                    "column": 9,
                    "line": 2
                },
                "start": {
                    "column": 4,
                    "line": 2
                }
            },
            "range": [
                34,
                39
            ]
        },
        {
            "type": "Identifier",
            "value": "future",
            "loc": {
                "end": {
                    "column": 16,
                    "line": 2
                },
                "start": {
                    "column": 10,
                    "line": 2
                }
            },
            "range": [
                40,
                46
            ]
        },
        {
            "type": "Punctuator",
            "value": ";",
            "loc": {
                "end": {
                    "column": 17,
                    "line": 2
                },
                "start": {
                    "column": 16,
                    "line": 2
                }
            },
            "range": [
                46,
                47
            ]
        },
        {
            "type": "Punctuator",
            "value": "}",
            "loc": {
                "end": {
                    "column": 1,
                    "line": 3
                },
                "start": {
                    "column": 0,
                    "line": 3
                }
            },
            "range": [
                48,
                49
            ]
        }
    ]
};
