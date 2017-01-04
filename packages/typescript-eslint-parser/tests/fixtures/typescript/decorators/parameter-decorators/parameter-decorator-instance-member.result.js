module.exports = {
    "type": "Program",
    "range": [
        0,
        97
    ],
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 5,
            "column": 1
        }
    },
    "body": [
        {
            "type": "ClassDeclaration",
            "range": [
                0,
                97
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 5,
                    "column": 1
                }
            },
            "id": {
                "type": "Identifier",
                "range": [
                    6,
                    13
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 6
                    },
                    "end": {
                        "line": 1,
                        "column": 13
                    }
                },
                "name": "Greeter"
            },
            "body": {
                "type": "ClassBody",
                "body": [
                    {
                        "type": "MethodDefinition",
                        "range": [
                            20,
                            95
                        ],
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
                        "key": {
                            "type": "Identifier",
                            "range": [
                                20,
                                25
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
                            },
                            "name": "greet"
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
                                    50,
                                    95
                                ],
                                "loc": {
                                    "start": {
                                        "line": 2,
                                        "column": 34
                                    },
                                    "end": {
                                        "line": 4,
                                        "column": 5
                                    }
                                },
                                "body": [
                                    {
                                        "type": "ReturnStatement",
                                        "range": [
                                            60,
                                            89
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 3,
                                                "column": 8
                                            },
                                            "end": {
                                                "line": 3,
                                                "column": 37
                                            }
                                        },
                                        "argument": {
                                            "type": "BinaryExpression",
                                            "range": [
                                                67,
                                                88
                                            ],
                                            "loc": {
                                                "start": {
                                                    "line": 3,
                                                    "column": 15
                                                },
                                                "end": {
                                                    "line": 3,
                                                    "column": 36
                                                }
                                            },
                                            "operator": "+",
                                            "left": {
                                                "type": "BinaryExpression",
                                                "range": [
                                                    67,
                                                    82
                                                ],
                                                "loc": {
                                                    "start": {
                                                        "line": 3,
                                                        "column": 15
                                                    },
                                                    "end": {
                                                        "line": 3,
                                                        "column": 30
                                                    }
                                                },
                                                "operator": "+",
                                                "left": {
                                                    "type": "Literal",
                                                    "range": [
                                                        67,
                                                        75
                                                    ],
                                                    "loc": {
                                                        "start": {
                                                            "line": 3,
                                                            "column": 15
                                                        },
                                                        "end": {
                                                            "line": 3,
                                                            "column": 23
                                                        }
                                                    },
                                                    "value": "Hello ",
                                                    "raw": "\"Hello \""
                                                },
                                                "right": {
                                                    "type": "Identifier",
                                                    "range": [
                                                        78,
                                                        82
                                                    ],
                                                    "loc": {
                                                        "start": {
                                                            "line": 3,
                                                            "column": 26
                                                        },
                                                        "end": {
                                                            "line": 3,
                                                            "column": 30
                                                        }
                                                    },
                                                    "name": "name"
                                                }
                                            },
                                            "right": {
                                                "type": "Literal",
                                                "range": [
                                                    85,
                                                    88
                                                ],
                                                "loc": {
                                                    "start": {
                                                        "line": 3,
                                                        "column": 33
                                                    },
                                                    "end": {
                                                        "line": 3,
                                                        "column": 36
                                                    }
                                                },
                                                "value": "!",
                                                "raw": "\"!\""
                                            }
                                        }
                                    }
                                ]
                            },
                            "range": [
                                25,
                                95
                            ],
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
                            "params": [
                                {
                                    "type": "Identifier",
                                    "range": [
                                        36,
                                        40
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 2,
                                            "column": 20
                                        },
                                        "end": {
                                            "line": 2,
                                            "column": 24
                                        }
                                    },
                                    "name": "name",
                                    "typeAnnotation": {
                                        "type": "TypeAnnotation",
                                        "loc": {
                                            "start": {
                                                "line": 2,
                                                "column": 26
                                            },
                                            "end": {
                                                "line": 2,
                                                "column": 32
                                            }
                                        },
                                        "range": [
                                            42,
                                            48
                                        ],
                                        "typeAnnotation": {
                                            "type": "TSStringKeyword",
                                            "range": [
                                                42,
                                                48
                                            ],
                                            "loc": {
                                                "start": {
                                                    "line": 2,
                                                    "column": 26
                                                },
                                                "end": {
                                                    "line": 2,
                                                    "column": 32
                                                }
                                            }
                                        }
                                    },
                                    "decorators": [
                                        {
                                            "type": "Identifier",
                                            "range": [
                                                27,
                                                35
                                            ],
                                            "loc": {
                                                "start": {
                                                    "line": 2,
                                                    "column": 11
                                                },
                                                "end": {
                                                    "line": 2,
                                                    "column": 19
                                                }
                                            },
                                            "name": "required"
                                        }
                                    ]
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
                    14,
                    97
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 14
                    },
                    "end": {
                        "line": 5,
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
            "value": "Greeter",
            "range": [
                6,
                13
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 6
                },
                "end": {
                    "line": 1,
                    "column": 13
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                14,
                15
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 14
                },
                "end": {
                    "line": 1,
                    "column": 15
                }
            }
        },
        {
            "type": "Identifier",
            "value": "greet",
            "range": [
                20,
                25
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
            "type": "Punctuator",
            "value": "(",
            "range": [
                25,
                26
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
            "type": "Punctuator",
            "value": "@",
            "range": [
                26,
                27
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 10
                },
                "end": {
                    "line": 2,
                    "column": 11
                }
            }
        },
        {
            "type": "Identifier",
            "value": "required",
            "range": [
                27,
                35
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 11
                },
                "end": {
                    "line": 2,
                    "column": 19
                }
            }
        },
        {
            "type": "Identifier",
            "value": "name",
            "range": [
                36,
                40
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 20
                },
                "end": {
                    "line": 2,
                    "column": 24
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ":",
            "range": [
                40,
                41
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 24
                },
                "end": {
                    "line": 2,
                    "column": 25
                }
            }
        },
        {
            "type": "Identifier",
            "value": "string",
            "range": [
                42,
                48
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 26
                },
                "end": {
                    "line": 2,
                    "column": 32
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ")",
            "range": [
                48,
                49
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 32
                },
                "end": {
                    "line": 2,
                    "column": 33
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                50,
                51
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 34
                },
                "end": {
                    "line": 2,
                    "column": 35
                }
            }
        },
        {
            "type": "Keyword",
            "value": "return",
            "range": [
                60,
                66
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 8
                },
                "end": {
                    "line": 3,
                    "column": 14
                }
            }
        },
        {
            "type": "String",
            "value": "\"Hello \"",
            "range": [
                67,
                75
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 15
                },
                "end": {
                    "line": 3,
                    "column": 23
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "+",
            "range": [
                76,
                77
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
            "type": "Identifier",
            "value": "name",
            "range": [
                78,
                82
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 26
                },
                "end": {
                    "line": 3,
                    "column": 30
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "+",
            "range": [
                83,
                84
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 31
                },
                "end": {
                    "line": 3,
                    "column": 32
                }
            }
        },
        {
            "type": "String",
            "value": "\"!\"",
            "range": [
                85,
                88
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 33
                },
                "end": {
                    "line": 3,
                    "column": 36
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ";",
            "range": [
                88,
                89
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 36
                },
                "end": {
                    "line": 3,
                    "column": 37
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                94,
                95
            ],
            "loc": {
                "start": {
                    "line": 4,
                    "column": 4
                },
                "end": {
                    "line": 4,
                    "column": 5
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                96,
                97
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 0
                },
                "end": {
                    "line": 5,
                    "column": 1
                }
            }
        }
    ]
};
