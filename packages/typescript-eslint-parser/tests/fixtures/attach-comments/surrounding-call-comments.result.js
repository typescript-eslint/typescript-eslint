module.exports = {
    "type": "Program",
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 5,
            "column": 1
        }
    },
    "range": [
        0,
        60
    ],
    "body": [
        {
            "type": "FunctionDeclaration",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 5,
                    "column": 1
                }
            },
            "range": [
                0,
                60
            ],
            "id": {
                "type": "Identifier",
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 9
                    },
                    "end": {
                        "line": 1,
                        "column": 10
                    }
                },
                "range": [
                    9,
                    10
                ],
                "name": "a"
            },
            "params": [],
            "body": {
                "type": "BlockStatement",
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 13
                    },
                    "end": {
                        "line": 5,
                        "column": 1
                    }
                },
                "range": [
                    13,
                    60
                ],
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "loc": {
                            "start": {
                                "line": 3,
                                "column": 4
                            },
                            "end": {
                                "line": 3,
                                "column": 10
                            }
                        },
                        "range": [
                            36,
                            42
                        ],
                        "expression": {
                            "type": "CallExpression",
                            "loc": {
                                "start": {
                                    "line": 3,
                                    "column": 4
                                },
                                "end": {
                                    "line": 3,
                                    "column": 9
                                }
                            },
                            "range": [
                                36,
                                41
                            ],
                            "callee": {
                                "type": "Identifier",
                                "loc": {
                                    "start": {
                                        "line": 3,
                                        "column": 4
                                    },
                                    "end": {
                                        "line": 3,
                                        "column": 7
                                    }
                                },
                                "range": [
                                    36,
                                    39
                                ],
                                "name": "foo"
                            },
                            "arguments": []
                        }
                    }
                ]
            },
            "expression": false,
            "generator": false
        }
    ],
    "sourceType": "script",
    "comments": [
        {
            "type": "Block",
            "value": " before ",
            "range": [
                19,
                31
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 4
                },
                "end": {
                    "line": 2,
                    "column": 16
                }
            }
        },
        {
            "type": "Block",
            "value": " after ",
            "range": [
                47,
                58
            ],
            "loc": {
                "start": {
                    "line": 4,
                    "column": 4
                },
                "end": {
                    "line": 4,
                    "column": 15
                }
            }
        }
    ],
    "tokens": [
        {
            "type": "Keyword",
            "value": "function",
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
            ]
        },
        {
            "type": "Identifier",
            "value": "a",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 9
                },
                "end": {
                    "line": 1,
                    "column": 10
                }
            },
            "range": [
                9,
                10
            ]
        },
        {
            "type": "Punctuator",
            "value": "(",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 10
                },
                "end": {
                    "line": 1,
                    "column": 11
                }
            },
            "range": [
                10,
                11
            ]
        },
        {
            "type": "Punctuator",
            "value": ")",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 11
                },
                "end": {
                    "line": 1,
                    "column": 12
                }
            },
            "range": [
                11,
                12
            ]
        },
        {
            "type": "Punctuator",
            "value": "{",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 13
                },
                "end": {
                    "line": 1,
                    "column": 14
                }
            },
            "range": [
                13,
                14
            ]
        },
        {
            "type": "Identifier",
            "value": "foo",
            "loc": {
                "start": {
                    "line": 3,
                    "column": 4
                },
                "end": {
                    "line": 3,
                    "column": 7
                }
            },
            "range": [
                36,
                39
            ]
        },
        {
            "type": "Punctuator",
            "value": "(",
            "loc": {
                "start": {
                    "line": 3,
                    "column": 7
                },
                "end": {
                    "line": 3,
                    "column": 8
                }
            },
            "range": [
                39,
                40
            ]
        },
        {
            "type": "Punctuator",
            "value": ")",
            "loc": {
                "start": {
                    "line": 3,
                    "column": 8
                },
                "end": {
                    "line": 3,
                    "column": 9
                }
            },
            "range": [
                40,
                41
            ]
        },
        {
            "type": "Punctuator",
            "value": ";",
            "loc": {
                "start": {
                    "line": 3,
                    "column": 9
                },
                "end": {
                    "line": 3,
                    "column": 10
                }
            },
            "range": [
                41,
                42
            ]
        },
        {
            "type": "Punctuator",
            "value": "}",
            "loc": {
                "start": {
                    "line": 5,
                    "column": 0
                },
                "end": {
                    "line": 5,
                    "column": 1
                }
            },
            "range": [
                59,
                60
            ]
        }
    ]
};