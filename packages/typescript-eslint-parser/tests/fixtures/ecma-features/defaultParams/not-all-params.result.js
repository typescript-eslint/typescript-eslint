module.exports = {
    "type": "Program",
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 1,
            "column": 36
        }
    },
    "range": [
        0,
        36
    ],
    "body": [
        {
            "type": "VariableDeclaration",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 36
                }
            },
            "range": [
                0,
                36
            ],
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 4
                        },
                        "end": {
                            "line": 1,
                            "column": 35
                        }
                    },
                    "range": [
                        4,
                        35
                    ],
                    "id": {
                        "type": "Identifier",
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 4
                            },
                            "end": {
                                "line": 1,
                                "column": 7
                            }
                        },
                        "range": [
                            4,
                            7
                        ],
                        "name": "foo"
                    },
                    "init": {
                        "type": "FunctionExpression",
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 10
                            },
                            "end": {
                                "line": 1,
                                "column": 35
                            }
                        },
                        "range": [
                            10,
                            35
                        ],
                        "id": null,
                        "generator": false,
                        "expression": false,
                        "async": false,
                        "params": [
                            {
                                "type": "Identifier",
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 19
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 20
                                    }
                                },
                                "range": [
                                    19,
                                    20
                                ],
                                "name": "a"
                            },
                            {
                                "type": "AssignmentPattern",
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 22
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 28
                                    }
                                },
                                "range": [
                                    22,
                                    28
                                ],
                                "left": {
                                    "type": "Identifier",
                                    "loc": {
                                        "start": {
                                            "line": 1,
                                            "column": 22
                                        },
                                        "end": {
                                            "line": 1,
                                            "column": 23
                                        }
                                    },
                                    "range": [
                                        22,
                                        23
                                    ],
                                    "name": "b"
                                },
                                "right": {
                                    "type": "Literal",
                                    "loc": {
                                        "start": {
                                            "line": 1,
                                            "column": 26
                                        },
                                        "end": {
                                            "line": 1,
                                            "column": 28
                                        }
                                    },
                                    "range": [
                                        26,
                                        28
                                    ],
                                    "value": 42,
                                    "raw": "42"
                                }
                            },
                            {
                                "type": "Identifier",
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 30
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 31
                                    }
                                },
                                "range": [
                                    30,
                                    31
                                ],
                                "name": "c"
                            }
                        ],
                        "body": {
                            "type": "BlockStatement",
                            "loc": {
                                "start": {
                                    "line": 1,
                                    "column": 33
                                },
                                "end": {
                                    "line": 1,
                                    "column": 35
                                }
                            },
                            "range": [
                                33,
                                35
                            ],
                            "body": []
                        }
                    }
                }
            ],
            "kind": "var"
        }
    ],
    "sourceType": "script",
    "tokens": [
        {
            "type": "Keyword",
            "value": "var",
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
            "type": "Identifier",
            "value": "foo",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 4
                },
                "end": {
                    "line": 1,
                    "column": 7
                }
            },
            "range": [
                4,
                7
            ]
        },
        {
            "type": "Punctuator",
            "value": "=",
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
        },
        {
            "type": "Keyword",
            "value": "function",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 10
                },
                "end": {
                    "line": 1,
                    "column": 18
                }
            },
            "range": [
                10,
                18
            ]
        },
        {
            "type": "Punctuator",
            "value": "(",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 18
                },
                "end": {
                    "line": 1,
                    "column": 19
                }
            },
            "range": [
                18,
                19
            ]
        },
        {
            "type": "Identifier",
            "value": "a",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 19
                },
                "end": {
                    "line": 1,
                    "column": 20
                }
            },
            "range": [
                19,
                20
            ]
        },
        {
            "type": "Punctuator",
            "value": ",",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 20
                },
                "end": {
                    "line": 1,
                    "column": 21
                }
            },
            "range": [
                20,
                21
            ]
        },
        {
            "type": "Identifier",
            "value": "b",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 22
                },
                "end": {
                    "line": 1,
                    "column": 23
                }
            },
            "range": [
                22,
                23
            ]
        },
        {
            "type": "Punctuator",
            "value": "=",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 24
                },
                "end": {
                    "line": 1,
                    "column": 25
                }
            },
            "range": [
                24,
                25
            ]
        },
        {
            "type": "Numeric",
            "value": "42",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 26
                },
                "end": {
                    "line": 1,
                    "column": 28
                }
            },
            "range": [
                26,
                28
            ]
        },
        {
            "type": "Punctuator",
            "value": ",",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 28
                },
                "end": {
                    "line": 1,
                    "column": 29
                }
            },
            "range": [
                28,
                29
            ]
        },
        {
            "type": "Identifier",
            "value": "c",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 30
                },
                "end": {
                    "line": 1,
                    "column": 31
                }
            },
            "range": [
                30,
                31
            ]
        },
        {
            "type": "Punctuator",
            "value": ")",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 31
                },
                "end": {
                    "line": 1,
                    "column": 32
                }
            },
            "range": [
                31,
                32
            ]
        },
        {
            "type": "Punctuator",
            "value": "{",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 33
                },
                "end": {
                    "line": 1,
                    "column": 34
                }
            },
            "range": [
                33,
                34
            ]
        },
        {
            "type": "Punctuator",
            "value": "}",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 34
                },
                "end": {
                    "line": 1,
                    "column": 35
                }
            },
            "range": [
                34,
                35
            ]
        },
        {
            "type": "Punctuator",
            "value": ";",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 35
                },
                "end": {
                    "line": 1,
                    "column": 36
                }
            },
            "range": [
                35,
                36
            ]
        }
    ]
};
