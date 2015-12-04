module.exports = {
    "type": "Program",
    "body": [
        {
            "type": "ForOfStatement",
            "left": {
                "type": "VariableDeclaration",
                "declarations": [
                    {
                        "type": "VariableDeclarator",
                        "id": {
                            "type": "Identifier",
                            "name": "x",
                            "range": [
                                9,
                                10
                            ],
                            "loc": {
                                "start": {
                                    "line": 1,
                                    "column": 9
                                },
                                "end": {
                                    "line": 1,
                                    "column": 10
                                }
                            }
                        },
                        "init": null,
                        "range": [
                            9,
                            10
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 9
                            },
                            "end": {
                                "line": 1,
                                "column": 10
                            }
                        }
                    }
                ],
                "kind": "let",
                "range": [
                    5,
                    10
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 5
                    },
                    "end": {
                        "line": 1,
                        "column": 10
                    }
                }
            },
            "right": {
                "type": "Identifier",
                "name": "foo",
                "range": [
                    14,
                    17
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 14
                    },
                    "end": {
                        "line": 1,
                        "column": 17
                    }
                }
            },
            "body": {
                "type": "ExpressionStatement",
                "expression": {
                    "type": "CallExpression",
                    "callee": {
                        "type": "Identifier",
                        "name": "doSomething",
                        "range": [
                            23,
                            34
                        ],
                        "loc": {
                            "start": {
                                "line": 2,
                                "column": 4
                            },
                            "end": {
                                "line": 2,
                                "column": 15
                            }
                        }
                    },
                    "arguments": [],
                    "range": [
                        23,
                        36
                    ],
                    "loc": {
                        "start": {
                            "line": 2,
                            "column": 4
                        },
                        "end": {
                            "line": 2,
                            "column": 17
                        }
                    }
                },
                "range": [
                    23,
                    37
                ],
                "loc": {
                    "start": {
                        "line": 2,
                        "column": 4
                    },
                    "end": {
                        "line": 2,
                        "column": 18
                    }
                }
            },
            "range": [
                0,
                37
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 2,
                    "column": 18
                }
            }
        }
    ],
    "sourceType": "script",
    "range": [
        0,
        37
    ],
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
    "tokens": [
        {
            "type": "Keyword",
            "value": "for",
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
            "type": "Punctuator",
            "value": "(",
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
            "type": "Keyword",
            "value": "let",
            "range": [
                5,
                8
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 5
                },
                "end": {
                    "line": 1,
                    "column": 8
                }
            }
        },
        {
            "type": "Identifier",
            "value": "x",
            "range": [
                9,
                10
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 9
                },
                "end": {
                    "line": 1,
                    "column": 10
                }
            }
        },
        {
            "type": "Identifier",
            "value": "of",
            "range": [
                11,
                13
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 11
                },
                "end": {
                    "line": 1,
                    "column": 13
                }
            }
        },
        {
            "type": "Identifier",
            "value": "foo",
            "range": [
                14,
                17
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 14
                },
                "end": {
                    "line": 1,
                    "column": 17
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ")",
            "range": [
                17,
                18
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 17
                },
                "end": {
                    "line": 1,
                    "column": 18
                }
            }
        },
        {
            "type": "Identifier",
            "value": "doSomething",
            "range": [
                23,
                34
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 4
                },
                "end": {
                    "line": 2,
                    "column": 15
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "(",
            "range": [
                34,
                35
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 15
                },
                "end": {
                    "line": 2,
                    "column": 16
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ")",
            "range": [
                35,
                36
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 16
                },
                "end": {
                    "line": 2,
                    "column": 17
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ";",
            "range": [
                36,
                37
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 17
                },
                "end": {
                    "line": 2,
                    "column": 18
                }
            }
        }
    ]
};