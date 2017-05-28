module.exports = {
    "type": "Program",
    "range": [
        0,
        110
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
                110
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
                    19
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 6
                    },
                    "end": {
                        "line": 1,
                        "column": 19
                    }
                },
                "name": "StaticGreeter"
            },
            "body": {
                "type": "ClassBody",
                "body": [
                    {
                        "type": "MethodDefinition",
                        "range": [
                            26,
                            108
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
                                33,
                                38
                            ],
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 11
                                },
                                "end": {
                                    "line": 2,
                                    "column": 16
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
                                    63,
                                    108
                                ],
                                "loc": {
                                    "start": {
                                        "line": 2,
                                        "column": 41
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
                                            73,
                                            102
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
                                                80,
                                                101
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
                                                    80,
                                                    95
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
                                                        80,
                                                        88
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
                                                        91,
                                                        95
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
                                                    98,
                                                    101
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
                                38,
                                108
                            ],
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 16
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
                                        49,
                                        53
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 2,
                                            "column": 27
                                        },
                                        "end": {
                                            "line": 2,
                                            "column": 31
                                        }
                                    },
                                    "name": "name",
                                    "typeAnnotation": {
                                        "type": "TypeAnnotation",
                                        "loc": {
                                            "start": {
                                                "line": 2,
                                                "column": 33
                                            },
                                            "end": {
                                                "line": 2,
                                                "column": 39
                                            }
                                        },
                                        "range": [
                                            55,
                                            61
                                        ],
                                        "typeAnnotation": {
                                            "type": "TSStringKeyword",
                                            "range": [
                                                55,
                                                61
                                            ],
                                            "loc": {
                                                "start": {
                                                    "line": 2,
                                                    "column": 33
                                                },
                                                "end": {
                                                    "line": 2,
                                                    "column": 39
                                                }
                                            }
                                        }
                                    },
                                    "decorators": [
                                        {
                                            "type": "Decorator",
                                            "range": [
                                                39,
                                                48
                                            ],
                                            "loc": {
                                                "start": {
                                                    "line": 2,
                                                    "column": 17
                                                },
                                                "end": {
                                                    "line": 2,
                                                    "column": 26
                                                }
                                            },
                                            "expression": {
                                                "type": "Identifier",
                                                "range": [
                                                    40,
                                                    48
                                                ],
                                                "loc": {
                                                    "start": {
                                                        "line": 2,
                                                        "column": 18
                                                    },
                                                    "end": {
                                                        "line": 2,
                                                        "column": 26
                                                    }
                                                },
                                                "name": "required"
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        "computed": false,
                        "static": true,
                        "kind": "method",
                        "accessibility": null,
                        "decorators": []
                    }
                ],
                "range": [
                    20,
                    110
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 20
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
            "value": "StaticGreeter",
            "range": [
                6,
                19
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 6
                },
                "end": {
                    "line": 1,
                    "column": 19
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                20,
                21
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 20
                },
                "end": {
                    "line": 1,
                    "column": 21
                }
            }
        },
        {
            "type": "Keyword",
            "value": "static",
            "range": [
                26,
                32
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
            "type": "Identifier",
            "value": "greet",
            "range": [
                33,
                38
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 11
                },
                "end": {
                    "line": 2,
                    "column": 16
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "(",
            "range": [
                38,
                39
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 16
                },
                "end": {
                    "line": 2,
                    "column": 17
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "@",
            "range": [
                39,
                40
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
            "type": "Identifier",
            "value": "required",
            "range": [
                40,
                48
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 18
                },
                "end": {
                    "line": 2,
                    "column": 26
                }
            }
        },
        {
            "type": "Identifier",
            "value": "name",
            "range": [
                49,
                53
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 27
                },
                "end": {
                    "line": 2,
                    "column": 31
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ":",
            "range": [
                53,
                54
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 31
                },
                "end": {
                    "line": 2,
                    "column": 32
                }
            }
        },
        {
            "type": "Identifier",
            "value": "string",
            "range": [
                55,
                61
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 33
                },
                "end": {
                    "line": 2,
                    "column": 39
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ")",
            "range": [
                61,
                62
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 39
                },
                "end": {
                    "line": 2,
                    "column": 40
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                63,
                64
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 41
                },
                "end": {
                    "line": 2,
                    "column": 42
                }
            }
        },
        {
            "type": "Keyword",
            "value": "return",
            "range": [
                73,
                79
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
                80,
                88
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
                89,
                90
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
                91,
                95
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
                96,
                97
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
                98,
                101
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
                101,
                102
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
                107,
                108
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
                109,
                110
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