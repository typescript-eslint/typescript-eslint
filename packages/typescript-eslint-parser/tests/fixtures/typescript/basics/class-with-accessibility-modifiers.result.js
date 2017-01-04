module.exports = {
    "type": "Program",
    "range": [
        0,
        173
    ],
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 10,
            "column": 1
        }
    },
    "body": [
        {
            "type": "ClassDeclaration",
            "range": [
                0,
                173
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 10,
                    "column": 1
                }
            },
            "id": {
                "type": "Identifier",
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
                },
                "name": "Foo"
            },
            "body": {
                "type": "ClassBody",
                "body": [
                    {
                        "type": "ClassProperty",
                        "range": [
                            14,
                            35
                        ],
                        "loc": {
                            "start": {
                                "line": 2,
                                "column": 2
                            },
                            "end": {
                                "line": 2,
                                "column": 23
                            }
                        },
                        "key": {
                            "type": "Identifier",
                            "range": [
                                22,
                                25
                            ],
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 10
                                },
                                "end": {
                                    "line": 2,
                                    "column": 13
                                }
                            },
                            "name": "bar"
                        },
                        "value": null,
                        "computed": false,
                        "static": false,
                        "accessibility": "private",
                        "decorators": []
                    },
                    {
                        "type": "ClassProperty",
                        "range": [
                            38,
                            65
                        ],
                        "loc": {
                            "start": {
                                "line": 3,
                                "column": 2
                            },
                            "end": {
                                "line": 3,
                                "column": 29
                            }
                        },
                        "key": {
                            "type": "Identifier",
                            "range": [
                                52,
                                55
                            ],
                            "loc": {
                                "start": {
                                    "line": 3,
                                    "column": 16
                                },
                                "end": {
                                    "line": 3,
                                    "column": 19
                                }
                            },
                            "name": "baz"
                        },
                        "value": null,
                        "computed": false,
                        "static": true,
                        "accessibility": "public",
                        "decorators": []
                    },
                    {
                        "type": "MethodDefinition",
                        "range": [
                            68,
                            111
                        ],
                        "loc": {
                            "start": {
                                "line": 4,
                                "column": 2
                            },
                            "end": {
                                "line": 6,
                                "column": 3
                            }
                        },
                        "key": {
                            "type": "Identifier",
                            "range": [
                                75,
                                81
                            ],
                            "loc": {
                                "start": {
                                    "line": 4,
                                    "column": 9
                                },
                                "end": {
                                    "line": 4,
                                    "column": 15
                                }
                            },
                            "name": "getBar"
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
                                    85,
                                    111
                                ],
                                "loc": {
                                    "start": {
                                        "line": 4,
                                        "column": 19
                                    },
                                    "end": {
                                        "line": 6,
                                        "column": 3
                                    }
                                },
                                "body": [
                                    {
                                        "type": "ReturnStatement",
                                        "range": [
                                            91,
                                            107
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 5,
                                                "column": 4
                                            },
                                            "end": {
                                                "line": 5,
                                                "column": 20
                                            }
                                        },
                                        "argument": {
                                            "type": "MemberExpression",
                                            "range": [
                                                98,
                                                106
                                            ],
                                            "loc": {
                                                "start": {
                                                    "line": 5,
                                                    "column": 11
                                                },
                                                "end": {
                                                    "line": 5,
                                                    "column": 19
                                                }
                                            },
                                            "object": {
                                                "type": "ThisExpression",
                                                "range": [
                                                    98,
                                                    102
                                                ],
                                                "loc": {
                                                    "start": {
                                                        "line": 5,
                                                        "column": 11
                                                    },
                                                    "end": {
                                                        "line": 5,
                                                        "column": 15
                                                    }
                                                }
                                            },
                                            "property": {
                                                "type": "Identifier",
                                                "range": [
                                                    103,
                                                    106
                                                ],
                                                "loc": {
                                                    "start": {
                                                        "line": 5,
                                                        "column": 16
                                                    },
                                                    "end": {
                                                        "line": 5,
                                                        "column": 19
                                                    }
                                                },
                                                "name": "bar"
                                            },
                                            "computed": false
                                        }
                                    }
                                ]
                            },
                            "range": [
                                82,
                                111
                            ],
                            "loc": {
                                "start": {
                                    "line": 4,
                                    "column": 15
                                },
                                "end": {
                                    "line": 6,
                                    "column": 3
                                }
                            },
                            "params": []
                        },
                        "computed": false,
                        "static": false,
                        "kind": "method",
                        "accessibility": "public",
                        "decorators": []
                    },
                    {
                        "type": "MethodDefinition",
                        "range": [
                            114,
                            171
                        ],
                        "loc": {
                            "start": {
                                "line": 7,
                                "column": 2
                            },
                            "end": {
                                "line": 9,
                                "column": 3
                            }
                        },
                        "key": {
                            "type": "Identifier",
                            "range": [
                                124,
                                130
                            ],
                            "loc": {
                                "start": {
                                    "line": 7,
                                    "column": 12
                                },
                                "end": {
                                    "line": 7,
                                    "column": 18
                                }
                            },
                            "name": "setBar"
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
                                    146,
                                    171
                                ],
                                "loc": {
                                    "start": {
                                        "line": 7,
                                        "column": 34
                                    },
                                    "end": {
                                        "line": 9,
                                        "column": 3
                                    }
                                },
                                "body": [
                                    {
                                        "type": "ExpressionStatement",
                                        "range": [
                                            152,
                                            167
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 8,
                                                "column": 4
                                            },
                                            "end": {
                                                "line": 8,
                                                "column": 19
                                            }
                                        },
                                        "expression": {
                                            "type": "AssignmentExpression",
                                            "range": [
                                                152,
                                                166
                                            ],
                                            "loc": {
                                                "start": {
                                                    "line": 8,
                                                    "column": 4
                                                },
                                                "end": {
                                                    "line": 8,
                                                    "column": 18
                                                }
                                            },
                                            "operator": "=",
                                            "left": {
                                                "type": "MemberExpression",
                                                "range": [
                                                    152,
                                                    160
                                                ],
                                                "loc": {
                                                    "start": {
                                                        "line": 8,
                                                        "column": 4
                                                    },
                                                    "end": {
                                                        "line": 8,
                                                        "column": 12
                                                    }
                                                },
                                                "object": {
                                                    "type": "ThisExpression",
                                                    "range": [
                                                        152,
                                                        156
                                                    ],
                                                    "loc": {
                                                        "start": {
                                                            "line": 8,
                                                            "column": 4
                                                        },
                                                        "end": {
                                                            "line": 8,
                                                            "column": 8
                                                        }
                                                    }
                                                },
                                                "property": {
                                                    "type": "Identifier",
                                                    "range": [
                                                        157,
                                                        160
                                                    ],
                                                    "loc": {
                                                        "start": {
                                                            "line": 8,
                                                            "column": 9
                                                        },
                                                        "end": {
                                                            "line": 8,
                                                            "column": 12
                                                        }
                                                    },
                                                    "name": "bar"
                                                },
                                                "computed": false
                                            },
                                            "right": {
                                                "type": "Identifier",
                                                "range": [
                                                    163,
                                                    166
                                                ],
                                                "loc": {
                                                    "start": {
                                                        "line": 8,
                                                        "column": 15
                                                    },
                                                    "end": {
                                                        "line": 8,
                                                        "column": 18
                                                    }
                                                },
                                                "name": "bar"
                                            }
                                        }
                                    }
                                ]
                            },
                            "range": [
                                131,
                                171
                            ],
                            "loc": {
                                "start": {
                                    "line": 7,
                                    "column": 18
                                },
                                "end": {
                                    "line": 9,
                                    "column": 3
                                }
                            },
                            "params": [
                                {
                                    "type": "Identifier",
                                    "range": [
                                        132,
                                        135
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 7,
                                            "column": 20
                                        },
                                        "end": {
                                            "line": 7,
                                            "column": 23
                                        }
                                    },
                                    "name": "bar",
                                    "typeAnnotation": {
                                        "type": "TypeAnnotation",
                                        "loc": {
                                            "start": {
                                                "line": 7,
                                                "column": 26
                                            },
                                            "end": {
                                                "line": 7,
                                                "column": 32
                                            }
                                        },
                                        "range": [
                                            138,
                                            144
                                        ],
                                        "typeAnnotation": {
                                            "type": "TSStringKeyword",
                                            "range": [
                                                138,
                                                144
                                            ],
                                            "loc": {
                                                "start": {
                                                    "line": 7,
                                                    "column": 26
                                                },
                                                "end": {
                                                    "line": 7,
                                                    "column": 32
                                                }
                                            }
                                        }
                                    },
                                    "decorators": []
                                }
                            ]
                        },
                        "computed": false,
                        "static": false,
                        "kind": "method",
                        "accessibility": "protected",
                        "decorators": []
                    }
                ],
                "range": [
                    10,
                    173
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 10
                    },
                    "end": {
                        "line": 10,
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
            "value": "private",
            "range": [
                14,
                21
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 2
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
                22,
                25
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 10
                },
                "end": {
                    "line": 2,
                    "column": 13
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ":",
            "range": [
                26,
                27
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 14
                },
                "end": {
                    "line": 2,
                    "column": 15
                }
            }
        },
        {
            "type": "Identifier",
            "value": "string",
            "range": [
                28,
                34
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 16
                },
                "end": {
                    "line": 2,
                    "column": 22
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ";",
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
            "type": "Keyword",
            "value": "public",
            "range": [
                38,
                44
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 2
                },
                "end": {
                    "line": 3,
                    "column": 8
                }
            }
        },
        {
            "type": "Keyword",
            "value": "static",
            "range": [
                45,
                51
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 9
                },
                "end": {
                    "line": 3,
                    "column": 15
                }
            }
        },
        {
            "type": "Identifier",
            "value": "baz",
            "range": [
                52,
                55
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 16
                },
                "end": {
                    "line": 3,
                    "column": 19
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ":",
            "range": [
                56,
                57
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 20
                },
                "end": {
                    "line": 3,
                    "column": 21
                }
            }
        },
        {
            "type": "Identifier",
            "value": "number",
            "range": [
                58,
                64
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 22
                },
                "end": {
                    "line": 3,
                    "column": 28
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ";",
            "range": [
                64,
                65
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 28
                },
                "end": {
                    "line": 3,
                    "column": 29
                }
            }
        },
        {
            "type": "Keyword",
            "value": "public",
            "range": [
                68,
                74
            ],
            "loc": {
                "start": {
                    "line": 4,
                    "column": 2
                },
                "end": {
                    "line": 4,
                    "column": 8
                }
            }
        },
        {
            "type": "Identifier",
            "value": "getBar",
            "range": [
                75,
                81
            ],
            "loc": {
                "start": {
                    "line": 4,
                    "column": 9
                },
                "end": {
                    "line": 4,
                    "column": 15
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "(",
            "range": [
                82,
                83
            ],
            "loc": {
                "start": {
                    "line": 4,
                    "column": 16
                },
                "end": {
                    "line": 4,
                    "column": 17
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ")",
            "range": [
                83,
                84
            ],
            "loc": {
                "start": {
                    "line": 4,
                    "column": 17
                },
                "end": {
                    "line": 4,
                    "column": 18
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                85,
                86
            ],
            "loc": {
                "start": {
                    "line": 4,
                    "column": 19
                },
                "end": {
                    "line": 4,
                    "column": 20
                }
            }
        },
        {
            "type": "Keyword",
            "value": "return",
            "range": [
                91,
                97
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 4
                },
                "end": {
                    "line": 5,
                    "column": 10
                }
            }
        },
        {
            "type": "Keyword",
            "value": "this",
            "range": [
                98,
                102
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 11
                },
                "end": {
                    "line": 5,
                    "column": 15
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ".",
            "range": [
                102,
                103
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 15
                },
                "end": {
                    "line": 5,
                    "column": 16
                }
            }
        },
        {
            "type": "Identifier",
            "value": "bar",
            "range": [
                103,
                106
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 16
                },
                "end": {
                    "line": 5,
                    "column": 19
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ";",
            "range": [
                106,
                107
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 19
                },
                "end": {
                    "line": 5,
                    "column": 20
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                110,
                111
            ],
            "loc": {
                "start": {
                    "line": 6,
                    "column": 2
                },
                "end": {
                    "line": 6,
                    "column": 3
                }
            }
        },
        {
            "type": "Keyword",
            "value": "protected",
            "range": [
                114,
                123
            ],
            "loc": {
                "start": {
                    "line": 7,
                    "column": 2
                },
                "end": {
                    "line": 7,
                    "column": 11
                }
            }
        },
        {
            "type": "Identifier",
            "value": "setBar",
            "range": [
                124,
                130
            ],
            "loc": {
                "start": {
                    "line": 7,
                    "column": 12
                },
                "end": {
                    "line": 7,
                    "column": 18
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "(",
            "range": [
                131,
                132
            ],
            "loc": {
                "start": {
                    "line": 7,
                    "column": 19
                },
                "end": {
                    "line": 7,
                    "column": 20
                }
            }
        },
        {
            "type": "Identifier",
            "value": "bar",
            "range": [
                132,
                135
            ],
            "loc": {
                "start": {
                    "line": 7,
                    "column": 20
                },
                "end": {
                    "line": 7,
                    "column": 23
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ":",
            "range": [
                136,
                137
            ],
            "loc": {
                "start": {
                    "line": 7,
                    "column": 24
                },
                "end": {
                    "line": 7,
                    "column": 25
                }
            }
        },
        {
            "type": "Identifier",
            "value": "string",
            "range": [
                138,
                144
            ],
            "loc": {
                "start": {
                    "line": 7,
                    "column": 26
                },
                "end": {
                    "line": 7,
                    "column": 32
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ")",
            "range": [
                144,
                145
            ],
            "loc": {
                "start": {
                    "line": 7,
                    "column": 32
                },
                "end": {
                    "line": 7,
                    "column": 33
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                146,
                147
            ],
            "loc": {
                "start": {
                    "line": 7,
                    "column": 34
                },
                "end": {
                    "line": 7,
                    "column": 35
                }
            }
        },
        {
            "type": "Keyword",
            "value": "this",
            "range": [
                152,
                156
            ],
            "loc": {
                "start": {
                    "line": 8,
                    "column": 4
                },
                "end": {
                    "line": 8,
                    "column": 8
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ".",
            "range": [
                156,
                157
            ],
            "loc": {
                "start": {
                    "line": 8,
                    "column": 8
                },
                "end": {
                    "line": 8,
                    "column": 9
                }
            }
        },
        {
            "type": "Identifier",
            "value": "bar",
            "range": [
                157,
                160
            ],
            "loc": {
                "start": {
                    "line": 8,
                    "column": 9
                },
                "end": {
                    "line": 8,
                    "column": 12
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "=",
            "range": [
                161,
                162
            ],
            "loc": {
                "start": {
                    "line": 8,
                    "column": 13
                },
                "end": {
                    "line": 8,
                    "column": 14
                }
            }
        },
        {
            "type": "Identifier",
            "value": "bar",
            "range": [
                163,
                166
            ],
            "loc": {
                "start": {
                    "line": 8,
                    "column": 15
                },
                "end": {
                    "line": 8,
                    "column": 18
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ";",
            "range": [
                166,
                167
            ],
            "loc": {
                "start": {
                    "line": 8,
                    "column": 18
                },
                "end": {
                    "line": 8,
                    "column": 19
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                170,
                171
            ],
            "loc": {
                "start": {
                    "line": 9,
                    "column": 2
                },
                "end": {
                    "line": 9,
                    "column": 3
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                172,
                173
            ],
            "loc": {
                "start": {
                    "line": 10,
                    "column": 0
                },
                "end": {
                    "line": 10,
                    "column": 1
                }
            }
        }
    ]
};
