module.exports = {
    "type": "Program",
    "range": [
        0,
        40
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
                40
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
                        14,
                        15
                    ],
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 14
                        },
                        "end": {
                            "line": 1,
                            "column": 15
                        }
                    },
                    "name": "b",
                    "typeAnnotation": {
                        "type": "TypeAnnotation",
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 17
                            },
                            "end": {
                                "line": 1,
                                "column": 18
                            }
                        },
                        "range": [
                            17,
                            18
                        ],
                        "typeAnnotation": {
                            "type": "TSTypeReference",
                            "range": [
                                17,
                                18
                            ],
                            "loc": {
                                "start": {
                                    "line": 1,
                                    "column": 17
                                },
                                "end": {
                                    "line": 1,
                                    "column": 18
                                }
                            },
                            "typeName": {
                                "type": "Identifier",
                                "range": [
                                    17,
                                    18
                                ],
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 17
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 18
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
                    23,
                    40
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 23
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
                            29,
                            38
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
                                36,
                                37
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
                        "column": 21
                    },
                    "end": {
                        "line": 1,
                        "column": 22
                    }
                },
                "range": [
                    21,
                    22
                ],
                "typeAnnotation": {
                    "type": "TSTypeReference",
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
                    },
                    "typeName": {
                        "type": "Identifier",
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
                        },
                        "name": "X"
                    }
                }
            },
            "typeParameters": {
                "type": "TypeParameterDeclaration",
                "range": [
                    10,
                    13
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 10
                    },
                    "end": {
                        "line": 1,
                        "column": 13
                    }
                },
                "params": [
                    {
                        "type": "TypeParameter",
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
                        },
                        "name": "X",
                        "constraint": null
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
            "type": "Punctuator",
            "value": ">",
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
            "type": "Punctuator",
            "value": "(",
            "range": [
                13,
                14
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 13
                },
                "end": {
                    "line": 1,
                    "column": 14
                }
            }
        },
        {
            "type": "Identifier",
            "value": "b",
            "range": [
                14,
                15
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 14
                },
                "end": {
                    "line": 1,
                    "column": 15
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ":",
            "range": [
                15,
                16
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 15
                },
                "end": {
                    "line": 1,
                    "column": 16
                }
            }
        },
        {
            "type": "Identifier",
            "value": "X",
            "range": [
                17,
                18
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 17
                },
                "end": {
                    "line": 1,
                    "column": 18
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ")",
            "range": [
                18,
                19
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 18
                },
                "end": {
                    "line": 1,
                    "column": 19
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ":",
            "range": [
                19,
                20
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 19
                },
                "end": {
                    "line": 1,
                    "column": 20
                }
            }
        },
        {
            "type": "Identifier",
            "value": "X",
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
            "value": "{",
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
            "type": "Keyword",
            "value": "return",
            "range": [
                29,
                35
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
                36,
                37
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
                37,
                38
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
                39,
                40
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
