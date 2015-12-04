module.exports = {
    "type": "Program",
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
    "range": [
        0,
        47
    ],
    "body": [
        {
            "type": "SwitchStatement",
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
            "range": [
                0,
                47
            ],
            "discriminant": {
                "type": "Identifier",
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
                "range": [
                    8,
                    14
                ],
                "name": "answer"
            },
            "cases": [
                {
                    "type": "SwitchCase",
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 18
                        },
                        "end": {
                            "line": 1,
                            "column": 45
                        }
                    },
                    "range": [
                        18,
                        45
                    ],
                    "consequent": [
                        {
                            "type": "VariableDeclaration",
                            "loc": {
                                "start": {
                                    "line": 1,
                                    "column": 27
                                },
                                "end": {
                                    "line": 1,
                                    "column": 38
                                }
                            },
                            "range": [
                                27,
                                38
                            ],
                            "declarations": [
                                {
                                    "type": "VariableDeclarator",
                                    "loc": {
                                        "start": {
                                            "line": 1,
                                            "column": 31
                                        },
                                        "end": {
                                            "line": 1,
                                            "column": 37
                                        }
                                    },
                                    "range": [
                                        31,
                                        37
                                    ],
                                    "id": {
                                        "type": "Identifier",
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
                                        ],
                                        "name": "t"
                                    },
                                    "init": {
                                        "type": "Literal",
                                        "loc": {
                                            "start": {
                                                "line": 1,
                                                "column": 35
                                            },
                                            "end": {
                                                "line": 1,
                                                "column": 37
                                            }
                                        },
                                        "range": [
                                            35,
                                            37
                                        ],
                                        "value": 42,
                                        "raw": "42"
                                    }
                                }
                            ],
                            "kind": "let"
                        },
                        {
                            "type": "BreakStatement",
                            "loc": {
                                "start": {
                                    "line": 1,
                                    "column": 39
                                },
                                "end": {
                                    "line": 1,
                                    "column": 45
                                }
                            },
                            "range": [
                                39,
                                45
                            ],
                            "label": null
                        }
                    ],
                    "test": {
                        "type": "Literal",
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 23
                            },
                            "end": {
                                "line": 1,
                                "column": 25
                            }
                        },
                        "range": [
                            23,
                            25
                        ],
                        "value": 42,
                        "raw": "42"
                    }
                }
            ]
        }
    ],
    "sourceType": "script",
    "tokens": [
        {
            "type": "Keyword",
            "value": "switch",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 6
                }
            },
            "range": [
                0,
                6
            ]
        },
        {
            "type": "Punctuator",
            "value": "(",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 7
                },
                "end": {
                    "line": 1,
                    "column": 8
                }
            },
            "range": [
                7,
                8
            ]
        },
        {
            "type": "Identifier",
            "value": "answer",
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
            "range": [
                8,
                14
            ]
        },
        {
            "type": "Punctuator",
            "value": ")",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 14
                },
                "end": {
                    "line": 1,
                    "column": 15
                }
            },
            "range": [
                14,
                15
            ]
        },
        {
            "type": "Punctuator",
            "value": "{",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 16
                },
                "end": {
                    "line": 1,
                    "column": 17
                }
            },
            "range": [
                16,
                17
            ]
        },
        {
            "type": "Keyword",
            "value": "case",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 18
                },
                "end": {
                    "line": 1,
                    "column": 22
                }
            },
            "range": [
                18,
                22
            ]
        },
        {
            "type": "Numeric",
            "value": "42",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 23
                },
                "end": {
                    "line": 1,
                    "column": 25
                }
            },
            "range": [
                23,
                25
            ]
        },
        {
            "type": "Punctuator",
            "value": ":",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 25
                },
                "end": {
                    "line": 1,
                    "column": 26
                }
            },
            "range": [
                25,
                26
            ]
        },
        {
            "type": "Keyword",
            "value": "let",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 27
                },
                "end": {
                    "line": 1,
                    "column": 30
                }
            },
            "range": [
                27,
                30
            ]
        },
        {
            "type": "Identifier",
            "value": "t",
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
            "value": "=",
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
            "type": "Numeric",
            "value": "42",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 35
                },
                "end": {
                    "line": 1,
                    "column": 37
                }
            },
            "range": [
                35,
                37
            ]
        },
        {
            "type": "Punctuator",
            "value": ";",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 37
                },
                "end": {
                    "line": 1,
                    "column": 38
                }
            },
            "range": [
                37,
                38
            ]
        },
        {
            "type": "Keyword",
            "value": "break",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 39
                },
                "end": {
                    "line": 1,
                    "column": 44
                }
            },
            "range": [
                39,
                44
            ]
        },
        {
            "type": "Punctuator",
            "value": ";",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 44
                },
                "end": {
                    "line": 1,
                    "column": 45
                }
            },
            "range": [
                44,
                45
            ]
        },
        {
            "type": "Punctuator",
            "value": "}",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 46
                },
                "end": {
                    "line": 1,
                    "column": 47
                }
            },
            "range": [
                46,
                47
            ]
        }
    ]
};
