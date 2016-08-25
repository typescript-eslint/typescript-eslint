module.exports = {
    "type": "Program",
    "range": [
        0,
        52
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
            "type": "ClassDeclaration",
            "decorators": [],
            "range": [
                0,
                52
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
                    6,
                    9
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 6
                    },
                    "end": {
                        "line": 1,
                        "column": 9
                    }
                },
                "name": "Foo"
            },
            "body": {
                "type": "ClassBody",
                "body": [
                    {
                        "type": "MethodDefinition",
                        "range": [
                            16,
                            50
                        ],
                        "loc": {
                            "start": {
                                "line": 2,
                                "column": 4
                            },
                            "end": {
                                "line": 2,
                                "column": 38
                            }
                        },
                        "key": {
                            "type": "Identifier",
                            "range": [
                                16,
                                19
                            ],
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
                            "name": "bar"
                        },
                        "value": {
                            "type": "FunctionExpression",
                            "id": null,
                            "params": [
                                {
                                    "type": "Identifier",
                                    "range": [
                                        35,
                                        38
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 2,
                                            "column": 23
                                        },
                                        "end": {
                                            "line": 2,
                                            "column": 26
                                        }
                                    },
                                    "name": "baz",
                                    "decorators": [
                                        {
                                            "arguments": [
                                                {
                                                    "loc": {
                                                        "end": {
                                                            "column": 21,
                                                            "line": 2
                                                        },
                                                        "start": {
                                                            "column": 17,
                                                            "line": 2
                                                        }
                                                    },
                                                    "range": [
                                                        29,
                                                        33
                                                    ],
                                                    "raw": "true",
                                                    "type": "Literal",
                                                    "value": true
                                                }
                                            ],
                                            "callee": {
                                                "loc": {
                                                    "end": {
                                                        "column": 16,
                                                        "line": 2
                                                    },
                                                    "start": {
                                                        "column": 9,
                                                        "line": 2
                                                    }
                                                },
                                                "name": "special",
                                                "range": [
                                                    21,
                                                    28
                                                ],
                                                "type": "Identifier"
                                            },
                                            "loc": {
                                                "end": {
                                                    "column": 22,
                                                    "line": 2
                                                },
                                                "start": {
                                                    "column": 9,
                                                    "line": 2
                                                }
                                            },
                                            "range": [
                                                21,
                                                34
                                            ],
                                            "type": "CallExpression"
                                        }
                                    ]
                                }
                            ],
                            "generator": false,
                            "expression": false,
                            "body": {
                                "type": "BlockStatement",
                                "range": [
                                    48,
                                    50
                                ],
                                "loc": {
                                    "start": {
                                        "line": 2,
                                        "column": 36
                                    },
                                    "end": {
                                        "line": 2,
                                        "column": 38
                                    }
                                },
                                "body": []
                            },
                            "range": [
                                19,
                                50
                            ],
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 7
                                },
                                "end": {
                                    "line": 2,
                                    "column": 38
                                }
                            }
                        },
                        "computed": false,
                        "static": false,
                        "kind": "method",
                        "decorators": []
                    }
                ],
                "range": [
                    10,
                    52
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 10
                    },
                    "end": {
                        "line": 3,
                        "column": 1
                    }
                }
            },
            "superClass": null,
            "implements": []
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
            "value": "Foo",
            "range": [
                6,
                9
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 6
                },
                "end": {
                    "line": 1,
                    "column": 9
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                10,
                11
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 10
                },
                "end": {
                    "line": 1,
                    "column": 11
                }
            }
        },
        {
            "type": "Identifier",
            "value": "bar",
            "range": [
                16,
                19
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 4
                },
                "end": {
                    "line": 2,
                    "column": 7
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "(",
            "range": [
                19,
                20
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 7
                },
                "end": {
                    "line": 2,
                    "column": 8
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "@",
            "range": [
                20,
                21
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
            "type": "Identifier",
            "value": "special",
            "range": [
                21,
                28
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 9
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
                28,
                29
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
            "type": "Boolean",
            "value": "true",
            "range": [
                29,
                33
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 17
                },
                "end": {
                    "line": 2,
                    "column": 21
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ")",
            "range": [
                33,
                34
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 21
                },
                "end": {
                    "line": 2,
                    "column": 22
                }
            }
        },
        {
            "type": "Identifier",
            "value": "baz",
            "range": [
                35,
                38
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 23
                },
                "end": {
                    "line": 2,
                    "column": 26
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ":",
            "range": [
                38,
                39
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 26
                },
                "end": {
                    "line": 2,
                    "column": 27
                }
            }
        },
        {
            "type": "Identifier",
            "value": "number",
            "range": [
                40,
                46
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 28
                },
                "end": {
                    "line": 2,
                    "column": 34
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ")",
            "range": [
                46,
                47
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 34
                },
                "end": {
                    "line": 2,
                    "column": 35
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                48,
                49
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 36
                },
                "end": {
                    "line": 2,
                    "column": 37
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                49,
                50
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 37
                },
                "end": {
                    "line": 2,
                    "column": 38
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                51,
                52
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
