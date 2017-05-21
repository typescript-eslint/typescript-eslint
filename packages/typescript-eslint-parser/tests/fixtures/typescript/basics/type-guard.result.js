module.exports = {
    "body": [{
        "async": false,
        "body": {
            "body": [{
                "argument": {
                    "left": {
                        "argument": {
                            "loc": {
                                "end": {
                                    "column": 19,
                                    "line": 2
                                },
                                "start": {
                                    "column": 18,
                                    "line": 2
                                }
                            },
                            "name": "x",
                            "range": [
                                59,
                                60
                            ],
                            "type": "Identifier"
                        },
                        "loc": {
                            "end": {
                                "column": 19,
                                "line": 2
                            },
                            "start": {
                                "column": 11,
                                "line": 2
                            }
                        },
                        "operator": "typeof",
                        "prefix": true,
                        "range": [
                            52,
                            60
                        ],
                        "type": "UnaryExpression"
                    },
                    "loc": {
                        "end": {
                            "column": 32,
                            "line": 2
                        },
                        "start": {
                            "column": 11,
                            "line": 2
                        }
                    },
                    "operator": "===",
                    "range": [
                        52,
                        73
                    ],
                    "right": {
                        "loc": {
                            "end": {
                                "column": 32,
                                "line": 2
                            },
                            "start": {
                                "column": 24,
                                "line": 2
                            }
                        },
                        "range": [
                            65,
                            73
                        ],
                        "raw": "'string'",
                        "type": "Literal",
                        "value": "string"
                    },
                    "type": "BinaryExpression"
                },
                "loc": {
                    "end": {
                        "column": 32,
                        "line": 2
                    },
                    "start": {
                        "column": 4,
                        "line": 2
                    }
                },
                "range": [
                    45,
                    73
                ],
                "type": "ReturnStatement"
            }],
            "loc": {
                "end": {
                    "column": 1,
                    "line": 3
                },
                "start": {
                    "column": 39,
                    "line": 1
                }
            },
            "range": [
                39,
                75
            ],
            "type": "BlockStatement"
        },
        "expression": false,
        "generator": false,
        "id": {
            "loc": {
                "end": {
                    "column": 17,
                    "line": 1
                },
                "start": {
                    "column": 9,
                    "line": 1
                }
            },
            "name": "isString",
            "range": [
                9,
                17
            ],
            "type": "Identifier"
        },
        "loc": {
            "end": {
                "column": 1,
                "line": 3
            },
            "start": {
                "column": 0,
                "line": 1
            }
        },
        "params": [{
            "loc": {
                "end": {
                    "column": 19,
                    "line": 1
                },
                "start": {
                    "column": 18,
                    "line": 1
                }
            },
            "name": "x",
            "range": [
                18,
                19
            ],
            "type": "Identifier",
            "typeAnnotation": {
                "loc": {
                    "end": {
                        "column": 24,
                        "line": 1
                    },
                    "start": {
                        "column": 21,
                        "line": 1
                    }
                },
                "range": [
                    21,
                    24
                ],
                "type": "TypeAnnotation",
                "typeAnnotation": {
                    "loc": {
                        "end": {
                            "column": 24,
                            "line": 1
                        },
                        "start": {
                            "column": 21,
                            "line": 1
                        }
                    },
                    "range": [
                        21,
                        24
                    ],
                    "type": "TSAnyKeyword"
                }
            }
        }],
        "range": [
            0,
            75
        ],
        "returnType": {
            "loc": {
                "end": {
                    "column": 38,
                    "line": 1
                },
                "start": {
                    "column": 27,
                    "line": 1
                }
            },
            "range": [
                27,
                38
            ],
            "type": "TypeAnnotation",
            "typeAnnotation": {
                "loc": {
                    "end": {
                        "column": 38,
                        "line": 1
                    },
                    "start": {
                        "column": 27,
                        "line": 1
                    }
                },
                "parameterName": {
                    "loc": {
                        "end": {
                            "column": 28,
                            "line": 1
                        },
                        "start": {
                            "column": 27,
                            "line": 1
                        }
                    },
                    "name": "x",
                    "range": [
                        27,
                        28
                    ],
                    "type": "Identifier"
                },
                "range": [
                    27,
                    38
                ],
                "type": "TSTypePredicate",
                "typeAnnotation": {
                    "loc": {
                        "end": {
                            "column": 38,
                            "line": 1
                        },
                        "start": {
                            "column": 32,
                            "line": 1
                        }
                    },
                    "range": [
                        32,
                        38
                    ],
                    "type": "TypeAnnotation",
                    "typeAnnotation": {
                        "loc": {
                            "end": {
                                "column": 38,
                                "line": 1
                            },
                            "start": {
                                "column": 32,
                                "line": 1
                            }
                        },
                        "range": [
                            32,
                            38
                        ],
                        "type": "TSStringKeyword"
                    }
                }
            }
        },
        "type": "FunctionDeclaration"
    }],
    "loc": {
        "end": {
            "column": 1,
            "line": 3
        },
        "start": {
            "column": 0,
            "line": 1
        }
    },
    "range": [
        0,
        75
    ],
    "sourceType": "script",
    "tokens": [{
        "loc": {
            "end": {
                "column": 8,
                "line": 1
            },
            "start": {
                "column": 0,
                "line": 1
            }
        },
        "range": [
            0,
            8
        ],
        "type": "Keyword",
        "value": "function"
    },
    {
        "loc": {
            "end": {
                "column": 17,
                "line": 1
            },
            "start": {
                "column": 9,
                "line": 1
            }
        },
        "range": [
            9,
            17
        ],
        "type": "Identifier",
        "value": "isString"
    },
    {
        "loc": {
            "end": {
                "column": 18,
                "line": 1
            },
            "start": {
                "column": 17,
                "line": 1
            }
        },
        "range": [
            17,
            18
        ],
        "type": "Punctuator",
        "value": "("
    },
    {
        "loc": {
            "end": {
                "column": 19,
                "line": 1
            },
            "start": {
                "column": 18,
                "line": 1
            }
        },
        "range": [
            18,
            19
        ],
        "type": "Identifier",
        "value": "x"
    },
    {
        "loc": {
            "end": {
                "column": 20,
                "line": 1
            },
            "start": {
                "column": 19,
                "line": 1
            }
        },
        "range": [
            19,
            20
        ],
        "type": "Punctuator",
        "value": ":"
    },
    {
        "loc": {
            "end": {
                "column": 24,
                "line": 1
            },
            "start": {
                "column": 21,
                "line": 1
            }
        },
        "range": [
            21,
            24
        ],
        "type": "Identifier",
        "value": "any"
    },
    {
        "loc": {
            "end": {
                "column": 25,
                "line": 1
            },
            "start": {
                "column": 24,
                "line": 1
            }
        },
        "range": [
            24,
            25
        ],
        "type": "Punctuator",
        "value": ")"
    },
    {
        "loc": {
            "end": {
                "column": 26,
                "line": 1
            },
            "start": {
                "column": 25,
                "line": 1
            }
        },
        "range": [
            25,
            26
        ],
        "type": "Punctuator",
        "value": ":"
    },
    {
        "loc": {
            "end": {
                "column": 28,
                "line": 1
            },
            "start": {
                "column": 27,
                "line": 1
            }
        },
        "range": [
            27,
            28
        ],
        "type": "Identifier",
        "value": "x"
    },
    {
        "loc": {
            "end": {
                "column": 31,
                "line": 1
            },
            "start": {
                "column": 29,
                "line": 1
            }
        },
        "range": [
            29,
            31
        ],
        "type": "Identifier",
        "value": "is"
    },
    {
        "loc": {
            "end": {
                "column": 38,
                "line": 1
            },
            "start": {
                "column": 32,
                "line": 1
            }
        },
        "range": [
            32,
            38
        ],
        "type": "Identifier",
        "value": "string"
    },
    {
        "loc": {
            "end": {
                "column": 40,
                "line": 1
            },
            "start": {
                "column": 39,
                "line": 1
            }
        },
        "range": [
            39,
            40
        ],
        "type": "Punctuator",
        "value": "{"
    },
    {
        "loc": {
            "end": {
                "column": 10,
                "line": 2
            },
            "start": {
                "column": 4,
                "line": 2
            }
        },
        "range": [
            45,
            51
        ],
        "type": "Keyword",
        "value": "return"
    },
    {
        "loc": {
            "end": {
                "column": 17,
                "line": 2
            },
            "start": {
                "column": 11,
                "line": 2
            }
        },
        "range": [
            52,
            58
        ],
        "type": "Keyword",
        "value": "typeof"
    },
    {
        "loc": {
            "end": {
                "column": 19,
                "line": 2
            },
            "start": {
                "column": 18,
                "line": 2
            }
        },
        "range": [
            59,
            60
        ],
        "type": "Identifier",
        "value": "x"
    },
    {
        "loc": {
            "end": {
                "column": 23,
                "line": 2
            },
            "start": {
                "column": 20,
                "line": 2
            }
        },
        "range": [
            61,
            64
        ],
        "type": "Punctuator",
        "value": "==="
    },
    {
        "loc": {
            "end": {
                "column": 32,
                "line": 2
            },
            "start": {
                "column": 24,
                "line": 2
            }
        },
        "range": [
            65,
            73
        ],
        "type": "String",
        "value": "'string'"
    },
    {
        "loc": {
            "end": {
                "column": 1,
                "line": 3
            },
            "start": {
                "column": 0,
                "line": 3
            }
        },
        "range": [
            74,
            75
        ],
        "type": "Punctuator",
        "value": "}"
    }
    ],
    "type": "Program"
};
