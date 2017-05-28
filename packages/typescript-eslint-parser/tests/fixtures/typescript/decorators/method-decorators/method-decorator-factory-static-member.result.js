module.exports = {
    "type": "Program",
    "range": [
        0,
        56
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
            "type": "ClassDeclaration",
            "range": [
                0,
                56
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
                    6,
                    7
                ],
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
                "name": "C"
            },
            "body": {
                "type": "ClassBody",
                "body": [
                    {
                        "type": "MethodDefinition",
                        "range": [
                            14,
                            54
                        ],
                        "loc": {
                            "start": {
                                "line": 2,
                                "column": 4
                            },
                            "end": {
                                "line": 3,
                                "column": 28
                            }
                        },
                        "key": {
                            "type": "Identifier",
                            "range": [
                                37,
                                49
                            ],
                            "loc": {
                                "start": {
                                    "line": 3,
                                    "column": 11
                                },
                                "end": {
                                    "line": 3,
                                    "column": 23
                                }
                            },
                            "name": "staticMethod"
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
                                    52,
                                    54
                                ],
                                "loc": {
                                    "start": {
                                        "line": 3,
                                        "column": 26
                                    },
                                    "end": {
                                        "line": 3,
                                        "column": 28
                                    }
                                },
                                "body": []
                            },
                            "range": [
                                49,
                                54
                            ],
                            "loc": {
                                "start": {
                                    "line": 3,
                                    "column": 23
                                },
                                "end": {
                                    "line": 3,
                                    "column": 28
                                }
                            },
                            "params": []
                        },
                        "computed": false,
                        "static": true,
                        "kind": "method",
                        "accessibility": null,
                        "decorators": [
                            {
                                "type": "Decorator",
                                "range": [
                                    14,
                                    25
                                ],
                                "loc": {
                                    "start": {
                                        "line": 2,
                                        "column": 4
                                    },
                                    "end": {
                                        "line": 2,
                                        "column": 15
                                    }
                                },
                                "expression": {
                                    "type": "CallExpression",
                                    "range": [
                                        15,
                                        25
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 2,
                                            "column": 5
                                        },
                                        "end": {
                                            "line": 2,
                                            "column": 15
                                        }
                                    },
                                    "callee": {
                                        "type": "Identifier",
                                        "range": [
                                            15,
                                            18
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 2,
                                                "column": 5
                                            },
                                            "end": {
                                                "line": 2,
                                                "column": 8
                                            }
                                        },
                                        "name": "Foo"
                                    },
                                    "arguments": [
                                        {
                                            "type": "Literal",
                                            "range": [
                                                19,
                                                24
                                            ],
                                            "loc": {
                                                "start": {
                                                    "line": 2,
                                                    "column": 9
                                                },
                                                "end": {
                                                    "line": 2,
                                                    "column": 14
                                                }
                                            },
                                            "value": false,
                                            "raw": "false"
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ],
                "range": [
                    8,
                    56
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 8
                    },
                    "end": {
                        "line": 4,
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
            "value": "C",
            "range": [
                6,
                7
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 6
                },
                "end": {
                    "line": 1,
                    "column": 7
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                8,
                9
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 8
                },
                "end": {
                    "line": 1,
                    "column": 9
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "@",
            "range": [
                14,
                15
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 4
                },
                "end": {
                    "line": 2,
                    "column": 5
                }
            }
        },
        {
            "type": "Identifier",
            "value": "Foo",
            "range": [
                15,
                18
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 5
                },
                "end": {
                    "line": 2,
                    "column": 8
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "(",
            "range": [
                18,
                19
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 8
                },
                "end": {
                    "line": 2,
                    "column": 9
                }
            }
        },
        {
            "type": "Boolean",
            "value": "false",
            "range": [
                19,
                24
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 9
                },
                "end": {
                    "line": 2,
                    "column": 14
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
            "type": "Keyword",
            "value": "static",
            "range": [
                30,
                36
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 4
                },
                "end": {
                    "line": 3,
                    "column": 10
                }
            }
        },
        {
            "type": "Identifier",
            "value": "staticMethod",
            "range": [
                37,
                49
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 11
                },
                "end": {
                    "line": 3,
                    "column": 23
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "(",
            "range": [
                49,
                50
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 23
                },
                "end": {
                    "line": 3,
                    "column": 24
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ")",
            "range": [
                50,
                51
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
            "type": "Punctuator",
            "value": "{",
            "range": [
                52,
                53
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 26
                },
                "end": {
                    "line": 3,
                    "column": 27
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                53,
                54
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 27
                },
                "end": {
                    "line": 3,
                    "column": 28
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                55,
                56
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