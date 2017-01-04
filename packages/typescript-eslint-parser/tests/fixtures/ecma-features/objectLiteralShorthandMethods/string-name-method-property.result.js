module.exports = {
    "type": "Program",
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 5,
            "column": 2
        }
    },
    "range": [
        0,
        52
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
                    "line": 5,
                    "column": 2
                }
            },
            "range": [
                0,
                52
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
                            "line": 5,
                            "column": 1
                        }
                    },
                    "range": [
                        4,
                        51
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
                                "column": 5
                            }
                        },
                        "range": [
                            4,
                            5
                        ],
                        "name": "x"
                    },
                    "init": {
                        "type": "ObjectExpression",
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 8
                            },
                            "end": {
                                "line": 5,
                                "column": 1
                            }
                        },
                        "range": [
                            8,
                            51
                        ],
                        "properties": [
                            {
                                "type": "Property",
                                "loc": {
                                    "start": {
                                        "line": 2,
                                        "column": 4
                                    },
                                    "end": {
                                        "line": 4,
                                        "column": 5
                                    }
                                },
                                "range": [
                                    14,
                                    49
                                ],
                                "method": true,
                                "shorthand": false,
                                "computed": false,
                                "key": {
                                    "type": "Literal",
                                    "loc": {
                                        "start": {
                                            "line": 2,
                                            "column": 4
                                        },
                                        "end": {
                                            "line": 2,
                                            "column": 9
                                        }
                                    },
                                    "range": [
                                        14,
                                        19
                                    ],
                                    "value": "foo",
                                    "raw": "\"foo\""
                                },
                                "kind": "init",
                                "value": {
                                    "type": "FunctionExpression",
                                    "loc": {
                                        "start": {
                                            "line": 2,
                                            "column": 9
                                        },
                                        "end": {
                                            "line": 4,
                                            "column": 5
                                        }
                                    },
                                    "range": [
                                        19,
                                        49
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
                                                "line": 2,
                                                "column": 12
                                            },
                                            "end": {
                                                "line": 4,
                                                "column": 5
                                            }
                                        },
                                        "range": [
                                            22,
                                            49
                                        ],
                                        "body": [
                                            {
                                                "type": "ReturnStatement",
                                                "loc": {
                                                    "start": {
                                                        "line": 3,
                                                        "column": 8
                                                    },
                                                    "end": {
                                                        "line": 3,
                                                        "column": 19
                                                    }
                                                },
                                                "range": [
                                                    32,
                                                    43
                                                ],
                                                "argument": {
                                                    "type": "Identifier",
                                                    "loc": {
                                                        "start": {
                                                            "line": 3,
                                                            "column": 15
                                                        },
                                                        "end": {
                                                            "line": 3,
                                                            "column": 18
                                                        }
                                                    },
                                                    "range": [
                                                        39,
                                                        42
                                                    ],
                                                    "name": "bar"
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        ]
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
            "value": "x",
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
            "type": "Punctuator",
            "value": "=",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 6
                },
                "end": {
                    "line": 1,
                    "column": 7
                }
            },
            "range": [
                6,
                7
            ]
        },
        {
            "type": "Punctuator",
            "value": "{",
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
            "type": "String",
            "value": "\"foo\"",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 4
                },
                "end": {
                    "line": 2,
                    "column": 9
                }
            },
            "range": [
                14,
                19
            ]
        },
        {
            "type": "Punctuator",
            "value": "(",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 9
                },
                "end": {
                    "line": 2,
                    "column": 10
                }
            },
            "range": [
                19,
                20
            ]
        },
        {
            "type": "Punctuator",
            "value": ")",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 10
                },
                "end": {
                    "line": 2,
                    "column": 11
                }
            },
            "range": [
                20,
                21
            ]
        },
        {
            "type": "Punctuator",
            "value": "{",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 12
                },
                "end": {
                    "line": 2,
                    "column": 13
                }
            },
            "range": [
                22,
                23
            ]
        },
        {
            "type": "Keyword",
            "value": "return",
            "loc": {
                "start": {
                    "line": 3,
                    "column": 8
                },
                "end": {
                    "line": 3,
                    "column": 14
                }
            },
            "range": [
                32,
                38
            ]
        },
        {
            "type": "Identifier",
            "value": "bar",
            "loc": {
                "start": {
                    "line": 3,
                    "column": 15
                },
                "end": {
                    "line": 3,
                    "column": 18
                }
            },
            "range": [
                39,
                42
            ]
        },
        {
            "type": "Punctuator",
            "value": ";",
            "loc": {
                "start": {
                    "line": 3,
                    "column": 18
                },
                "end": {
                    "line": 3,
                    "column": 19
                }
            },
            "range": [
                42,
                43
            ]
        },
        {
            "type": "Punctuator",
            "value": "}",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 4
                },
                "end": {
                    "line": 4,
                    "column": 5
                }
            },
            "range": [
                48,
                49
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
                50,
                51
            ]
        },
        {
            "type": "Punctuator",
            "value": ";",
            "loc": {
                "start": {
                    "line": 5,
                    "column": 1
                },
                "end": {
                    "line": 5,
                    "column": 2
                }
            },
            "range": [
                51,
                52
            ]
        }
    ]
};
