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
        30
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
                29
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
                    28
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
                        28
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
                                26
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
                                        "column": 10
                                    }
                                },
                                "range": [
                                    10,
                                    16
                                ],
                                "name": "method"
                            },
                            "kind": "init",
                            "value": {
                                "type": "FunctionExpression",
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
                                    26
                                ],
                                "id": null,
                                "generator": false,
                                "expression": false,
                                "params": [],
                                "body": {
                                    "type": "BlockStatement",
                                    "loc": {
                                        "start": {
                                            "line": 2,
                                            "column": 13
                                        },
                                        "end": {
                                            "line": 3,
                                            "column": 5
                                        }
                                    },
                                    "range": [
                                        19,
                                        26
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
                29,
                30
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
            "value": "method",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 4
                },
                "end": {
                    "line": 2,
                    "column": 10
                }
            },
            "range": [
                10,
                16
            ]
        },
        {
            "type": "Punctuator",
            "value": "(",
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
            "value": ")",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 11
                },
                "end": {
                    "line": 2,
                    "column": 12
                }
            },
            "range": [
                17,
                18
            ]
        },
        {
            "type": "Punctuator",
            "value": "{",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 13
                },
                "end": {
                    "line": 2,
                    "column": 14
                }
            },
            "range": [
                19,
                20
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
                25,
                26
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
                27,
                28
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
                28,
                29
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
                29,
                30
            ]
        }
    ]
};