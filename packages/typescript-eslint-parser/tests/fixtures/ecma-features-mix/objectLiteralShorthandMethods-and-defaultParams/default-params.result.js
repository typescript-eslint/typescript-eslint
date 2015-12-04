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
                        "name": "x",
                        "range": [
                            19,
                            20
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
                    "init": {
                        "type": "ObjectExpression",
                        "properties": [
                            {
                                "type": "Property",
                                "key": {
                                    "type": "Identifier",
                                    "name": "baz",
                                    "range": [
                                        26,
                                        29
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 4,
                                            "column": 1
                                        },
                                        "end": {
                                            "line": 4,
                                            "column": 4
                                        }
                                    }
                                },
                                "value": {
                                    "type": "FunctionExpression",
                                    "id": null,
                                    "params": [
                                        {
                                            "type": "AssignmentPattern",
                                            "left": {
                                                "type": "Identifier",
                                                "name": "a",
                                                "range": [
                                                    30,
                                                    31
                                                ],
                                                "loc": {
                                                    "start": {
                                                        "line": 4,
                                                        "column": 5
                                                    },
                                                    "end": {
                                                        "line": 4,
                                                        "column": 6
                                                    }
                                                }
                                            },
                                            "right": {
                                                "type": "Literal",
                                                "value": 10,
                                                "raw": "10",
                                                "range": [
                                                    34,
                                                    36
                                                ],
                                                "loc": {
                                                    "start": {
                                                        "line": 4,
                                                        "column": 9
                                                    },
                                                    "end": {
                                                        "line": 4,
                                                        "column": 11
                                                    }
                                                }
                                            },
                                            "range": [
                                                30,
                                                36
                                            ],
                                            "loc": {
                                                "start": {
                                                    "line": 4,
                                                    "column": 5
                                                },
                                                "end": {
                                                    "line": 4,
                                                    "column": 11
                                                }
                                            }
                                        }
                                    ],
                                    "body": {
                                        "type": "BlockStatement",
                                        "body": [],
                                        "range": [
                                            38,
                                            40
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 4,
                                                "column": 13
                                            },
                                            "end": {
                                                "line": 4,
                                                "column": 15
                                            }
                                        }
                                    },
                                    "generator": false,
                                    "expression": false,
                                    "range": [
                                        29,
                                        40
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 4,
                                            "column": 4
                                        },
                                        "end": {
                                            "line": 4,
                                            "column": 15
                                        }
                                    }
                                },
                                "kind": "init",
                                "method": true,
                                "shorthand": false,
                                "computed": false,
                                "range": [
                                    26,
                                    40
                                ],
                                "loc": {
                                    "start": {
                                        "line": 4,
                                        "column": 1
                                    },
                                    "end": {
                                        "line": 4,
                                        "column": 15
                                    }
                                }
                            },
                            {
                                "type": "Property",
                                "key": {
                                    "type": "Identifier",
                                    "name": "foo",
                                    "range": [
                                        43,
                                        46
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 5,
                                            "column": 1
                                        },
                                        "end": {
                                            "line": 5,
                                            "column": 4
                                        }
                                    }
                                },
                                "value": {
                                    "type": "FunctionExpression",
                                    "id": null,
                                    "params": [
                                        {
                                            "type": "Identifier",
                                            "name": "a",
                                            "range": [
                                                47,
                                                48
                                            ],
                                            "loc": {
                                                "start": {
                                                    "line": 5,
                                                    "column": 5
                                                },
                                                "end": {
                                                    "line": 5,
                                                    "column": 6
                                                }
                                            }
                                        },
                                        {
                                            "type": "AssignmentPattern",
                                            "left": {
                                                "type": "Identifier",
                                                "name": "b",
                                                "range": [
                                                    50,
                                                    51
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
                                            "right": {
                                                "type": "Literal",
                                                "value": 10,
                                                "raw": "10",
                                                "range": [
                                                    54,
                                                    56
                                                ],
                                                "loc": {
                                                    "start": {
                                                        "line": 5,
                                                        "column": 12
                                                    },
                                                    "end": {
                                                        "line": 5,
                                                        "column": 14
                                                    }
                                                }
                                            },
                                            "range": [
                                                50,
                                                56
                                            ],
                                            "loc": {
                                                "start": {
                                                    "line": 5,
                                                    "column": 8
                                                },
                                                "end": {
                                                    "line": 5,
                                                    "column": 14
                                                }
                                            }
                                        }
                                    ],
                                    "body": {
                                        "type": "BlockStatement",
                                        "body": [],
                                        "range": [
                                            58,
                                            60
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 5,
                                                "column": 16
                                            },
                                            "end": {
                                                "line": 5,
                                                "column": 18
                                            }
                                        }
                                    },
                                    "generator": false,
                                    "expression": false,
                                    "range": [
                                        46,
                                        60
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 5,
                                            "column": 4
                                        },
                                        "end": {
                                            "line": 5,
                                            "column": 18
                                        }
                                    }
                                },
                                "kind": "init",
                                "method": true,
                                "shorthand": false,
                                "computed": false,
                                "range": [
                                    43,
                                    60
                                ],
                                "loc": {
                                    "start": {
                                        "line": 5,
                                        "column": 1
                                    },
                                    "end": {
                                        "line": 5,
                                        "column": 18
                                    }
                                }
                            },
                            {
                                "type": "Property",
                                "key": {
                                    "type": "Identifier",
                                    "name": "toast",
                                    "range": [
                                        63,
                                        68
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 6,
                                            "column": 1
                                        },
                                        "end": {
                                            "line": 6,
                                            "column": 6
                                        }
                                    }
                                },
                                "value": {
                                    "type": "FunctionExpression",
                                    "id": null,
                                    "params": [
                                        {
                                            "type": "Identifier",
                                            "name": "a",
                                            "range": [
                                                69,
                                                70
                                            ],
                                            "loc": {
                                                "start": {
                                                    "line": 6,
                                                    "column": 7
                                                },
                                                "end": {
                                                    "line": 6,
                                                    "column": 8
                                                }
                                            }
                                        },
                                        {
                                            "type": "AssignmentPattern",
                                            "left": {
                                                "type": "Identifier",
                                                "name": "b",
                                                "range": [
                                                    72,
                                                    73
                                                ],
                                                "loc": {
                                                    "start": {
                                                        "line": 6,
                                                        "column": 10
                                                    },
                                                    "end": {
                                                        "line": 6,
                                                        "column": 11
                                                    }
                                                }
                                            },
                                            "right": {
                                                "type": "Literal",
                                                "value": 10,
                                                "raw": "10",
                                                "range": [
                                                    76,
                                                    78
                                                ],
                                                "loc": {
                                                    "start": {
                                                        "line": 6,
                                                        "column": 14
                                                    },
                                                    "end": {
                                                        "line": 6,
                                                        "column": 16
                                                    }
                                                }
                                            },
                                            "range": [
                                                72,
                                                78
                                            ],
                                            "loc": {
                                                "start": {
                                                    "line": 6,
                                                    "column": 10
                                                },
                                                "end": {
                                                    "line": 6,
                                                    "column": 16
                                                }
                                            }
                                        },
                                        {
                                            "type": "Identifier",
                                            "name": "c",
                                            "range": [
                                                80,
                                                81
                                            ],
                                            "loc": {
                                                "start": {
                                                    "line": 6,
                                                    "column": 18
                                                },
                                                "end": {
                                                    "line": 6,
                                                    "column": 19
                                                }
                                            }
                                        }
                                    ],
                                    "body": {
                                        "type": "BlockStatement",
                                        "body": [],
                                        "range": [
                                            83,
                                            85
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 6,
                                                "column": 21
                                            },
                                            "end": {
                                                "line": 6,
                                                "column": 23
                                            }
                                        }
                                    },
                                    "generator": false,
                                    "expression": false,
                                    "range": [
                                        68,
                                        85
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 6,
                                            "column": 6
                                        },
                                        "end": {
                                            "line": 6,
                                            "column": 23
                                        }
                                    }
                                },
                                "kind": "init",
                                "method": true,
                                "shorthand": false,
                                "computed": false,
                                "range": [
                                    63,
                                    85
                                ],
                                "loc": {
                                    "start": {
                                        "line": 6,
                                        "column": 1
                                    },
                                    "end": {
                                        "line": 6,
                                        "column": 23
                                    }
                                }
                            }
                        ],
                        "range": [
                            23,
                            87
                        ],
                        "loc": {
                            "start": {
                                "line": 3,
                                "column": 8
                            },
                            "end": {
                                "line": 7,
                                "column": 1
                            }
                        }
                    },
                    "range": [
                        19,
                        87
                    ],
                    "loc": {
                        "start": {
                            "line": 3,
                            "column": 4
                        },
                        "end": {
                            "line": 7,
                            "column": 1
                        }
                    }
                }
            ],
            "kind": "var",
            "range": [
                15,
                88
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 0
                },
                "end": {
                    "line": 7,
                    "column": 2
                }
            }
        }
    ],
    "sourceType": "script",
    "range": [
        0,
        88
    ],
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 7,
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
            "value": "x",
            "range": [
                19,
                20
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
            "value": "=",
            "range": [
                21,
                22
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 6
                },
                "end": {
                    "line": 3,
                    "column": 7
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                23,
                24
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
            "type": "Identifier",
            "value": "baz",
            "range": [
                26,
                29
            ],
            "loc": {
                "start": {
                    "line": 4,
                    "column": 1
                },
                "end": {
                    "line": 4,
                    "column": 4
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "(",
            "range": [
                29,
                30
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
            "type": "Identifier",
            "value": "a",
            "range": [
                30,
                31
            ],
            "loc": {
                "start": {
                    "line": 4,
                    "column": 5
                },
                "end": {
                    "line": 4,
                    "column": 6
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "=",
            "range": [
                32,
                33
            ],
            "loc": {
                "start": {
                    "line": 4,
                    "column": 7
                },
                "end": {
                    "line": 4,
                    "column": 8
                }
            }
        },
        {
            "type": "Numeric",
            "value": "10",
            "range": [
                34,
                36
            ],
            "loc": {
                "start": {
                    "line": 4,
                    "column": 9
                },
                "end": {
                    "line": 4,
                    "column": 11
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ")",
            "range": [
                36,
                37
            ],
            "loc": {
                "start": {
                    "line": 4,
                    "column": 11
                },
                "end": {
                    "line": 4,
                    "column": 12
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                38,
                39
            ],
            "loc": {
                "start": {
                    "line": 4,
                    "column": 13
                },
                "end": {
                    "line": 4,
                    "column": 14
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                39,
                40
            ],
            "loc": {
                "start": {
                    "line": 4,
                    "column": 14
                },
                "end": {
                    "line": 4,
                    "column": 15
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ",",
            "range": [
                40,
                41
            ],
            "loc": {
                "start": {
                    "line": 4,
                    "column": 15
                },
                "end": {
                    "line": 4,
                    "column": 16
                }
            }
        },
        {
            "type": "Identifier",
            "value": "foo",
            "range": [
                43,
                46
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 1
                },
                "end": {
                    "line": 5,
                    "column": 4
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "(",
            "range": [
                46,
                47
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
            "type": "Identifier",
            "value": "a",
            "range": [
                47,
                48
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 5
                },
                "end": {
                    "line": 5,
                    "column": 6
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ",",
            "range": [
                48,
                49
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
            "type": "Identifier",
            "value": "b",
            "range": [
                50,
                51
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
            "value": "=",
            "range": [
                52,
                53
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 10
                },
                "end": {
                    "line": 5,
                    "column": 11
                }
            }
        },
        {
            "type": "Numeric",
            "value": "10",
            "range": [
                54,
                56
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 12
                },
                "end": {
                    "line": 5,
                    "column": 14
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ")",
            "range": [
                56,
                57
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 14
                },
                "end": {
                    "line": 5,
                    "column": 15
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                58,
                59
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 16
                },
                "end": {
                    "line": 5,
                    "column": 17
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                59,
                60
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 17
                },
                "end": {
                    "line": 5,
                    "column": 18
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ",",
            "range": [
                60,
                61
            ],
            "loc": {
                "start": {
                    "line": 5,
                    "column": 18
                },
                "end": {
                    "line": 5,
                    "column": 19
                }
            }
        },
        {
            "type": "Identifier",
            "value": "toast",
            "range": [
                63,
                68
            ],
            "loc": {
                "start": {
                    "line": 6,
                    "column": 1
                },
                "end": {
                    "line": 6,
                    "column": 6
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "(",
            "range": [
                68,
                69
            ],
            "loc": {
                "start": {
                    "line": 6,
                    "column": 6
                },
                "end": {
                    "line": 6,
                    "column": 7
                }
            }
        },
        {
            "type": "Identifier",
            "value": "a",
            "range": [
                69,
                70
            ],
            "loc": {
                "start": {
                    "line": 6,
                    "column": 7
                },
                "end": {
                    "line": 6,
                    "column": 8
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ",",
            "range": [
                70,
                71
            ],
            "loc": {
                "start": {
                    "line": 6,
                    "column": 8
                },
                "end": {
                    "line": 6,
                    "column": 9
                }
            }
        },
        {
            "type": "Identifier",
            "value": "b",
            "range": [
                72,
                73
            ],
            "loc": {
                "start": {
                    "line": 6,
                    "column": 10
                },
                "end": {
                    "line": 6,
                    "column": 11
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "=",
            "range": [
                74,
                75
            ],
            "loc": {
                "start": {
                    "line": 6,
                    "column": 12
                },
                "end": {
                    "line": 6,
                    "column": 13
                }
            }
        },
        {
            "type": "Numeric",
            "value": "10",
            "range": [
                76,
                78
            ],
            "loc": {
                "start": {
                    "line": 6,
                    "column": 14
                },
                "end": {
                    "line": 6,
                    "column": 16
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ",",
            "range": [
                78,
                79
            ],
            "loc": {
                "start": {
                    "line": 6,
                    "column": 16
                },
                "end": {
                    "line": 6,
                    "column": 17
                }
            }
        },
        {
            "type": "Identifier",
            "value": "c",
            "range": [
                80,
                81
            ],
            "loc": {
                "start": {
                    "line": 6,
                    "column": 18
                },
                "end": {
                    "line": 6,
                    "column": 19
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ")",
            "range": [
                81,
                82
            ],
            "loc": {
                "start": {
                    "line": 6,
                    "column": 19
                },
                "end": {
                    "line": 6,
                    "column": 20
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                83,
                84
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
            "value": "}",
            "range": [
                84,
                85
            ],
            "loc": {
                "start": {
                    "line": 6,
                    "column": 22
                },
                "end": {
                    "line": 6,
                    "column": 23
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                86,
                87
            ],
            "loc": {
                "start": {
                    "line": 7,
                    "column": 0
                },
                "end": {
                    "line": 7,
                    "column": 1
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ";",
            "range": [
                87,
                88
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
        }
    ]
};