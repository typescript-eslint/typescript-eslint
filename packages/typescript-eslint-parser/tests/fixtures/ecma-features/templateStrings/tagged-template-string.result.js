module.exports = {
    "type": "Program",
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 4,
            "column": 32
        }
    },
    "range": [
        0,
        76
    ],
    "body": [
        {
            "type": "FunctionDeclaration",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 3,
                    "column": 1
                }
            },
            "range": [
                0,
                43
            ],
            "id": {
                "type": "Identifier",
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 9
                    },
                    "end": {
                        "line": 1,
                        "column": 12
                    }
                },
                "range": [
                    9,
                    12
                ],
                "name": "tag"
            },
            "generator": false,
            "expression": false,
            "params": [],
            "body": {
                "type": "BlockStatement",
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 15
                    },
                    "end": {
                        "line": 3,
                        "column": 1
                    }
                },
                "range": [
                    15,
                    43
                ],
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "loc": {
                            "start": {
                                "line": 2,
                                "column": 1
                            },
                            "end": {
                                "line": 2,
                                "column": 24
                            }
                        },
                        "range": [
                            18,
                            41
                        ],
                        "expression": {
                            "type": "CallExpression",
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 1
                                },
                                "end": {
                                    "line": 2,
                                    "column": 23
                                }
                            },
                            "range": [
                                18,
                                40
                            ],
                            "callee": {
                                "type": "MemberExpression",
                                "loc": {
                                    "start": {
                                        "line": 2,
                                        "column": 1
                                    },
                                    "end": {
                                        "line": 2,
                                        "column": 12
                                    }
                                },
                                "range": [
                                    18,
                                    29
                                ],
                                "object": {
                                    "type": "Identifier",
                                    "loc": {
                                        "start": {
                                            "line": 2,
                                            "column": 1
                                        },
                                        "end": {
                                            "line": 2,
                                            "column": 8
                                        }
                                    },
                                    "range": [
                                        18,
                                        25
                                    ],
                                    "name": "console"
                                },
                                "property": {
                                    "type": "Identifier",
                                    "loc": {
                                        "start": {
                                            "line": 2,
                                            "column": 9
                                        },
                                        "end": {
                                            "line": 2,
                                            "column": 12
                                        }
                                    },
                                    "range": [
                                        26,
                                        29
                                    ],
                                    "name": "log"
                                },
                                "computed": false
                            },
                            "arguments": [
                                {
                                    "type": "Identifier",
                                    "loc": {
                                        "start": {
                                            "line": 2,
                                            "column": 13
                                        },
                                        "end": {
                                            "line": 2,
                                            "column": 22
                                        }
                                    },
                                    "range": [
                                        30,
                                        39
                                    ],
                                    "name": "arguments"
                                }
                            ]
                        }
                    }
                ]
            }
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
                    "column": 32
                }
            },
            "range": [
                44,
                76
            ],
            "expression": {
                "type": "TaggedTemplateExpression",
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
                    44,
                    75
                ],
                "tag": {
                    "type": "Identifier",
                    "loc": {
                        "start": {
                            "line": 4,
                            "column": 0
                        },
                        "end": {
                            "line": 4,
                            "column": 3
                        }
                    },
                    "range": [
                        44,
                        47
                    ],
                    "name": "tag"
                },
                "quasi": {
                    "type": "TemplateLiteral",
                    "loc": {
                        "start": {
                            "line": 4,
                            "column": 3
                        },
                        "end": {
                            "line": 4,
                            "column": 31
                        }
                    },
                    "range": [
                        47,
                        75
                    ],
                    "expressions": [
                        {
                            "type": "Identifier",
                            "loc": {
                                "start": {
                                    "line": 4,
                                    "column": 11
                                },
                                "end": {
                                    "line": 4,
                                    "column": 12
                                }
                            },
                            "range": [
                                55,
                                56
                            ],
                            "name": "a"
                        },
                        {
                            "type": "Identifier",
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
                                71,
                                72
                            ],
                            "name": "b"
                        }
                    ],
                    "quasis": [
                        {
                            "type": "TemplateElement",
                            "loc": {
                                "start": {
                                    "line": 4,
                                    "column": 3
                                },
                                "end": {
                                    "line": 4,
                                    "column": 11
                                }
                            },
                            "range": [
                                47,
                                55
                            ],
                            "value": {
                                "raw": "a is ",
                                "cooked": "a is "
                            },
                            "tail": false
                        },
                        {
                            "type": "TemplateElement",
                            "loc": {
                                "start": {
                                    "line": 4,
                                    "column": 12
                                },
                                "end": {
                                    "line": 4,
                                    "column": 27
                                }
                            },
                            "range": [
                                56,
                                71
                            ],
                            "value": {
                                "raw": " while b is ",
                                "cooked": " while b is "
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
                                    "column": 31
                                }
                            },
                            "range": [
                                72,
                                75
                            ],
                            "value": {
                                "raw": ".",
                                "cooked": "."
                            },
                            "tail": true
                        }
                    ]
                }
            }
        }
    ],
    "sourceType": "script",
    "tokens": [
        {
            "type": "Keyword",
            "value": "function",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 8
                }
            },
            "range": [
                0,
                8
            ]
        },
        {
            "type": "Identifier",
            "value": "tag",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 9
                },
                "end": {
                    "line": 1,
                    "column": 12
                }
            },
            "range": [
                9,
                12
            ]
        },
        {
            "type": "Punctuator",
            "value": "(",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 12
                },
                "end": {
                    "line": 1,
                    "column": 13
                }
            },
            "range": [
                12,
                13
            ]
        },
        {
            "type": "Punctuator",
            "value": ")",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 13
                },
                "end": {
                    "line": 1,
                    "column": 14
                }
            },
            "range": [
                13,
                14
            ]
        },
        {
            "type": "Punctuator",
            "value": "{",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 15
                },
                "end": {
                    "line": 1,
                    "column": 16
                }
            },
            "range": [
                15,
                16
            ]
        },
        {
            "type": "Identifier",
            "value": "console",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 1
                },
                "end": {
                    "line": 2,
                    "column": 8
                }
            },
            "range": [
                18,
                25
            ]
        },
        {
            "type": "Punctuator",
            "value": ".",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 8
                },
                "end": {
                    "line": 2,
                    "column": 9
                }
            },
            "range": [
                25,
                26
            ]
        },
        {
            "type": "Identifier",
            "value": "log",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 9
                },
                "end": {
                    "line": 2,
                    "column": 12
                }
            },
            "range": [
                26,
                29
            ]
        },
        {
            "type": "Punctuator",
            "value": "(",
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
                29,
                30
            ]
        },
        {
            "type": "Identifier",
            "value": "arguments",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 13
                },
                "end": {
                    "line": 2,
                    "column": 22
                }
            },
            "range": [
                30,
                39
            ]
        },
        {
            "type": "Punctuator",
            "value": ")",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 22
                },
                "end": {
                    "line": 2,
                    "column": 23
                }
            },
            "range": [
                39,
                40
            ]
        },
        {
            "type": "Punctuator",
            "value": ";",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 23
                },
                "end": {
                    "line": 2,
                    "column": 24
                }
            },
            "range": [
                40,
                41
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
                42,
                43
            ]
        },
        {
            "type": "Identifier",
            "value": "tag",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 0
                },
                "end": {
                    "line": 4,
                    "column": 3
                }
            },
            "range": [
                44,
                47
            ]
        },
        {
            "type": "Template",
            "value": "`a is ${",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 3
                },
                "end": {
                    "line": 4,
                    "column": 11
                }
            },
            "range": [
                47,
                55
            ]
        },
        {
            "type": "Identifier",
            "value": "a",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 11
                },
                "end": {
                    "line": 4,
                    "column": 12
                }
            },
            "range": [
                55,
                56
            ]
        },
        {
            "type": "Template",
            "value": "} while b is ${",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 12
                },
                "end": {
                    "line": 4,
                    "column": 27
                }
            },
            "range": [
                56,
                71
            ]
        },
        {
            "type": "Identifier",
            "value": "b",
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
                71,
                72
            ]
        },
        {
            "type": "Template",
            "value": "}.`",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 28
                },
                "end": {
                    "line": 4,
                    "column": 31
                }
            },
            "range": [
                72,
                75
            ]
        },
        {
            "type": "Punctuator",
            "value": ";",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 31
                },
                "end": {
                    "line": 4,
                    "column": 32
                }
            },
            "range": [
                75,
                76
            ]
        }
    ]
};