module.exports = {
    "type": "Program",
    "range": [
        0,
        75
    ],
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
    "body": [
        {
            "type": "FunctionDeclaration",
            "range": [
                0,
                75
            ],
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
            "id": {
                "type": "Identifier",
                "range": [
                    9,
                    17
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 9
                    },
                    "end": {
                        "line": 1,
                        "column": 17
                    }
                },
                "name": "isString"
            },
            "generator": false,
            "expression": false,
            "async": false,
            "params": [
                {
                    "type": "Identifier",
                    "range": [
                        18,
                        19
                    ],
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 18
                        },
                        "end": {
                            "line": 1,
                            "column": 19
                        }
                    },
                    "name": "x",
                    "typeAnnotation": {
                        "type": "TypeAnnotation",
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 21
                            },
                            "end": {
                                "line": 1,
                                "column": 24
                            }
                        },
                        "range": [
                            21,
                            24
                        ],
                        "typeAnnotation": {
                            "type": "TSAnyKeyword",
                            "range": [
                                21,
                                24
                            ],
                            "loc": {
                                "start": {
                                    "line": 1,
                                    "column": 21
                                },
                                "end": {
                                    "line": 1,
                                    "column": 24
                                }
                            }
                        }
                    }
                }
            ],
            "body": {
                "type": "BlockStatement",
                "range": [
                    39,
                    75
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 39
                    },
                    "end": {
                        "line": 3,
                        "column": 1
                    }
                },
                "body": [
                    {
                        "type": "ReturnStatement",
                        "range": [
                            45,
                            73
                        ],
                        "loc": {
                            "start": {
                                "line": 2,
                                "column": 4
                            },
                            "end": {
                                "line": 2,
                                "column": 32
                            }
                        },
                        "argument": {
                            "type": "BinaryExpression",
                            "range": [
                                52,
                                73
                            ],
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 11
                                },
                                "end": {
                                    "line": 2,
                                    "column": 32
                                }
                            },
                            "operator": "===",
                            "left": {
                                "type": "UnaryExpression",
                                "range": [
                                    52,
                                    60
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
                                "operator": "typeof",
                                "prefix": true,
                                "argument": {
                                    "type": "Identifier",
                                    "range": [
                                        59,
                                        60
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
                                    },
                                    "name": "x"
                                }
                            },
                            "right": {
                                "type": "Literal",
                                "range": [
                                    65,
                                    73
                                ],
                                "loc": {
                                    "start": {
                                        "line": 2,
                                        "column": 24
                                    },
                                    "end": {
                                        "line": 2,
                                        "column": 32
                                    }
                                },
                                "value": "string",
                                "raw": "'string'"
                            }
                        }
                    }
                ]
            },
            "returnType": {
                "type": "TypeAnnotation",
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 27
                    },
                    "end": {
                        "line": 1,
                        "column": 38
                    }
                },
                "range": [
                    27,
                    38
                ],
                "typeAnnotation": {
                    "type": "TSTypePredicate",
                    "range": [
                        27,
                        38
                    ],
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 27
                        },
                        "end": {
                            "line": 1,
                            "column": 38
                        }
                    },
                    "parameterName": {
                        "type": "Identifier",
                        "range": [
                            27,
                            28
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 27
                            },
                            "end": {
                                "line": 1,
                                "column": 28
                            }
                        },
                        "name": "x"
                    },
                    "typeAnnotation": {
                        "type": "TypeAnnotation",
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 32
                            },
                            "end": {
                                "line": 1,
                                "column": 38
                            }
                        },
                        "range": [
                            32,
                            38
                        ],
                        "typeAnnotation": {
                            "type": "TSStringKeyword",
                            "range": [
                                32,
                                38
                            ],
                            "loc": {
                                "start": {
                                    "line": 1,
                                    "column": 32
                                },
                                "end": {
                                    "line": 1,
                                    "column": 38
                                }
                            }
                        }
                    }
                }
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
            "value": "isString",
            "range": [
                9,
                17
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 9
                },
                "end": {
                    "line": 1,
                    "column": 17
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
                    "line": 1,
                    "column": 17
                },
                "end": {
                    "line": 1,
                    "column": 18
                }
            }
        },
        {
            "type": "Identifier",
            "value": "x",
            "range": [
                18,
                19
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 18
                },
                "end": {
                    "line": 1,
                    "column": 19
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ":",
            "range": [
                19,
                20
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 19
                },
                "end": {
                    "line": 1,
                    "column": 20
                }
            }
        },
        {
            "type": "Identifier",
            "value": "any",
            "range": [
                21,
                24
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 21
                },
                "end": {
                    "line": 1,
                    "column": 24
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ")",
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
            "value": "x",
            "range": [
                27,
                28
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 27
                },
                "end": {
                    "line": 1,
                    "column": 28
                }
            }
        },
        {
            "type": "Identifier",
            "value": "is",
            "range": [
                29,
                31
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 29
                },
                "end": {
                    "line": 1,
                    "column": 31
                }
            }
        },
        {
            "type": "Identifier",
            "value": "string",
            "range": [
                32,
                38
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 32
                },
                "end": {
                    "line": 1,
                    "column": 38
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                39,
                40
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 39
                },
                "end": {
                    "line": 1,
                    "column": 40
                }
            }
        },
        {
            "type": "Keyword",
            "value": "return",
            "range": [
                45,
                51
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 4
                },
                "end": {
                    "line": 2,
                    "column": 10
                }
            }
        },
        {
            "type": "Keyword",
            "value": "typeof",
            "range": [
                52,
                58
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 11
                },
                "end": {
                    "line": 2,
                    "column": 17
                }
            }
        },
        {
            "type": "Identifier",
            "value": "x",
            "range": [
                59,
                60
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
            "value": "===",
            "range": [
                61,
                64
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 20
                },
                "end": {
                    "line": 2,
                    "column": 23
                }
            }
        },
        {
            "type": "String",
            "value": "'string'",
            "range": [
                65,
                73
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 24
                },
                "end": {
                    "line": 2,
                    "column": 32
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                74,
                75
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 0
                },
                "end": {
                    "line": 3,
                    "column": 1
                }
            }
        }
    ]
};