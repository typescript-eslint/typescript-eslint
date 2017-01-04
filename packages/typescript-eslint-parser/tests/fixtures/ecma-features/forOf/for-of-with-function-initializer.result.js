module.exports = {
    "type": "Program",
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 1,
            "column": 64
        }
    },
    "range": [
        0,
        64
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
                    "line": 1,
                    "column": 64
                }
            },
            "range": [
                0,
                64
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
                        "column": 43
                    }
                },
                "range": [
                    5,
                    43
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
                                "column": 43
                            }
                        },
                        "range": [
                            9,
                            43
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
                            "name": "i"
                        },
                        "init": {
                            "type": "FunctionExpression",
                            "loc": {
                                "start": {
                                    "line": 1,
                                    "column": 13
                                },
                                "end": {
                                    "line": 1,
                                    "column": 43
                                }
                            },
                            "range": [
                                13,
                                43
                            ],
                            "id": null,
                            "generator": false,
                            "expression": false,
                            "async": false,
                            "params": [],
                            "body": {
                                "type": "BlockStatement",
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 24
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 43
                                    }
                                },
                                "range": [
                                    24,
                                    43
                                ],
                                "body": [
                                    {
                                        "type": "ReturnStatement",
                                        "loc": {
                                            "start": {
                                                "line": 1,
                                                "column": 26
                                            },
                                            "end": {
                                                "line": 1,
                                                "column": 41
                                            }
                                        },
                                        "range": [
                                            26,
                                            41
                                        ],
                                        "argument": {
                                            "type": "BinaryExpression",
                                            "loc": {
                                                "start": {
                                                    "line": 1,
                                                    "column": 33
                                                },
                                                "end": {
                                                    "line": 1,
                                                    "column": 41
                                                }
                                            },
                                            "range": [
                                                33,
                                                41
                                            ],
                                            "left": {
                                                "type": "Literal",
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
                                                "value": 10,
                                                "raw": "10"
                                            },
                                            "operator": "in",
                                            "right": {
                                                "type": "ArrayExpression",
                                                "loc": {
                                                    "start": {
                                                        "line": 1,
                                                        "column": 39
                                                    },
                                                    "end": {
                                                        "line": 1,
                                                        "column": 41
                                                    }
                                                },
                                                "range": [
                                                    39,
                                                    41
                                                ],
                                                "elements": []
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                ],
                "kind": "var"
            },
            "right": {
                "type": "Identifier",
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 47
                    },
                    "end": {
                        "line": 1,
                        "column": 51
                    }
                },
                "range": [
                    47,
                    51
                ],
                "name": "list"
            },
            "body": {
                "type": "ExpressionStatement",
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 53
                    },
                    "end": {
                        "line": 1,
                        "column": 64
                    }
                },
                "range": [
                    53,
                    64
                ],
                "expression": {
                    "type": "CallExpression",
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 53
                        },
                        "end": {
                            "line": 1,
                            "column": 63
                        }
                    },
                    "range": [
                        53,
                        63
                    ],
                    "callee": {
                        "type": "Identifier",
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 53
                            },
                            "end": {
                                "line": 1,
                                "column": 60
                            }
                        },
                        "range": [
                            53,
                            60
                        ],
                        "name": "process"
                    },
                    "arguments": [
                        {
                            "type": "Identifier",
                            "loc": {
                                "start": {
                                    "line": 1,
                                    "column": 61
                                },
                                "end": {
                                    "line": 1,
                                    "column": 62
                                }
                            },
                            "range": [
                                61,
                                62
                            ],
                            "name": "x"
                        }
                    ]
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
            "value": "i",
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
            "value": "=",
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
            "type": "Keyword",
            "value": "function",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 13
                },
                "end": {
                    "line": 1,
                    "column": 21
                }
            },
            "range": [
                13,
                21
            ]
        },
        {
            "type": "Punctuator",
            "value": "(",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 21
                },
                "end": {
                    "line": 1,
                    "column": 22
                }
            },
            "range": [
                21,
                22
            ]
        },
        {
            "type": "Punctuator",
            "value": ")",
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
            "value": "{",
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
            "type": "Keyword",
            "value": "return",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 26
                },
                "end": {
                    "line": 1,
                    "column": 32
                }
            },
            "range": [
                26,
                32
            ]
        },
        {
            "type": "Numeric",
            "value": "10",
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
            ]
        },
        {
            "type": "Keyword",
            "value": "in",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 36
                },
                "end": {
                    "line": 1,
                    "column": 38
                }
            },
            "range": [
                36,
                38
            ]
        },
        {
            "type": "Punctuator",
            "value": "[",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 39
                },
                "end": {
                    "line": 1,
                    "column": 40
                }
            },
            "range": [
                39,
                40
            ]
        },
        {
            "type": "Punctuator",
            "value": "]",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 40
                },
                "end": {
                    "line": 1,
                    "column": 41
                }
            },
            "range": [
                40,
                41
            ]
        },
        {
            "type": "Punctuator",
            "value": "}",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 42
                },
                "end": {
                    "line": 1,
                    "column": 43
                }
            },
            "range": [
                42,
                43
            ]
        },
        {
            "type": "Identifier",
            "value": "of",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 44
                },
                "end": {
                    "line": 1,
                    "column": 46
                }
            },
            "range": [
                44,
                46
            ]
        },
        {
            "type": "Identifier",
            "value": "list",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 47
                },
                "end": {
                    "line": 1,
                    "column": 51
                }
            },
            "range": [
                47,
                51
            ]
        },
        {
            "type": "Punctuator",
            "value": ")",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 51
                },
                "end": {
                    "line": 1,
                    "column": 52
                }
            },
            "range": [
                51,
                52
            ]
        },
        {
            "type": "Identifier",
            "value": "process",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 53
                },
                "end": {
                    "line": 1,
                    "column": 60
                }
            },
            "range": [
                53,
                60
            ]
        },
        {
            "type": "Punctuator",
            "value": "(",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 60
                },
                "end": {
                    "line": 1,
                    "column": 61
                }
            },
            "range": [
                60,
                61
            ]
        },
        {
            "type": "Identifier",
            "value": "x",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 61
                },
                "end": {
                    "line": 1,
                    "column": 62
                }
            },
            "range": [
                61,
                62
            ]
        },
        {
            "type": "Punctuator",
            "value": ")",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 62
                },
                "end": {
                    "line": 1,
                    "column": 63
                }
            },
            "range": [
                62,
                63
            ]
        },
        {
            "type": "Punctuator",
            "value": ";",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 63
                },
                "end": {
                    "line": 1,
                    "column": 64
                }
            },
            "range": [
                63,
                64
            ]
        }
    ]
};
