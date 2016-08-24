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
            "line": 4,
            "column": 1
        }
    },
    "body": [
        {
            "type": "ClassDeclaration",
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
                    "line": 4,
                    "column": 1
                }
            },
            "id": {
                "type": "Identifier",
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
                },
                "name": "D"
            },
            "body": {
                "type": "ClassBody",
                "body": [
                    {
                        "type": "MethodDefinition",
                        "range": [
                            14,
                            47
                        ],
                        "loc": {
                            "start": {
                                "line": 2,
                                "column": 4
                            },
                            "end": {
                                "line": 3,
                                "column": 28
                            }
                        },
                        "key": {
                            "type": "Identifier",
                            "range": [
                                30,
                                42
                            ],
                            "loc": {
                                "start": {
                                    "line": 3,
                                    "column": 11
                                },
                                "end": {
                                    "line": 3,
                                    "column": 23
                                }
                            },
                            "name": "staticMethod"
                        },
                        "value": {
                            "type": "FunctionExpression",
                            "id": null,
                            "params": [],
                            "generator": false,
                            "expression": false,
                            "body": {
                                "type": "BlockStatement",
                                "range": [
                                    45,
                                    47
                                ],
                                "loc": {
                                    "start": {
                                        "line": 3,
                                        "column": 26
                                    },
                                    "end": {
                                        "line": 3,
                                        "column": 28
                                    }
                                },
                                "body": []
                            },
                            "range": [
                                42,
                                47
                            ],
                            "loc": {
                                "start": {
                                    "line": 3,
                                    "column": 23
                                },
                                "end": {
                                    "line": 3,
                                    "column": 28
                                }
                            }
                        },
                        "computed": false,
                        "static": true,
                        "kind": "method",
                        "decorators": [
                            {
                                "loc": {
                                    "end": {
                                        "column": 8,
                                        "line": 2
                                    },
                                    "start": {
                                        "column": 5,
                                        "line": 2
                                    }
                                },
                                "name": "Foo",
                                "range": [
                                    15,
                                    18
                                ],
                                "type": "Identifier"
                            }
                        ]
                    }
                ],
                "range": [
                    8,
                    49
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 8
                    },
                    "end": {
                        "line": 4,
                        "column": 1
                    }
                }
            },
            "superClass": null,
            "implements": []
        }
    ],
    "sourceType": "script",
    "tokens": [
        {
            "type": "Keyword",
            "value": "class",
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
            "type": "Identifier",
            "value": "D",
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
            "type": "Punctuator",
            "value": "{",
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
            "value": "@",
            "range": [
                14,
                15
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 4
                },
                "end": {
                    "line": 2,
                    "column": 5
                }
            }
        },
        {
            "type": "Identifier",
            "value": "Foo",
            "range": [
                15,
                18
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 5
                },
                "end": {
                    "line": 2,
                    "column": 8
                }
            }
        },
        {
            "type": "Keyword",
            "value": "static",
            "range": [
                23,
                29
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 4
                },
                "end": {
                    "line": 3,
                    "column": 10
                }
            }
        },
        {
            "type": "Identifier",
            "value": "staticMethod",
            "range": [
                30,
                42
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 11
                },
                "end": {
                    "line": 3,
                    "column": 23
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "(",
            "range": [
                42,
                43
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 23
                },
                "end": {
                    "line": 3,
                    "column": 24
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ")",
            "range": [
                43,
                44
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 24
                },
                "end": {
                    "line": 3,
                    "column": 25
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                45,
                46
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 26
                },
                "end": {
                    "line": 3,
                    "column": 27
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                46,
                47
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 27
                },
                "end": {
                    "line": 3,
                    "column": 28
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
                    "line": 4,
                    "column": 0
                },
                "end": {
                    "line": 4,
                    "column": 1
                }
            }
        }
    ]
};
