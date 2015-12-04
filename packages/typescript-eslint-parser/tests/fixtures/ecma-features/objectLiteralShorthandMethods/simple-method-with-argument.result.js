module.exports = {
    "type": "Program",
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 5,
            "column": 3
        }
    },
    "range": [
        0,
        35
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
                    "line": 5,
                    "column": 2
                }
            },
            "range": [
                0,
                34
            ],
            "expression": {
                "type": "AssignmentExpression",
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
                "range": [
                    0,
                    33
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
                            "line": 5,
                            "column": 1
                        }
                    },
                    "range": [
                        4,
                        33
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
                                    "line": 4,
                                    "column": 5
                                }
                            },
                            "range": [
                                10,
                                31
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
                                        "line": 4,
                                        "column": 5
                                    }
                                },
                                "range": [
                                    16,
                                    31
                                ],
                                "id": null,
                                "generator": false,
                                "expression": false,
                                "params": [
                                    {
                                        "type": "Identifier",
                                        "loc": {
                                            "start": {
                                                "line": 2,
                                                "column": 11
                                            },
                                            "end": {
                                                "line": 2,
                                                "column": 15
                                            }
                                        },
                                        "range": [
                                            17,
                                            21
                                        ],
                                        "name": "test"
                                    }
                                ],
                                "body": {
                                    "type": "BlockStatement",
                                    "loc": {
                                        "start": {
                                            "line": 2,
                                            "column": 17
                                        },
                                        "end": {
                                            "line": 4,
                                            "column": 5
                                        }
                                    },
                                    "range": [
                                        23,
                                        31
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
                    "line": 5,
                    "column": 2
                },
                "end": {
                    "line": 5,
                    "column": 3
                }
            },
            "range": [
                34,
                35
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
            "type": "Identifier",
            "value": "test",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 11
                },
                "end": {
                    "line": 2,
                    "column": 15
                }
            },
            "range": [
                17,
                21
            ]
        },
        {
            "type": "Punctuator",
            "value": ")",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 15
                },
                "end": {
                    "line": 2,
                    "column": 16
                }
            },
            "range": [
                21,
                22
            ]
        },
        {
            "type": "Punctuator",
            "value": "{",
            "loc": {
                "start": {
                    "line": 2,
                    "column": 17
                },
                "end": {
                    "line": 2,
                    "column": 18
                }
            },
            "range": [
                23,
                24
            ]
        },
        {
            "type": "Punctuator",
            "value": "}",
            "loc": {
                "start": {
                    "line": 4,
                    "column": 4
                },
                "end": {
                    "line": 4,
                    "column": 5
                }
            },
            "range": [
                30,
                31
            ]
        },
        {
            "type": "Punctuator",
            "value": "}",
            "loc": {
                "start": {
                    "line": 5,
                    "column": 0
                },
                "end": {
                    "line": 5,
                    "column": 1
                }
            },
            "range": [
                32,
                33
            ]
        },
        {
            "type": "Punctuator",
            "value": ";",
            "loc": {
                "start": {
                    "line": 5,
                    "column": 1
                },
                "end": {
                    "line": 5,
                    "column": 2
                }
            },
            "range": [
                33,
                34
            ]
        },
        {
            "type": "Punctuator",
            "value": ";",
            "loc": {
                "start": {
                    "line": 5,
                    "column": 2
                },
                "end": {
                    "line": 5,
                    "column": 3
                }
            },
            "range": [
                34,
                35
            ]
        }
    ]
};