module.exports = {
    "type": "Program",
    "range": [
        0,
        36
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
            "range": [
                0,
                36
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
                            14,
                            34
                        ],
                        "loc": {
                            "start": {
                                "line": 2,
                                "column": 2
                            },
                            "end": {
                                "line": 2,
                                "column": 22
                            }
                        },
                        "key": {
                            "type": "Identifier",
                            "range": [
                                14,
                                20
                            ],
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 2
                                },
                                "end": {
                                    "line": 2,
                                    "column": 8
                                }
                            },
                            "name": "getBar"
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
                                    32,
                                    34
                                ],
                                "loc": {
                                    "start": {
                                        "line": 2,
                                        "column": 20
                                    },
                                    "end": {
                                        "line": 2,
                                        "column": 22
                                    }
                                },
                                "body": []
                            },
                            "range": [
                                29,
                                34
                            ],
                            "loc": {
                                "start": {
                                    "line": 2,
                                    "column": 8
                                },
                                "end": {
                                    "line": 2,
                                    "column": 22
                                }
                            },
                            "params": [],
                            "typeParameters": {
                                "type": "TypeParameterDeclaration",
                                "range": [
                                    20,
                                    29
                                ],
                                "loc": {
                                    "start": {
                                        "line": 2,
                                        "column": 8
                                    },
                                    "end": {
                                        "line": 2,
                                        "column": 17
                                    }
                                },
                                "params": [
                                    {
                                        "type": "TypeParameter",
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
                                        },
                                        "name": "T",
                                        "constraint": null,
                                        "default": {
                                            "type": "TSTypeReference",
                                            "range": [
                                                25,
                                                28
                                            ],
                                            "loc": {
                                                "start": {
                                                    "line": 2,
                                                    "column": 13
                                                },
                                                "end": {
                                                    "line": 2,
                                                    "column": 16
                                                }
                                            },
                                            "typeName": {
                                                "type": "Identifier",
                                                "range": [
                                                    25,
                                                    28
                                                ],
                                                "loc": {
                                                    "start": {
                                                        "line": 2,
                                                        "column": 13
                                                    },
                                                    "end": {
                                                        "line": 2,
                                                        "column": 16
                                                    }
                                                },
                                                "name": "Bar"
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                        "computed": false,
                        "static": false,
                        "kind": "method",
                        "accessibility": null,
                        "decorators": []
                    }
                ],
                "range": [
                    10,
                    36
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
            "value": "getBar",
            "range": [
                14,
                20
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 2
                },
                "end": {
                    "line": 2,
                    "column": 8
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "<",
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
            "value": "T",
            "range": [
                21,
                22
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 9
                },
                "end": {
                    "line": 2,
                    "column": 10
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "=",
            "range": [
                23,
                24
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 11
                },
                "end": {
                    "line": 2,
                    "column": 12
                }
            }
        },
        {
            "type": "Identifier",
            "value": "Bar",
            "range": [
                25,
                28
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 13
                },
                "end": {
                    "line": 2,
                    "column": 16
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ">",
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
            "type": "Punctuator",
            "value": "(",
            "range": [
                29,
                30
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
            "type": "Punctuator",
            "value": ")",
            "range": [
                30,
                31
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 18
                },
                "end": {
                    "line": 2,
                    "column": 19
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                32,
                33
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 20
                },
                "end": {
                    "line": 2,
                    "column": 21
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
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
            "type": "Punctuator",
            "value": "}",
            "range": [
                35,
                36
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
