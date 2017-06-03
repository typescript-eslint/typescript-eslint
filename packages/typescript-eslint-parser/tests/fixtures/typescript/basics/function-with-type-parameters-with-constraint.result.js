module.exports = {
    "type": "Program",
    "range": [
        0,
        51
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
            "type": "FunctionDeclaration",
            "range": [
                0,
                51
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
                    9,
                    10
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 9
                    },
                    "end": {
                        "line": 1,
                        "column": 10
                    }
                },
                "name": "a"
            },
            "generator": false,
            "expression": false,
            "async": false,
            "params": [
                {
                    "type": "Identifier",
                    "range": [
                        25,
                        26
                    ],
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 25
                        },
                        "end": {
                            "line": 1,
                            "column": 26
                        }
                    },
                    "name": "b",
                    "typeAnnotation": {
                        "type": "TypeAnnotation",
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 28
                            },
                            "end": {
                                "line": 1,
                                "column": 29
                            }
                        },
                        "range": [
                            28,
                            29
                        ],
                        "typeAnnotation": {
                            "type": "TSTypeReference",
                            "range": [
                                28,
                                29
                            ],
                            "loc": {
                                "start": {
                                    "line": 1,
                                    "column": 28
                                },
                                "end": {
                                    "line": 1,
                                    "column": 29
                                }
                            },
                            "typeName": {
                                "type": "Identifier",
                                "range": [
                                    28,
                                    29
                                ],
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 28
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 29
                                    }
                                },
                                "name": "X"
                            }
                        }
                    }
                }
            ],
            "body": {
                "type": "BlockStatement",
                "range": [
                    34,
                    51
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 34
                    },
                    "end": {
                        "line": 3,
                        "column": 1
                    }
                },
                "body": [
                    {
                        "type": "ReturnStatement",
                        "range": [
                            40,
                            49
                        ],
                        "loc": {
                            "start": {
                                "line": 2,
                                "column": 4
                            },
                            "end": {
                                "line": 2,
                                "column": 13
                            }
                        },
                        "argument": {
                            "type": "Identifier",
                            "range": [
                                47,
                                48
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
                            },
                            "name": "b"
                        }
                    }
                ]
            },
            "returnType": {
                "type": "TypeAnnotation",
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 32
                    },
                    "end": {
                        "line": 1,
                        "column": 33
                    }
                },
                "range": [
                    32,
                    33
                ],
                "typeAnnotation": {
                    "type": "TSTypeReference",
                    "range": [
                        32,
                        33
                    ],
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 32
                        },
                        "end": {
                            "line": 1,
                            "column": 33
                        }
                    },
                    "typeName": {
                        "type": "Identifier",
                        "range": [
                            32,
                            33
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 32
                            },
                            "end": {
                                "line": 1,
                                "column": 33
                            }
                        },
                        "name": "X"
                    }
                }
            },
            "typeParameters": {
                "type": "TypeParameterDeclaration",
                "range": [
                    10,
                    24
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 10
                    },
                    "end": {
                        "line": 1,
                        "column": 24
                    }
                },
                "params": [
                    {
                        "type": "TypeParameter",
                        "range": [
                            11,
                            23
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 11
                            },
                            "end": {
                                "line": 1,
                                "column": 23
                            }
                        },
                        "name": "X",
                        "constraint": {
                            "type": "TypeAnnotation",
                            "loc": {
                                "start": {
                                    "line": 1,
                                    "column": 21
                                },
                                "end": {
                                    "line": 1,
                                    "column": 23
                                }
                            },
                            "range": [
                                21,
                                23
                            ],
                            "typeAnnotation": {
                                "type": "TSTypeLiteral",
                                "range": [
                                    21,
                                    23
                                ],
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 21
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 23
                                    }
                                },
                                "members": []
                            }
                        }
                    }
                ]
            }
        }
    ],
    "sourceType": "script",
    "tokens": [
        {
            "type": "Keyword",
            "value": "function",
            "range": [
                0,
                8
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 8
                }
            }
        },
        {
            "type": "Identifier",
            "value": "a",
            "range": [
                9,
                10
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 9
                },
                "end": {
                    "line": 1,
                    "column": 10
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "<",
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
            "value": "X",
            "range": [
                11,
                12
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 11
                },
                "end": {
                    "line": 1,
                    "column": 12
                }
            }
        },
        {
            "type": "Keyword",
            "value": "extends",
            "range": [
                13,
                20
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 13
                },
                "end": {
                    "line": 1,
                    "column": 20
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                21,
                22
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 21
                },
                "end": {
                    "line": 1,
                    "column": 22
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                22,
                23
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 22
                },
                "end": {
                    "line": 1,
                    "column": 23
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ">",
            "range": [
                23,
                24
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 23
                },
                "end": {
                    "line": 1,
                    "column": 24
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "(",
            "range": [
                24,
                25
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 24
                },
                "end": {
                    "line": 1,
                    "column": 25
                }
            }
        },
        {
            "type": "Identifier",
            "value": "b",
            "range": [
                25,
                26
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 25
                },
                "end": {
                    "line": 1,
                    "column": 26
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ":",
            "range": [
                26,
                27
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 26
                },
                "end": {
                    "line": 1,
                    "column": 27
                }
            }
        },
        {
            "type": "Identifier",
            "value": "X",
            "range": [
                28,
                29
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 28
                },
                "end": {
                    "line": 1,
                    "column": 29
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
                    "line": 1,
                    "column": 29
                },
                "end": {
                    "line": 1,
                    "column": 30
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ":",
            "range": [
                30,
                31
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 30
                },
                "end": {
                    "line": 1,
                    "column": 31
                }
            }
        },
        {
            "type": "Identifier",
            "value": "X",
            "range": [
                32,
                33
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 32
                },
                "end": {
                    "line": 1,
                    "column": 33
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
            "range": [
                34,
                35
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 34
                },
                "end": {
                    "line": 1,
                    "column": 35
                }
            }
        },
        {
            "type": "Keyword",
            "value": "return",
            "range": [
                40,
                46
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
            "value": "b",
            "range": [
                47,
                48
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
            "type": "Punctuator",
            "value": ";",
            "range": [
                48,
                49
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 12
                },
                "end": {
                    "line": 2,
                    "column": 13
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "}",
            "range": [
                50,
                51
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