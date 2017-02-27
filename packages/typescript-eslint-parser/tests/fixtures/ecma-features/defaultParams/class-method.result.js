module.exports = {
    "type": "Program",
    "range": [
        0,
        38
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
                38
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
                            36
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
                            "range": [
                                14,
                                17
                            ],
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 4
                                },
                                "end": {
                                    "line": 2,
                                    "column": 7
                                }
                            },
                            "name": "foo"
                        },
                        "value": {
                            "type": "FunctionExpression",
                            "id": null,
                            "generator": false,
                            "expression": false,
                            "async": false,
                            "body": {
                                "type": "BlockStatement",
                                "range": [
                                    29,
                                    36
                                ],
                                "loc": {
                                    "start": {
                                        "line": 2,
                                        "column": 19
                                    },
                                    "end": {
                                        "line": 3,
                                        "column": 5
                                    }
                                },
                                "body": []
                            },
                            "range": [
                                17,
                                36
                            ],
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 7
                                },
                                "end": {
                                    "line": 3,
                                    "column": 5
                                }
                            },
                            "params": [
                                {
                                    "type": "AssignmentPattern",
                                    "range": [
                                        18,
                                        27
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 2,
                                            "column": 8
                                        },
                                        "end": {
                                            "line": 2,
                                            "column": 17
                                        }
                                    },
                                    "left": {
                                        "type": "Identifier",
                                        "range": [
                                            18,
                                            21
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 2,
                                                "column": 8
                                            },
                                            "end": {
                                                "line": 2,
                                                "column": 11
                                            }
                                        },
                                        "name": "bar"
                                    },
                                    "right": {
                                        "type": "Literal",
                                        "range": [
                                            22,
                                            27
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 2,
                                                "column": 12
                                            },
                                            "end": {
                                                "line": 2,
                                                "column": 17
                                            }
                                        },
                                        "value": "baz",
                                        "raw": "'baz'"
                                    },
                                    "decorators": []
                                }
                            ]
                        },
                        "computed": false,
                        "static": false,
                        "kind": "method",
                        "accessibility": null,
                        "decorators": []
                    }
                ],
                "range": [
                    8,
                    38
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
            "value": "foo",
            "range": [
                14,
                17
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 4
                },
                "end": {
                    "line": 2,
                    "column": 7
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "(",
            "range": [
                17,
                18
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
        },
        {
            "type": "Identifier",
            "value": "bar",
            "range": [
                18,
                21
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 8
                },
                "end": {
                    "line": 2,
                    "column": 11
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "=",
            "range": [
                21,
                22
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 11
                },
                "end": {
                    "line": 2,
                    "column": 12
                }
            }
        },
        {
            "type": "String",
            "value": "'baz'",
            "range": [
                22,
                27
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 12
                },
                "end": {
                    "line": 2,
                    "column": 17
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ")",
            "range": [
                27,
                28
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
        },
        {
            "type": "Punctuator",
            "value": "{",
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
            "type": "Punctuator",
            "value": "}",
            "range": [
                35,
                36
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
                37,
                38
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
