module.exports = {
    "type": "Program",
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 4,
            "column": 3
        }
    },
    "range": [
        0,
        27
    ],
    "body": [
        {
            "type": "ExpressionStatement",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 4,
                    "column": 2
                }
            },
            "range": [
                0,
                26
            ],
            "expression": {
                "type": "AssignmentExpression",
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
                "range": [
                    0,
                    25
                ],
                "operator": "=",
                "left": {
                    "type": "Identifier",
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 0
                        },
                        "end": {
                            "line": 1,
                            "column": 1
                        }
                    },
                    "range": [
                        0,
                        1
                    ],
                    "name": "x"
                },
                "right": {
                    "type": "ObjectExpression",
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 4
                        },
                        "end": {
                            "line": 4,
                            "column": 1
                        }
                    },
                    "range": [
                        4,
                        25
                    ],
                    "properties": [
                        {
                            "type": "Property",
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 4
                                },
                                "end": {
                                    "line": 3,
                                    "column": 5
                                }
                            },
                            "range": [
                                10,
                                23
                            ],
                            "method": true,
                            "shorthand": false,
                            "computed": false,
                            "key": {
                                "type": "Identifier",
                                "loc": {
                                    "start": {
                                        "line": 2,
                                        "column": 4
                                    },
                                    "end": {
                                        "line": 2,
                                        "column": 7
                                    }
                                },
                                "range": [
                                    10,
                                    13
                                ],
                                "name": "get"
                            },
                            "kind": "init",
                            "value": {
                                "type": "FunctionExpression",
                                "loc": {
                                    "start": {
                                        "line": 2,
                                        "column": 7
                                    },
                                    "end": {
                                        "line": 3,
                                        "column": 5
                                    }
                                },
                                "range": [
                                    13,
                                    23
                                ],
                                "id": null,
                                "generator": false,
                                "expression": false,
                                "async": false,
                                "params": [],
                                "body": {
                                    "type": "BlockStatement",
                                    "loc": {
                                        "start": {
                                            "line": 2,
                                            "column": 10
                                        },
                                        "end": {
                                            "line": 3,
                                            "column": 5
                                        }
                                    },
                                    "range": [
                                        16,
                                        23
                                    ],
                                    "body": []
                                }
                            }
                        }
                    ]
                }
            }
        },
        {
            "type": "EmptyStatement",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 2
                },
                "end": {
                    "line": 4,
                    "column": 3
                }
            },
            "range": [
                26,
                27
            ]
        }
    ],
    "sourceType": "script",
    "tokens": [
        {
            "type": "Identifier",
            "value": "x",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 1
                }
            },
            "range": [
                0,
                1
            ]
        },
        {
            "type": "Punctuator",
            "value": "=",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 2
                },
                "end": {
                    "line": 1,
                    "column": 3
                }
            },
            "range": [
                2,
                3
            ]
        },
        {
            "type": "Punctuator",
            "value": "{",
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
            "type": "Identifier",
            "value": "get",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 4
                },
                "end": {
                    "line": 2,
                    "column": 7
                }
            },
            "range": [
                10,
                13
            ]
        },
        {
            "type": "Punctuator",
            "value": "(",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 7
                },
                "end": {
                    "line": 2,
                    "column": 8
                }
            },
            "range": [
                13,
                14
            ]
        },
        {
            "type": "Punctuator",
            "value": ")",
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
                14,
                15
            ]
        },
        {
            "type": "Punctuator",
            "value": "{",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 10
                },
                "end": {
                    "line": 2,
                    "column": 11
                }
            },
            "range": [
                16,
                17
            ]
        },
        {
            "type": "Punctuator",
            "value": "}",
            "loc": {
                "start": {
                    "line": 3,
                    "column": 4
                },
                "end": {
                    "line": 3,
                    "column": 5
                }
            },
            "range": [
                22,
                23
            ]
        },
        {
            "type": "Punctuator",
            "value": "}",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 0
                },
                "end": {
                    "line": 4,
                    "column": 1
                }
            },
            "range": [
                24,
                25
            ]
        },
        {
            "type": "Punctuator",
            "value": ";",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 1
                },
                "end": {
                    "line": 4,
                    "column": 2
                }
            },
            "range": [
                25,
                26
            ]
        },
        {
            "type": "Punctuator",
            "value": ";",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 2
                },
                "end": {
                    "line": 4,
                    "column": 3
                }
            },
            "range": [
                26,
                27
            ]
        }
    ]
};
