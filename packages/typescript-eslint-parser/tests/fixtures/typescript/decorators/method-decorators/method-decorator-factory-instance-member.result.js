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
                "name": "B"
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
                                "column": 23
                            }
                        },
                        "key": {
                            "type": "Identifier",
                            "range": [
                                35,
                                49
                            ],
                            "loc": {
                                "start": {
                                    "line": 3,
                                    "column": 4
                                },
                                "end": {
                                    "line": 3,
                                    "column": 18
                                }
                            },
                            "name": "instanceMethod"
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
                                        "column": 21
                                    },
                                    "end": {
                                        "line": 3,
                                        "column": 23
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
                                    "column": 18
                                },
                                "end": {
                                    "line": 3,
                                    "column": 23
                                }
                            },
                            "params": []
                        },
                        "computed": false,
                        "static": false,
                        "kind": "method",
                        "accessibility": null,
                        "decorators": [
                            {
                                "type": "Decorator",
                                "range": [
                                    14,
                                    30
                                ],
                                "loc": {
                                    "start": {
                                        "line": 2,
                                        "column": 4
                                    },
                                    "end": {
                                        "line": 2,
                                        "column": 20
                                    }
                                },
                                "expression": {
                                    "type": "CallExpression",
                                    "range": [
                                        15,
                                        30
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 2,
                                            "column": 5
                                        },
                                        "end": {
                                            "line": 2,
                                            "column": 20
                                        }
                                    },
                                    "callee": {
                                        "type": "Identifier",
                                        "range": [
                                            15,
                                            23
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 2,
                                                "column": 5
                                            },
                                            "end": {
                                                "line": 2,
                                                "column": 13
                                            }
                                        },
                                        "name": "onlyRead"
                                    },
                                    "arguments": [
                                        {
                                            "type": "Literal",
                                            "range": [
                                                24,
                                                29
                                            ],
                                            "loc": {
                                                "start": {
                                                    "line": 2,
                                                    "column": 14
                                                },
                                                "end": {
                                                    "line": 2,
                                                    "column": 19
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
            "value": "B",
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
            "value": "onlyRead",
            "range": [
                15,
                23
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 5
                },
                "end": {
                    "line": 2,
                    "column": 13
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "(",
            "range": [
                23,
                24
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 13
                },
                "end": {
                    "line": 2,
                    "column": 14
                }
            }
        },
        {
            "type": "Boolean",
            "value": "false",
            "range": [
                24,
                29
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 14
                },
                "end": {
                    "line": 2,
                    "column": 19
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ")",
            "range": [
                29,
                30
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
            "type": "Identifier",
            "value": "instanceMethod",
            "range": [
                35,
                49
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 4
                },
                "end": {
                    "line": 3,
                    "column": 18
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
                    "column": 18
                },
                "end": {
                    "line": 3,
                    "column": 19
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
            "value": "{",
            "range": [
                52,
                53
            ],
            "loc": {
                "start": {
                    "line": 3,
                    "column": 21
                },
                "end": {
                    "line": 3,
                    "column": 22
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
                    "column": 22
                },
                "end": {
                    "line": 3,
                    "column": 23
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