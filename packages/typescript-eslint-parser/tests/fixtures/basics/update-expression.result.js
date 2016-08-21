module.exports = {
    "body": [
        {
            "declarations": [
                {
                    "id": {
                        "loc": {
                            "end": {
                                "column": 5,
                                "line": 1
                            },
                            "start": {
                                "column": 4,
                                "line": 1
                            }
                        },
                        "name": "i",
                        "range": [
                            4,
                            5
                        ],
                        "type": "Identifier"
                    },
                    "init": {
                        "loc": {
                            "end": {
                                "column": 9,
                                "line": 1
                            },
                            "start": {
                                "column": 8,
                                "line": 1
                            }
                        },
                        "range": [
                            8,
                            9
                        ],
                        "raw": "0",
                        "type": "Literal",
                        "value": 0
                    },
                    "loc": {
                        "end": {
                            "column": 9,
                            "line": 1
                        },
                        "start": {
                            "column": 4,
                            "line": 1
                        }
                    },
                    "range": [
                        4,
                        9
                    ],
                    "type": "VariableDeclarator"
                }
            ],
            "kind": "var",
            "loc": {
                "end": {
                    "column": 10,
                    "line": 1
                },
                "start": {
                    "column": 0,
                    "line": 1
                }
            },
            "range": [
                0,
                10
            ],
            "type": "VariableDeclaration"
        },
        {
            "body": {
                "body": [
                    {
                        "expression": {
                            "argument": {
                                "loc": {
                                    "end": {
                                        "column": 3,
                                        "line": 3
                                    },
                                    "start": {
                                        "column": 2,
                                        "line": 3
                                    }
                                },
                                "name": "i",
                                "range": [
                                    28,
                                    29
                                ],
                                "type": "Identifier"
                            },
                            "loc": {
                                "end": {
                                    "column": 5,
                                    "line": 3
                                },
                                "start": {
                                    "column": 2,
                                    "line": 3
                                }
                            },
                            "operator": "++",
                            "prefix": false,
                            "range": [
                                28,
                                31
                            ],
                            "type": "UpdateExpression"
                        },
                        "loc": {
                            "end": {
                                "column": 6,
                                "line": 3
                            },
                            "start": {
                                "column": 2,
                                "line": 3
                            }
                        },
                        "range": [
                            28,
                            32
                        ],
                        "type": "ExpressionStatement"
                    }
                ],
                "loc": {
                    "end": {
                        "column": 1,
                        "line": 4
                    },
                    "start": {
                        "column": 13,
                        "line": 2
                    }
                },
                "range": [
                    24,
                    34
                ],
                "type": "BlockStatement"
            },
            "expression": false,
            "generator": false,
            "id": {
                "loc": {
                    "end": {
                        "column": 10,
                        "line": 2
                    },
                    "start": {
                        "column": 9,
                        "line": 2
                    }
                },
                "name": "f",
                "range": [
                    20,
                    21
                ],
                "type": "Identifier"
            },
            "loc": {
                "end": {
                    "column": 1,
                    "line": 4
                },
                "start": {
                    "column": 0,
                    "line": 2
                }
            },
            "params": [],
            "range": [
                11,
                34
            ],
            "type": "FunctionDeclaration"
        },
        {
            "expression": {
                "arguments": [],
                "callee": {
                    "loc": {
                        "end": {
                            "column": 1,
                            "line": 5
                        },
                        "start": {
                            "column": 0,
                            "line": 5
                        }
                    },
                    "name": "f",
                    "range": [
                        35,
                        36
                    ],
                    "type": "Identifier"
                },
                "loc": {
                    "end": {
                        "column": 3,
                        "line": 5
                    },
                    "start": {
                        "column": 0,
                        "line": 5
                    }
                },
                "range": [
                    35,
                    38
                ],
                "type": "CallExpression"
            },
            "loc": {
                "end": {
                    "column": 4,
                    "line": 5
                },
                "start": {
                    "column": 0,
                    "line": 5
                }
            },
            "range": [
                35,
                39
            ],
            "type": "ExpressionStatement"
        }
    ],
    "loc": {
        "end": {
            "column": 4,
            "line": 5
        },
        "start": {
            "column": 0,
            "line": 1
        }
    },
    "range": [
        0,
        39
    ],
    "sourceType": "script",
    "tokens": [
        {
            "loc": {
                "end": {
                    "column": 3,
                    "line": 1
                },
                "start": {
                    "column": 0,
                    "line": 1
                }
            },
            "range": [
                0,
                3
            ],
            "type": "Keyword",
            "value": "var"
        },
        {
            "loc": {
                "end": {
                    "column": 5,
                    "line": 1
                },
                "start": {
                    "column": 4,
                    "line": 1
                }
            },
            "range": [
                4,
                5
            ],
            "type": "Identifier",
            "value": "i"
        },
        {
            "loc": {
                "end": {
                    "column": 7,
                    "line": 1
                },
                "start": {
                    "column": 6,
                    "line": 1
                }
            },
            "range": [
                6,
                7
            ],
            "type": "Punctuator",
            "value": "="
        },
        {
            "loc": {
                "end": {
                    "column": 9,
                    "line": 1
                },
                "start": {
                    "column": 8,
                    "line": 1
                }
            },
            "range": [
                8,
                9
            ],
            "type": "Numeric",
            "value": "0"
        },
        {
            "loc": {
                "end": {
                    "column": 10,
                    "line": 1
                },
                "start": {
                    "column": 9,
                    "line": 1
                }
            },
            "range": [
                9,
                10
            ],
            "type": "Punctuator",
            "value": ";"
        },
        {
            "loc": {
                "end": {
                    "column": 8,
                    "line": 2
                },
                "start": {
                    "column": 0,
                    "line": 2
                }
            },
            "range": [
                11,
                19
            ],
            "type": "Keyword",
            "value": "function"
        },
        {
            "loc": {
                "end": {
                    "column": 10,
                    "line": 2
                },
                "start": {
                    "column": 9,
                    "line": 2
                }
            },
            "range": [
                20,
                21
            ],
            "type": "Identifier",
            "value": "f"
        },
        {
            "loc": {
                "end": {
                    "column": 11,
                    "line": 2
                },
                "start": {
                    "column": 10,
                    "line": 2
                }
            },
            "range": [
                21,
                22
            ],
            "type": "Punctuator",
            "value": "("
        },
        {
            "loc": {
                "end": {
                    "column": 12,
                    "line": 2
                },
                "start": {
                    "column": 11,
                    "line": 2
                }
            },
            "range": [
                22,
                23
            ],
            "type": "Punctuator",
            "value": ")"
        },
        {
            "loc": {
                "end": {
                    "column": 14,
                    "line": 2
                },
                "start": {
                    "column": 13,
                    "line": 2
                }
            },
            "range": [
                24,
                25
            ],
            "type": "Punctuator",
            "value": "{"
        },
        {
            "loc": {
                "end": {
                    "column": 3,
                    "line": 3
                },
                "start": {
                    "column": 2,
                    "line": 3
                }
            },
            "range": [
                28,
                29
            ],
            "type": "Identifier",
            "value": "i"
        },
        {
            "loc": {
                "end": {
                    "column": 5,
                    "line": 3
                },
                "start": {
                    "column": 3,
                    "line": 3
                }
            },
            "range": [
                29,
                31
            ],
            "type": "Punctuator",
            "value": "++"
        },
        {
            "loc": {
                "end": {
                    "column": 6,
                    "line": 3
                },
                "start": {
                    "column": 5,
                    "line": 3
                }
            },
            "range": [
                31,
                32
            ],
            "type": "Punctuator",
            "value": ";"
        },
        {
            "loc": {
                "end": {
                    "column": 1,
                    "line": 4
                },
                "start": {
                    "column": 0,
                    "line": 4
                }
            },
            "range": [
                33,
                34
            ],
            "type": "Punctuator",
            "value": "}"
        },
        {
            "loc": {
                "end": {
                    "column": 1,
                    "line": 5
                },
                "start": {
                    "column": 0,
                    "line": 5
                }
            },
            "range": [
                35,
                36
            ],
            "type": "Identifier",
            "value": "f"
        },
        {
            "loc": {
                "end": {
                    "column": 2,
                    "line": 5
                },
                "start": {
                    "column": 1,
                    "line": 5
                }
            },
            "range": [
                36,
                37
            ],
            "type": "Punctuator",
            "value": "("
        },
        {
            "loc": {
                "end": {
                    "column": 3,
                    "line": 5
                },
                "start": {
                    "column": 2,
                    "line": 5
                }
            },
            "range": [
                37,
                38
            ],
            "type": "Punctuator",
            "value": ")"
        },
        {
            "loc": {
                "end": {
                    "column": 4,
                    "line": 5
                },
                "start": {
                    "column": 3,
                    "line": 5
                }
            },
            "range": [
                38,
                39
            ],
            "type": "Punctuator",
            "value": ";"
        }
    ],
    "type": "Program"
};
