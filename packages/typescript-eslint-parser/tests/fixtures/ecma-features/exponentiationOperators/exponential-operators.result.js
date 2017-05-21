module.exports = {
    "type": "Program",
    "range": [
        0,
        24
    ],
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 2,
            "column": 8
        }
    },
    "body": [
        {
            "type": "VariableDeclaration",
            "range": [
                0,
                15
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 15
                }
            },
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "range": [
                        4,
                        14
                    ],
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 4
                        },
                        "end": {
                            "line": 1,
                            "column": 14
                        }
                    },
                    "id": {
                        "type": "Identifier",
                        "range": [
                            4,
                            5
                        ],
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
                        "name": "x"
                    },
                    "init": {
                        "type": "BinaryExpression",
                        "range": [
                            8,
                            14
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 8
                            },
                            "end": {
                                "line": 1,
                                "column": 14
                            }
                        },
                        "operator": "**",
                        "left": {
                            "type": "Literal",
                            "range": [
                                8,
                                9
                            ],
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
                            "value": 2,
                            "raw": "2"
                        },
                        "right": {
                            "type": "Literal",
                            "range": [
                                13,
                                14
                            ],
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
                            "value": 3,
                            "raw": "3"
                        }
                    }
                }
            ],
            "kind": "var"
        },
        {
            "type": "ExpressionStatement",
            "range": [
                16,
                24
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 0
                },
                "end": {
                    "line": 2,
                    "column": 8
                }
            },
            "expression": {
                "type": "BinaryExpression",
                "range": [
                    16,
                    23
                ],
                "loc": {
                    "start": {
                        "line": 2,
                        "column": 0
                    },
                    "end": {
                        "line": 2,
                        "column": 7
                    }
                },
                "operator": "**=",
                "left": {
                    "type": "Identifier",
                    "range": [
                        16,
                        17
                    ],
                    "loc": {
                        "start": {
                            "line": 2,
                            "column": 0
                        },
                        "end": {
                            "line": 2,
                            "column": 1
                        }
                    },
                    "name": "x"
                },
                "right": {
                    "type": "Literal",
                    "range": [
                        22,
                        23
                    ],
                    "loc": {
                        "start": {
                            "line": 2,
                            "column": 6
                        },
                        "end": {
                            "line": 2,
                            "column": 7
                        }
                    },
                    "value": 4,
                    "raw": "4"
                }
            }
        }
    ],
    "sourceType": "script",
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
            "value": "x",
            "range": [
                4,
                5
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 4
                },
                "end": {
                    "line": 1,
                    "column": 5
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "=",
            "range": [
                6,
                7
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 6
                },
                "end": {
                    "line": 1,
                    "column": 7
                }
            }
        },
        {
            "type": "Numeric",
            "value": "2",
            "range": [
                8,
                9
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 8
                },
                "end": {
                    "line": 1,
                    "column": 9
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "**",
            "range": [
                10,
                12
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 10
                },
                "end": {
                    "line": 1,
                    "column": 12
                }
            }
        },
        {
            "type": "Numeric",
            "value": "3",
            "range": [
                13,
                14
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 13
                },
                "end": {
                    "line": 1,
                    "column": 14
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ";",
            "range": [
                14,
                15
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 14
                },
                "end": {
                    "line": 1,
                    "column": 15
                }
            }
        },
        {
            "type": "Identifier",
            "value": "x",
            "range": [
                16,
                17
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 0
                },
                "end": {
                    "line": 2,
                    "column": 1
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "**=",
            "range": [
                18,
                21
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 2
                },
                "end": {
                    "line": 2,
                    "column": 5
                }
            }
        },
        {
            "type": "Numeric",
            "value": "4",
            "range": [
                22,
                23
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 6
                },
                "end": {
                    "line": 2,
                    "column": 7
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ";",
            "range": [
                23,
                24
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 7
                },
                "end": {
                    "line": 2,
                    "column": 8
                }
            }
        }
    ]
}
