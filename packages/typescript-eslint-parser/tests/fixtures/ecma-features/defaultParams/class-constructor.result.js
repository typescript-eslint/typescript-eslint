module.exports = {
    "type": "Program",
    "range": [
        0,
        46
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
                46
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
                "name": "A"
            },
            "body": {
                "type": "ClassBody",
                "body": [
                    {
                        "type": "MethodDefinition",
                        "range": [
                            14,
                            44
                        ],
                        "loc": {
                            "start": {
                                "line": 2,
                                "column": 4
                            },
                            "end": {
                                "line": 3,
                                "column": 5
                            }
                        },
                        "key": {
                            "type": "Identifier",
                            "name": "constructor",
                            "range": [
                                14,
                                25
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
                        "value": {
                            "type": "FunctionExpression",
                            "id": null,
                            "params": [
                                {
                                    "type": "AssignmentPattern",
                                    "range": [
                                        26,
                                        35
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 2,
                                            "column": 16
                                        },
                                        "end": {
                                            "line": 2,
                                            "column": 25
                                        }
                                    },
                                    "left": {
                                        "type": "Identifier",
                                        "range": [
                                            26,
                                            29
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 2,
                                                "column": 16
                                            },
                                            "end": {
                                                "line": 2,
                                                "column": 19
                                            }
                                        },
                                        "name": "foo"
                                    },
                                    "right": {
                                        "type": "Literal",
                                        "range": [
                                            30,
                                            35
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 2,
                                                "column": 20
                                            },
                                            "end": {
                                                "line": 2,
                                                "column": 25
                                            }
                                        },
                                        "value": "bar",
                                        "raw": "'bar'"
                                    },
                                    "decorators": []
                                }
                            ],
                            "generator": false,
                            "expression": false,
                            "async": false,
                            "body": {
                                "type": "BlockStatement",
                                "range": [
                                    37,
                                    44
                                ],
                                "loc": {
                                    "start": {
                                        "line": 2,
                                        "column": 27
                                    },
                                    "end": {
                                        "line": 3,
                                        "column": 5
                                    }
                                },
                                "body": []
                            },
                            "range": [
                                25,
                                44
                            ],
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 15
                                },
                                "end": {
                                    "line": 3,
                                    "column": 5
                                }
                            }
                        },
                        "computed": false,
                        "accessibility": null,
                        "static": false,
                        "kind": "constructor"
                    }
                ],
                "range": [
                    8,
                    46
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
            "implements": [],
            "decorators": []
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
            "value": "A",
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
            "type": "Identifier",
            "value": "constructor",
            "range": [
                14,
                25
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
                25,
                26
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
            "type": "Identifier",
            "value": "foo",
            "range": [
                26,
                29
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 16
                },
                "end": {
                    "line": 2,
                    "column": 19
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "=",
            "range": [
                29,
                30
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
            "type": "String",
            "value": "'bar'",
            "range": [
                30,
                35
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 20
                },
                "end": {
                    "line": 2,
                    "column": 25
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
                    "column": 25
                },
                "end": {
                    "line": 2,
                    "column": 26
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                37,
                38
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 27
                },
                "end": {
                    "line": 2,
                    "column": 28
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                43,
                44
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 4
                },
                "end": {
                    "line": 3,
                    "column": 5
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                45,
                46
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
