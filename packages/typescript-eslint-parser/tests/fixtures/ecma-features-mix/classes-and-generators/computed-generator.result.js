module.exports = {
    "type": "Program",
    "body": [
        {
            "type": "ClassDeclaration",
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
                            "type": "MemberExpression",
                            "computed": false,
                            "object": {
                                "type": "Identifier",
                                "name": "Symbol",
                                "range": [
                                    15,
                                    21
                                ],
                                "loc": {
                                    "start": {
                                        "line": 2,
                                        "column": 3
                                    },
                                    "end": {
                                        "line": 2,
                                        "column": 9
                                    }
                                }
                            },
                            "property": {
                                "type": "Identifier",
                                "name": "iterator",
                                "range": [
                                    22,
                                    30
                                ],
                                "loc": {
                                    "start": {
                                        "line": 2,
                                        "column": 10
                                    },
                                    "end": {
                                        "line": 2,
                                        "column": 18
                                    }
                                }
                            },
                            "range": [
                                15,
                                30
                            ],
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 3
                                },
                                "end": {
                                    "line": 2,
                                    "column": 18
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
                                    34,
                                    38
                                ],
                                "loc": {
                                    "start": {
                                        "line": 2,
                                        "column": 22
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
                                31,
                                38
                            ],
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 19
                                },
                                "end": {
                                    "line": 3,
                                    "column": 2
                                }
                            }
                        },
                        "kind": "method",
                        "computed": true,
                        "range": [
                            13,
                            38
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
                        "static": false
                    }
                ],
                "range": [
                    10,
                    40
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
                40
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
        40
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
            "type": "Punctuator",
            "value": "*",
            "range": [
                13,
                14
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 1
                },
                "end": {
                    "line": 2,
                    "column": 2
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "[",
            "range": [
                14,
                15
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 2
                },
                "end": {
                    "line": 2,
                    "column": 3
                }
            }
        },
        {
            "type": "Identifier",
            "value": "Symbol",
            "range": [
                15,
                21
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 3
                },
                "end": {
                    "line": 2,
                    "column": 9
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ".",
            "range": [
                21,
                22
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 9
                },
                "end": {
                    "line": 2,
                    "column": 10
                }
            }
        },
        {
            "type": "Identifier",
            "value": "iterator",
            "range": [
                22,
                30
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 10
                },
                "end": {
                    "line": 2,
                    "column": 18
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "]",
            "range": [
                30,
                31
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 18
                },
                "end": {
                    "line": 2,
                    "column": 19
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "(",
            "range": [
                31,
                32
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 19
                },
                "end": {
                    "line": 2,
                    "column": 20
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ")",
            "range": [
                32,
                33
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 20
                },
                "end": {
                    "line": 2,
                    "column": 21
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                34,
                35
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 22
                },
                "end": {
                    "line": 2,
                    "column": 23
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                37,
                38
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
                39,
                40
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
