module.exports = {
    "type": "Program",
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 3,
            "column": 2
        }
    },
    "range": [
        0,
        29
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
                    "line": 3,
                    "column": 2
                }
            },
            "range": [
                0,
                29
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
                            "line": 3,
                            "column": 1
                        }
                    },
                    "range": [
                        4,
                        28
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
                                "line": 3,
                                "column": 1
                            }
                        },
                        "range": [
                            8,
                            28
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
                                        "line": 2,
                                        "column": 16
                                    }
                                },
                                "range": [
                                    14,
                                    26
                                ],
                                "method": false,
                                "shorthand": false,
                                "computed": true,
                                "key": {
                                    "type": "Literal",
                                    "loc": {
                                        "start": {
                                            "line": 2,
                                            "column": 5
                                        },
                                        "end": {
                                            "line": 2,
                                            "column": 10
                                        }
                                    },
                                    "range": [
                                        15,
                                        20
                                    ],
                                    "value": "hey",
                                    "raw": "\"hey\""
                                },
                                "value": {
                                    "type": "Identifier",
                                    "loc": {
                                        "start": {
                                            "line": 2,
                                            "column": 13
                                        },
                                        "end": {
                                            "line": 2,
                                            "column": 16
                                        }
                                    },
                                    "range": [
                                        23,
                                        26
                                    ],
                                    "name": "foo"
                                },
                                "kind": "init"
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
            "type": "Punctuator",
            "value": "[",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 4
                },
                "end": {
                    "line": 2,
                    "column": 5
                }
            },
            "range": [
                14,
                15
            ]
        },
        {
            "type": "String",
            "value": "\"hey\"",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 5
                },
                "end": {
                    "line": 2,
                    "column": 10
                }
            },
            "range": [
                15,
                20
            ]
        },
        {
            "type": "Punctuator",
            "value": "]",
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
            "value": ":",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 11
                },
                "end": {
                    "line": 2,
                    "column": 12
                }
            },
            "range": [
                21,
                22
            ]
        },
        {
            "type": "Identifier",
            "value": "foo",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 13
                },
                "end": {
                    "line": 2,
                    "column": 16
                }
            },
            "range": [
                23,
                26
            ]
        },
        {
            "type": "Punctuator",
            "value": "}",
            "loc": {
                "start": {
                    "line": 3,
                    "column": 0
                },
                "end": {
                    "line": 3,
                    "column": 1
                }
            },
            "range": [
                27,
                28
            ]
        },
        {
            "type": "Punctuator",
            "value": ";",
            "loc": {
                "start": {
                    "line": 3,
                    "column": 1
                },
                "end": {
                    "line": 3,
                    "column": 2
                }
            },
            "range": [
                28,
                29
            ]
        }
    ]
};