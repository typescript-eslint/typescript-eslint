module.exports = {
    "type": "Program",
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 4,
            "column": 31
        }
    },
    "range": [
        0,
        59
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
                    "line": 1,
                    "column": 10
                }
            },
            "range": [
                0,
                10
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
                            "line": 1,
                            "column": 9
                        }
                    },
                    "range": [
                        4,
                        9
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
                        "name": "a"
                    },
                    "init": {
                        "type": "Literal",
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
                        ],
                        "value": 5,
                        "raw": "5"
                    }
                }
            ],
            "kind": "var"
        },
        {
            "type": "VariableDeclaration",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 0
                },
                "end": {
                    "line": 2,
                    "column": 15
                }
            },
            "range": [
                11,
                26
            ],
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "loc": {
                        "start": {
                            "line": 2,
                            "column": 4
                        },
                        "end": {
                            "line": 2,
                            "column": 14
                        }
                    },
                    "range": [
                        15,
                        25
                    ],
                    "id": {
                        "type": "Identifier",
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
                            15,
                            16
                        ],
                        "name": "b"
                    },
                    "init": {
                        "type": "Literal",
                        "loc": {
                            "start": {
                                "line": 2,
                                "column": 8
                            },
                            "end": {
                                "line": 2,
                                "column": 14
                            }
                        },
                        "range": [
                            19,
                            25
                        ],
                        "value": "Fred",
                        "raw": "'Fred'"
                    }
                }
            ],
            "kind": "var"
        },
        {
            "type": "ExpressionStatement",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 0
                },
                "end": {
                    "line": 4,
                    "column": 31
                }
            },
            "range": [
                28,
                59
            ],
            "expression": {
                "type": "TemplateLiteral",
                "loc": {
                    "start": {
                        "line": 4,
                        "column": 0
                    },
                    "end": {
                        "line": 4,
                        "column": 30
                    }
                },
                "range": [
                    28,
                    58
                ],
                "expressions": [
                    {
                        "type": "Identifier",
                        "loc": {
                            "start": {
                                "line": 4,
                                "column": 9
                            },
                            "end": {
                                "line": 4,
                                "column": 10
                            }
                        },
                        "range": [
                            37,
                            38
                        ],
                        "name": "b"
                    },
                    {
                        "type": "BinaryExpression",
                        "loc": {
                            "start": {
                                "line": 4,
                                "column": 23
                            },
                            "end": {
                                "line": 4,
                                "column": 28
                            }
                        },
                        "range": [
                            51,
                            56
                        ],
                        "left": {
                            "type": "Identifier",
                            "loc": {
                                "start": {
                                    "line": 4,
                                    "column": 23
                                },
                                "end": {
                                    "line": 4,
                                    "column": 24
                                }
                            },
                            "range": [
                                51,
                                52
                            ],
                            "name": "a"
                        },
                        "operator": "+",
                        "right": {
                            "type": "Literal",
                            "loc": {
                                "start": {
                                    "line": 4,
                                    "column": 27
                                },
                                "end": {
                                    "line": 4,
                                    "column": 28
                                }
                            },
                            "range": [
                                55,
                                56
                            ],
                            "value": 5,
                            "raw": "5"
                        }
                    }
                ],
                "quasis": [
                    {
                        "type": "TemplateElement",
                        "loc": {
                            "start": {
                                "line": 4,
                                "column": 0
                            },
                            "end": {
                                "line": 4,
                                "column": 9
                            }
                        },
                        "range": [
                            28,
                            37
                        ],
                        "value": {
                            "raw": "Hello ",
                            "cooked": "Hello "
                        },
                        "tail": false
                    },
                    {
                        "type": "TemplateElement",
                        "loc": {
                            "start": {
                                "line": 4,
                                "column": 10
                            },
                            "end": {
                                "line": 4,
                                "column": 23
                            }
                        },
                        "range": [
                            38,
                            51
                        ],
                        "value": {
                            "raw": ". a + 5 = ",
                            "cooked": ". a + 5 = "
                        },
                        "tail": false
                    },
                    {
                        "type": "TemplateElement",
                        "loc": {
                            "start": {
                                "line": 4,
                                "column": 28
                            },
                            "end": {
                                "line": 4,
                                "column": 30
                            }
                        },
                        "range": [
                            56,
                            58
                        ],
                        "value": {
                            "raw": "",
                            "cooked": ""
                        },
                        "tail": true
                    }
                ]
            }
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
            "value": "a",
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
            "type": "Numeric",
            "value": "5",
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
            "value": ";",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 9
                },
                "end": {
                    "line": 1,
                    "column": 10
                }
            },
            "range": [
                9,
                10
            ]
        },
        {
            "type": "Keyword",
            "value": "var",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 0
                },
                "end": {
                    "line": 2,
                    "column": 3
                }
            },
            "range": [
                11,
                14
            ]
        },
        {
            "type": "Identifier",
            "value": "b",
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
                15,
                16
            ]
        },
        {
            "type": "Punctuator",
            "value": "=",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 6
                },
                "end": {
                    "line": 2,
                    "column": 7
                }
            },
            "range": [
                17,
                18
            ]
        },
        {
            "type": "String",
            "value": "'Fred'",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 8
                },
                "end": {
                    "line": 2,
                    "column": 14
                }
            },
            "range": [
                19,
                25
            ]
        },
        {
            "type": "Punctuator",
            "value": ";",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 14
                },
                "end": {
                    "line": 2,
                    "column": 15
                }
            },
            "range": [
                25,
                26
            ]
        },
        {
            "type": "Template",
            "value": "`Hello ${",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 0
                },
                "end": {
                    "line": 4,
                    "column": 9
                }
            },
            "range": [
                28,
                37
            ]
        },
        {
            "type": "Identifier",
            "value": "b",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 9
                },
                "end": {
                    "line": 4,
                    "column": 10
                }
            },
            "range": [
                37,
                38
            ]
        },
        {
            "type": "Template",
            "value": "}. a + 5 = ${",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 10
                },
                "end": {
                    "line": 4,
                    "column": 23
                }
            },
            "range": [
                38,
                51
            ]
        },
        {
            "type": "Identifier",
            "value": "a",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 23
                },
                "end": {
                    "line": 4,
                    "column": 24
                }
            },
            "range": [
                51,
                52
            ]
        },
        {
            "type": "Punctuator",
            "value": "+",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 25
                },
                "end": {
                    "line": 4,
                    "column": 26
                }
            },
            "range": [
                53,
                54
            ]
        },
        {
            "type": "Numeric",
            "value": "5",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 27
                },
                "end": {
                    "line": 4,
                    "column": 28
                }
            },
            "range": [
                55,
                56
            ]
        },
        {
            "type": "Template",
            "value": "}`",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 28
                },
                "end": {
                    "line": 4,
                    "column": 30
                }
            },
            "range": [
                56,
                58
            ]
        },
        {
            "type": "Punctuator",
            "value": ";",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 30
                },
                "end": {
                    "line": 4,
                    "column": 31
                }
            },
            "range": [
                58,
                59
            ]
        }
    ]
};