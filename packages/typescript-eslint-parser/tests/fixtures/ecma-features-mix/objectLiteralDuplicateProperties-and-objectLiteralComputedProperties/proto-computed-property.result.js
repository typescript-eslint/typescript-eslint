module.exports = {
    "type": "Program",
    "body": [
        {
            "type": "ExpressionStatement",
            "expression": {
                "type": "Literal",
                "value": "use strict",
                "raw": "\"use strict\"",
                "range": [
                    0,
                    12
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 0
                    },
                    "end": {
                        "line": 1,
                        "column": 12
                    }
                }
            },
            "range": [
                0,
                13
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 13
                }
            }
        },
        {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "proto",
                        "range": [
                            19,
                            24
                        ],
                        "loc": {
                            "start": {
                                "line": 3,
                                "column": 4
                            },
                            "end": {
                                "line": 3,
                                "column": 9
                            }
                        }
                    },
                    "init": {
                        "type": "ObjectExpression",
                        "properties": [],
                        "range": [
                            27,
                            29
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
                        }
                    },
                    "range": [
                        19,
                        29
                    ],
                    "loc": {
                        "start": {
                            "line": 3,
                            "column": 4
                        },
                        "end": {
                            "line": 3,
                            "column": 14
                        }
                    }
                }
            ],
            "kind": "var",
            "range": [
                15,
                30
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 0
                },
                "end": {
                    "line": 3,
                    "column": 15
                }
            }
        },
        {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "x",
                        "range": [
                            36,
                            37
                        ],
                        "loc": {
                            "start": {
                                "line": 5,
                                "column": 4
                            },
                            "end": {
                                "line": 5,
                                "column": 5
                            }
                        }
                    },
                    "init": {
                        "type": "ObjectExpression",
                        "properties": [
                            {
                                "type": "Property",
                                "key": {
                                    "type": "Literal",
                                    "value": "__proto__",
                                    "raw": "\"__proto__\"",
                                    "range": [
                                        44,
                                        55
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 6,
                                            "column": 2
                                        },
                                        "end": {
                                            "line": 6,
                                            "column": 13
                                        }
                                    }
                                },
                                "value": {
                                    "type": "Identifier",
                                    "name": "proto",
                                    "range": [
                                        58,
                                        63
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 6,
                                            "column": 16
                                        },
                                        "end": {
                                            "line": 6,
                                            "column": 21
                                        }
                                    }
                                },
                                "kind": "init",
                                "method": false,
                                "shorthand": false,
                                "computed": true,
                                "range": [
                                    43,
                                    63
                                ],
                                "loc": {
                                    "start": {
                                        "line": 6,
                                        "column": 1
                                    },
                                    "end": {
                                        "line": 6,
                                        "column": 21
                                    }
                                }
                            },
                            {
                                "type": "Property",
                                "key": {
                                    "type": "Literal",
                                    "value": "__proto__",
                                    "raw": "\"__proto__\"",
                                    "range": [
                                        67,
                                        78
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 7,
                                            "column": 2
                                        },
                                        "end": {
                                            "line": 7,
                                            "column": 13
                                        }
                                    }
                                },
                                "value": {
                                    "type": "Identifier",
                                    "name": "proto",
                                    "range": [
                                        81,
                                        86
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 7,
                                            "column": 16
                                        },
                                        "end": {
                                            "line": 7,
                                            "column": 21
                                        }
                                    }
                                },
                                "kind": "init",
                                "method": false,
                                "shorthand": false,
                                "computed": true,
                                "range": [
                                    66,
                                    86
                                ],
                                "loc": {
                                    "start": {
                                        "line": 7,
                                        "column": 1
                                    },
                                    "end": {
                                        "line": 7,
                                        "column": 21
                                    }
                                }
                            },
                            {
                                "type": "Property",
                                "key": {
                                    "type": "BinaryExpression",
                                    "operator": "+",
                                    "left": {
                                        "type": "BinaryExpression",
                                        "operator": "+",
                                        "left": {
                                            "type": "Literal",
                                            "value": "__",
                                            "raw": "\"__\"",
                                            "range": [
                                                90,
                                                94
                                            ],
                                            "loc": {
                                                "start": {
                                                    "line": 8,
                                                    "column": 2
                                                },
                                                "end": {
                                                    "line": 8,
                                                    "column": 6
                                                }
                                            }
                                        },
                                        "right": {
                                            "type": "Literal",
                                            "value": "proto",
                                            "raw": "\"proto\"",
                                            "range": [
                                                97,
                                                104
                                            ],
                                            "loc": {
                                                "start": {
                                                    "line": 8,
                                                    "column": 9
                                                },
                                                "end": {
                                                    "line": 8,
                                                    "column": 16
                                                }
                                            }
                                        },
                                        "range": [
                                            90,
                                            104
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 8,
                                                "column": 2
                                            },
                                            "end": {
                                                "line": 8,
                                                "column": 16
                                            }
                                        }
                                    },
                                    "right": {
                                        "type": "Literal",
                                        "value": "__",
                                        "raw": "\"__\"",
                                        "range": [
                                            107,
                                            111
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 8,
                                                "column": 19
                                            },
                                            "end": {
                                                "line": 8,
                                                "column": 23
                                            }
                                        }
                                    },
                                    "range": [
                                        90,
                                        111
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 8,
                                            "column": 2
                                        },
                                        "end": {
                                            "line": 8,
                                            "column": 23
                                        }
                                    }
                                },
                                "value": {
                                    "type": "Identifier",
                                    "name": "proto",
                                    "range": [
                                        114,
                                        119
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 8,
                                            "column": 26
                                        },
                                        "end": {
                                            "line": 8,
                                            "column": 31
                                        }
                                    }
                                },
                                "kind": "init",
                                "method": false,
                                "shorthand": false,
                                "computed": true,
                                "range": [
                                    89,
                                    119
                                ],
                                "loc": {
                                    "start": {
                                        "line": 8,
                                        "column": 1
                                    },
                                    "end": {
                                        "line": 8,
                                        "column": 31
                                    }
                                }
                            }
                        ],
                        "range": [
                            40,
                            121
                        ],
                        "loc": {
                            "start": {
                                "line": 5,
                                "column": 8
                            },
                            "end": {
                                "line": 9,
                                "column": 1
                            }
                        }
                    },
                    "range": [
                        36,
                        121
                    ],
                    "loc": {
                        "start": {
                            "line": 5,
                            "column": 4
                        },
                        "end": {
                            "line": 9,
                            "column": 1
                        }
                    }
                }
            ],
            "kind": "var",
            "range": [
                32,
                122
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 0
                },
                "end": {
                    "line": 9,
                    "column": 2
                }
            }
        }
    ],
    "sourceType": "script",
    "range": [
        0,
        122
    ],
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 9,
            "column": 2
        }
    },
    "tokens": [
        {
            "type": "String",
            "value": "\"use strict\"",
            "range": [
                0,
                12
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 12
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ";",
            "range": [
                12,
                13
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 12
                },
                "end": {
                    "line": 1,
                    "column": 13
                }
            }
        },
        {
            "type": "Keyword",
            "value": "var",
            "range": [
                15,
                18
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 0
                },
                "end": {
                    "line": 3,
                    "column": 3
                }
            }
        },
        {
            "type": "Identifier",
            "value": "proto",
            "range": [
                19,
                24
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 4
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
                25,
                26
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
            "type": "Punctuator",
            "value": "{",
            "range": [
                27,
                28
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
            "value": "}",
            "range": [
                28,
                29
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
            "value": ";",
            "range": [
                29,
                30
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
            "type": "Keyword",
            "value": "var",
            "range": [
                32,
                35
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 0
                },
                "end": {
                    "line": 5,
                    "column": 3
                }
            }
        },
        {
            "type": "Identifier",
            "value": "x",
            "range": [
                36,
                37
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 4
                },
                "end": {
                    "line": 5,
                    "column": 5
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "=",
            "range": [
                38,
                39
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 6
                },
                "end": {
                    "line": 5,
                    "column": 7
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                40,
                41
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 8
                },
                "end": {
                    "line": 5,
                    "column": 9
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "[",
            "range": [
                43,
                44
            ],
            "loc": {
                "start": {
                    "line": 6,
                    "column": 1
                },
                "end": {
                    "line": 6,
                    "column": 2
                }
            }
        },
        {
            "type": "String",
            "value": "\"__proto__\"",
            "range": [
                44,
                55
            ],
            "loc": {
                "start": {
                    "line": 6,
                    "column": 2
                },
                "end": {
                    "line": 6,
                    "column": 13
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "]",
            "range": [
                55,
                56
            ],
            "loc": {
                "start": {
                    "line": 6,
                    "column": 13
                },
                "end": {
                    "line": 6,
                    "column": 14
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
                    "line": 6,
                    "column": 14
                },
                "end": {
                    "line": 6,
                    "column": 15
                }
            }
        },
        {
            "type": "Identifier",
            "value": "proto",
            "range": [
                58,
                63
            ],
            "loc": {
                "start": {
                    "line": 6,
                    "column": 16
                },
                "end": {
                    "line": 6,
                    "column": 21
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ",",
            "range": [
                63,
                64
            ],
            "loc": {
                "start": {
                    "line": 6,
                    "column": 21
                },
                "end": {
                    "line": 6,
                    "column": 22
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "[",
            "range": [
                66,
                67
            ],
            "loc": {
                "start": {
                    "line": 7,
                    "column": 1
                },
                "end": {
                    "line": 7,
                    "column": 2
                }
            }
        },
        {
            "type": "String",
            "value": "\"__proto__\"",
            "range": [
                67,
                78
            ],
            "loc": {
                "start": {
                    "line": 7,
                    "column": 2
                },
                "end": {
                    "line": 7,
                    "column": 13
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "]",
            "range": [
                78,
                79
            ],
            "loc": {
                "start": {
                    "line": 7,
                    "column": 13
                },
                "end": {
                    "line": 7,
                    "column": 14
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ":",
            "range": [
                79,
                80
            ],
            "loc": {
                "start": {
                    "line": 7,
                    "column": 14
                },
                "end": {
                    "line": 7,
                    "column": 15
                }
            }
        },
        {
            "type": "Identifier",
            "value": "proto",
            "range": [
                81,
                86
            ],
            "loc": {
                "start": {
                    "line": 7,
                    "column": 16
                },
                "end": {
                    "line": 7,
                    "column": 21
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ",",
            "range": [
                86,
                87
            ],
            "loc": {
                "start": {
                    "line": 7,
                    "column": 21
                },
                "end": {
                    "line": 7,
                    "column": 22
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "[",
            "range": [
                89,
                90
            ],
            "loc": {
                "start": {
                    "line": 8,
                    "column": 1
                },
                "end": {
                    "line": 8,
                    "column": 2
                }
            }
        },
        {
            "type": "String",
            "value": "\"__\"",
            "range": [
                90,
                94
            ],
            "loc": {
                "start": {
                    "line": 8,
                    "column": 2
                },
                "end": {
                    "line": 8,
                    "column": 6
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "+",
            "range": [
                95,
                96
            ],
            "loc": {
                "start": {
                    "line": 8,
                    "column": 7
                },
                "end": {
                    "line": 8,
                    "column": 8
                }
            }
        },
        {
            "type": "String",
            "value": "\"proto\"",
            "range": [
                97,
                104
            ],
            "loc": {
                "start": {
                    "line": 8,
                    "column": 9
                },
                "end": {
                    "line": 8,
                    "column": 16
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "+",
            "range": [
                105,
                106
            ],
            "loc": {
                "start": {
                    "line": 8,
                    "column": 17
                },
                "end": {
                    "line": 8,
                    "column": 18
                }
            }
        },
        {
            "type": "String",
            "value": "\"__\"",
            "range": [
                107,
                111
            ],
            "loc": {
                "start": {
                    "line": 8,
                    "column": 19
                },
                "end": {
                    "line": 8,
                    "column": 23
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "]",
            "range": [
                111,
                112
            ],
            "loc": {
                "start": {
                    "line": 8,
                    "column": 23
                },
                "end": {
                    "line": 8,
                    "column": 24
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ":",
            "range": [
                112,
                113
            ],
            "loc": {
                "start": {
                    "line": 8,
                    "column": 24
                },
                "end": {
                    "line": 8,
                    "column": 25
                }
            }
        },
        {
            "type": "Identifier",
            "value": "proto",
            "range": [
                114,
                119
            ],
            "loc": {
                "start": {
                    "line": 8,
                    "column": 26
                },
                "end": {
                    "line": 8,
                    "column": 31
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                120,
                121
            ],
            "loc": {
                "start": {
                    "line": 9,
                    "column": 0
                },
                "end": {
                    "line": 9,
                    "column": 1
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ";",
            "range": [
                121,
                122
            ],
            "loc": {
                "start": {
                    "line": 9,
                    "column": 1
                },
                "end": {
                    "line": 9,
                    "column": 2
                }
            }
        }
    ]
};