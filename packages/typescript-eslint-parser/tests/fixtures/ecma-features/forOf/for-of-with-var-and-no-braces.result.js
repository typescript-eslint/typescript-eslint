module.exports = {
    "type": "Program",
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 2,
            "column": 18
        }
    },
    "range": [
        0,
        37
    ],
    "body": [
        {
            "type": "ForOfStatement",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 2,
                    "column": 18
                }
            },
            "range": [
                0,
                37
            ],
            "left": {
                "type": "VariableDeclaration",
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 5
                    },
                    "end": {
                        "line": 1,
                        "column": 10
                    }
                },
                "range": [
                    5,
                    10
                ],
                "declarations": [
                    {
                        "type": "VariableDeclarator",
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
                            "name": "x"
                        },
                        "init": null
                    }
                ],
                "kind": "var"
            },
            "right": {
                "type": "Identifier",
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 14
                    },
                    "end": {
                        "line": 1,
                        "column": 17
                    }
                },
                "range": [
                    14,
                    17
                ],
                "name": "foo"
            },
            "body": {
                "type": "ExpressionStatement",
                "loc": {
                    "start": {
                        "line": 2,
                        "column": 4
                    },
                    "end": {
                        "line": 2,
                        "column": 18
                    }
                },
                "range": [
                    23,
                    37
                ],
                "expression": {
                    "type": "CallExpression",
                    "loc": {
                        "start": {
                            "line": 2,
                            "column": 4
                        },
                        "end": {
                            "line": 2,
                            "column": 17
                        }
                    },
                    "range": [
                        23,
                        36
                    ],
                    "callee": {
                        "type": "Identifier",
                        "loc": {
                            "start": {
                                "line": 2,
                                "column": 4
                            },
                            "end": {
                                "line": 2,
                                "column": 15
                            }
                        },
                        "range": [
                            23,
                            34
                        ],
                        "name": "doSomething"
                    },
                    "arguments": []
                }
            }
        }
    ],
    "sourceType": "script",
    "tokens": [
        {
            "type": "Keyword",
            "value": "for",
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
            "type": "Punctuator",
            "value": "(",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 4
                },
                "end": {
                    "line": 1,
                    "column": 5
                }
            },
            "range": [
                4,
                5
            ]
        },
        {
            "type": "Keyword",
            "value": "var",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 5
                },
                "end": {
                    "line": 1,
                    "column": 8
                }
            },
            "range": [
                5,
                8
            ]
        },
        {
            "type": "Identifier",
            "value": "x",
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
            "type": "Identifier",
            "value": "of",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 11
                },
                "end": {
                    "line": 1,
                    "column": 13
                }
            },
            "range": [
                11,
                13
            ]
        },
        {
            "type": "Identifier",
            "value": "foo",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 14
                },
                "end": {
                    "line": 1,
                    "column": 17
                }
            },
            "range": [
                14,
                17
            ]
        },
        {
            "type": "Punctuator",
            "value": ")",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 17
                },
                "end": {
                    "line": 1,
                    "column": 18
                }
            },
            "range": [
                17,
                18
            ]
        },
        {
            "type": "Identifier",
            "value": "doSomething",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 4
                },
                "end": {
                    "line": 2,
                    "column": 15
                }
            },
            "range": [
                23,
                34
            ]
        },
        {
            "type": "Punctuator",
            "value": "(",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 15
                },
                "end": {
                    "line": 2,
                    "column": 16
                }
            },
            "range": [
                34,
                35
            ]
        },
        {
            "type": "Punctuator",
            "value": ")",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 16
                },
                "end": {
                    "line": 2,
                    "column": 17
                }
            },
            "range": [
                35,
                36
            ]
        },
        {
            "type": "Punctuator",
            "value": ";",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 17
                },
                "end": {
                    "line": 2,
                    "column": 18
                }
            },
            "range": [
                36,
                37
            ]
        }
    ]
};