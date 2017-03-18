module.exports = {
    "type": "Program",
    "range": [
        0,
        82
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
            "type": "FunctionDeclaration",
            "range": [
                0,
                82
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
                    9,
                    22
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 9
                    },
                    "end": {
                        "line": 1,
                        "column": 22
                    }
                },
                "name": "processEntity"
            },
            "generator": false,
            "expression": false,
            "async": false,
            "params": [
                {
                    "type": "Identifier",
                    "range": [
                        23,
                        24
                    ],
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 23
                        },
                        "end": {
                            "line": 1,
                            "column": 24
                        }
                    },
                    "name": "e",
                    "optional": true,
                    "typeAnnotation": {
                        "type": "TypeAnnotation",
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 27
                            },
                            "end": {
                                "line": 1,
                                "column": 33
                            }
                        },
                        "range": [
                            27,
                            33
                        ],
                        "typeAnnotation": {
                            "type": "TSTypeReference",
                            "range": [
                                27,
                                33
                            ],
                            "loc": {
                                "start": {
                                    "line": 1,
                                    "column": 27
                                },
                                "end": {
                                    "line": 1,
                                    "column": 33
                                }
                            },
                            "typeName": {
                                "type": "Identifier",
                                "range": [
                                    27,
                                    33
                                ],
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 27
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 33
                                    }
                                },
                                "name": "Entity"
                            }
                        }
                    }
                }
            ],
            "body": {
                "type": "BlockStatement",
                "range": [
                    35,
                    82
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 35
                    },
                    "end": {
                        "line": 4,
                        "column": 1
                    }
                },
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "range": [
                            41,
                            59
                        ],
                        "loc": {
                            "start": {
                                "line": 2,
                                "column": 4
                            },
                            "end": {
                                "line": 2,
                                "column": 22
                            }
                        },
                        "expression": {
                            "type": "CallExpression",
                            "range": [
                                41,
                                58
                            ],
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 4
                                },
                                "end": {
                                    "line": 2,
                                    "column": 21
                                }
                            },
                            "callee": {
                                "type": "Identifier",
                                "range": [
                                    41,
                                    55
                                ],
                                "loc": {
                                    "start": {
                                        "line": 2,
                                        "column": 4
                                    },
                                    "end": {
                                        "line": 2,
                                        "column": 18
                                    }
                                },
                                "name": "validateEntity"
                            },
                            "arguments": [
                                {
                                    "type": "Identifier",
                                    "range": [
                                        56,
                                        57
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
                                    },
                                    "name": "e"
                                }
                            ]
                        }
                    },
                    {
                        "type": "VariableDeclaration",
                        "range": [
                            64,
                            80
                        ],
                        "loc": {
                            "start": {
                                "line": 3,
                                "column": 4
                            },
                            "end": {
                                "line": 3,
                                "column": 20
                            }
                        },
                        "declarations": [
                            {
                                "type": "VariableDeclarator",
                                "range": [
                                    68,
                                    79
                                ],
                                "loc": {
                                    "start": {
                                        "line": 3,
                                        "column": 8
                                    },
                                    "end": {
                                        "line": 3,
                                        "column": 19
                                    }
                                },
                                "id": {
                                    "type": "Identifier",
                                    "range": [
                                        68,
                                        69
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 3,
                                            "column": 8
                                        },
                                        "end": {
                                            "line": 3,
                                            "column": 9
                                        }
                                    },
                                    "name": "s"
                                },
                                "init": {
                                    "type": "MemberExpression",
                                    "range": [
                                        72,
                                        79
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 3,
                                            "column": 12
                                        },
                                        "end": {
                                            "line": 3,
                                            "column": 19
                                        }
                                    },
                                    "object": {
                                        "type": "TSNonNullExpression",
                                        "range": [
                                            72,
                                            74
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 3,
                                                "column": 12
                                            },
                                            "end": {
                                                "line": 3,
                                                "column": 14
                                            }
                                        },
                                        "expression": {
                                            "type": "Identifier",
                                            "range": [
                                                72,
                                                73
                                            ],
                                            "loc": {
                                                "start": {
                                                    "line": 3,
                                                    "column": 12
                                                },
                                                "end": {
                                                    "line": 3,
                                                    "column": 13
                                                }
                                            },
                                            "name": "e"
                                        }
                                    },
                                    "property": {
                                        "type": "Identifier",
                                        "range": [
                                            75,
                                            79
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 3,
                                                "column": 15
                                            },
                                            "end": {
                                                "line": 3,
                                                "column": 19
                                            }
                                        },
                                        "name": "name"
                                    },
                                    "computed": false
                                }
                            }
                        ],
                        "kind": "let"
                    }
                ]
            }
        }
    ],
    "sourceType": "script",
    "tokens": [
        {
            "type": "Keyword",
            "value": "function",
            "range": [
                0,
                8
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 8
                }
            }
        },
        {
            "type": "Identifier",
            "value": "processEntity",
            "range": [
                9,
                22
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 9
                },
                "end": {
                    "line": 1,
                    "column": 22
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "(",
            "range": [
                22,
                23
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 22
                },
                "end": {
                    "line": 1,
                    "column": 23
                }
            }
        },
        {
            "type": "Identifier",
            "value": "e",
            "range": [
                23,
                24
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 23
                },
                "end": {
                    "line": 1,
                    "column": 24
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "?",
            "range": [
                24,
                25
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 24
                },
                "end": {
                    "line": 1,
                    "column": 25
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ":",
            "range": [
                25,
                26
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 25
                },
                "end": {
                    "line": 1,
                    "column": 26
                }
            }
        },
        {
            "type": "Identifier",
            "value": "Entity",
            "range": [
                27,
                33
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 27
                },
                "end": {
                    "line": 1,
                    "column": 33
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ")",
            "range": [
                33,
                34
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 33
                },
                "end": {
                    "line": 1,
                    "column": 34
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                35,
                36
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 35
                },
                "end": {
                    "line": 1,
                    "column": 36
                }
            }
        },
        {
            "type": "Identifier",
            "value": "validateEntity",
            "range": [
                41,
                55
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 4
                },
                "end": {
                    "line": 2,
                    "column": 18
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "(",
            "range": [
                55,
                56
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
            "type": "Identifier",
            "value": "e",
            "range": [
                56,
                57
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
                57,
                58
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
            "value": ";",
            "range": [
                58,
                59
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 21
                },
                "end": {
                    "line": 2,
                    "column": 22
                }
            }
        },
        {
            "type": "Keyword",
            "value": "let",
            "range": [
                64,
                67
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 4
                },
                "end": {
                    "line": 3,
                    "column": 7
                }
            }
        },
        {
            "type": "Identifier",
            "value": "s",
            "range": [
                68,
                69
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 8
                },
                "end": {
                    "line": 3,
                    "column": 9
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "=",
            "range": [
                70,
                71
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 10
                },
                "end": {
                    "line": 3,
                    "column": 11
                }
            }
        },
        {
            "type": "Identifier",
            "value": "e",
            "range": [
                72,
                73
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 12
                },
                "end": {
                    "line": 3,
                    "column": 13
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "!",
            "range": [
                73,
                74
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 13
                },
                "end": {
                    "line": 3,
                    "column": 14
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ".",
            "range": [
                74,
                75
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 14
                },
                "end": {
                    "line": 3,
                    "column": 15
                }
            }
        },
        {
            "type": "Identifier",
            "value": "name",
            "range": [
                75,
                79
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 15
                },
                "end": {
                    "line": 3,
                    "column": 19
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ";",
            "range": [
                79,
                80
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 19
                },
                "end": {
                    "line": 3,
                    "column": 20
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                81,
                82
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
