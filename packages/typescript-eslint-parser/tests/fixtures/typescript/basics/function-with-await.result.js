module.exports = {
    "type": "Program",
    "range": [
        0,
        49
    ],
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 3,
            "column": 1
        }
    },
    "body": [
        {
            "type": "FunctionDeclaration",
            "range": [
                0,
                49
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 3,
                    "column": 1
                }
            },
            "id": {
                "type": "Identifier",
                "range": [
                    15,
                    19
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 15
                    },
                    "end": {
                        "line": 1,
                        "column": 19
                    }
                },
                "name": "hope"
            },
            "generator": false,
            "expression": false,
            "async": true,
            "params": [
                {
                    "type": "Identifier",
                    "range": [
                        20,
                        26
                    ],
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 20
                        },
                        "end": {
                            "line": 1,
                            "column": 26
                        }
                    },
                    "name": "future"
                }
            ],
            "body": {
                "type": "BlockStatement",
                "range": [
                    28,
                    49
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 28
                    },
                    "end": {
                        "line": 3,
                        "column": 1
                    }
                },
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "range": [
                            34,
                            47
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
                        },
                        "expression": {
                            "type": "AwaitExpression",
                            "range": [
                                34,
                                46
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
                            },
                            "argument": {
                                "type": "Identifier",
                                "range": [
                                    40,
                                    46
                                ],
                                "loc": {
                                    "start": {
                                        "line": 2,
                                        "column": 10
                                    },
                                    "end": {
                                        "line": 2,
                                        "column": 16
                                    }
                                },
                                "name": "future"
                            }
                        }
                    }
                ]
            }
        }
    ],
    "sourceType": "script",
    "tokens": [
        {
            "type": "Identifier",
            "value": "async",
            "range": [
                0,
                5
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 5
                }
            }
        },
        {
            "type": "Keyword",
            "value": "function",
            "range": [
                6,
                14
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 6
                },
                "end": {
                    "line": 1,
                    "column": 14
                }
            }
        },
        {
            "type": "Identifier",
            "value": "hope",
            "range": [
                15,
                19
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 15
                },
                "end": {
                    "line": 1,
                    "column": 19
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "(",
            "range": [
                19,
                20
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 19
                },
                "end": {
                    "line": 1,
                    "column": 20
                }
            }
        },
        {
            "type": "Identifier",
            "value": "future",
            "range": [
                20,
                26
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 20
                },
                "end": {
                    "line": 1,
                    "column": 26
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ")",
            "range": [
                26,
                27
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 26
                },
                "end": {
                    "line": 1,
                    "column": 27
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                28,
                29
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 28
                },
                "end": {
                    "line": 1,
                    "column": 29
                }
            }
        },
        {
            "type": "Identifier",
            "value": "await",
            "range": [
                34,
                39
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 4
                },
                "end": {
                    "line": 2,
                    "column": 9
                }
            }
        },
        {
            "type": "Identifier",
            "value": "future",
            "range": [
                40,
                46
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 10
                },
                "end": {
                    "line": 2,
                    "column": 16
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
            "value": "}",
            "range": [
                48,
                49
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 0
                },
                "end": {
                    "line": 3,
                    "column": 1
                }
            }
        }
    ]
};