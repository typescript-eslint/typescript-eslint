module.exports = {
    "type": "Program",
    "body": [
        {
            "type": "ClassDeclaration",
            "decorators": [],
            "id": {
                "type": "Identifier",
                "name": "Foo",
                "range": [
                    6,
                    9
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 6
                    },
                    "end": {
                        "line": 1,
                        "column": 9
                    }
                }
            },
            "superClass": null,
            "body": {
                "type": "ClassBody",
                "body": [
                    {
                        "type": "MethodDefinition",
                        "key": {
                            "type": "Identifier",
                            "name": "bar",
                            "range": [
                                21,
                                24
                            ],
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 9
                                },
                                "end": {
                                    "line": 2,
                                    "column": 12
                                }
                            }
                        },
                        "value": {
                            "type": "FunctionExpression",
                            "id": null,
                            "params": [],
                            "body": {
                                "type": "BlockStatement",
                                "body": [],
                                "range": [
                                    27,
                                    31
                                ],
                                "loc": {
                                    "start": {
                                        "line": 2,
                                        "column": 15
                                    },
                                    "end": {
                                        "line": 3,
                                        "column": 2
                                    }
                                }
                            },
                            "generator": true,
                            "expression": false,
                            "range": [
                                24,
                                31
                            ],
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 12
                                },
                                "end": {
                                    "line": 3,
                                    "column": 2
                                }
                            }
                        },
                        "kind": "method",
                        "computed": false,
                        "range": [
                            13,
                            31
                        ],
                        "loc": {
                            "start": {
                                "line": 2,
                                "column": 1
                            },
                            "end": {
                                "line": 3,
                                "column": 2
                            }
                        },
                        "static": true
                    }
                ],
                "range": [
                    10,
                    33
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 10
                    },
                    "end": {
                        "line": 4,
                        "column": 1
                    }
                }
            },
            "range": [
                0,
                33
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
            }
        }
    ],
    "sourceType": "script",
    "range": [
        0,
        33
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
            "value": "Foo",
            "range": [
                6,
                9
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 6
                },
                "end": {
                    "line": 1,
                    "column": 9
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                10,
                11
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 10
                },
                "end": {
                    "line": 1,
                    "column": 11
                }
            }
        },
        {
            "type": "Keyword",
            "value": "static",
            "range": [
                13,
                19
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 1
                },
                "end": {
                    "line": 2,
                    "column": 7
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "*",
            "range": [
                20,
                21
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 8
                },
                "end": {
                    "line": 2,
                    "column": 9
                }
            }
        },
        {
            "type": "Identifier",
            "value": "bar",
            "range": [
                21,
                24
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 9
                },
                "end": {
                    "line": 2,
                    "column": 12
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "(",
            "range": [
                24,
                25
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 12
                },
                "end": {
                    "line": 2,
                    "column": 13
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ")",
            "range": [
                25,
                26
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 13
                },
                "end": {
                    "line": 2,
                    "column": 14
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                27,
                28
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
            "value": "}",
            "range": [
                30,
                31
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 1
                },
                "end": {
                    "line": 3,
                    "column": 2
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                32,
                33
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
