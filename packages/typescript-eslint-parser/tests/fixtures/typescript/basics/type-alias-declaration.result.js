module.exports = {
    "type": "Program",
    "range": [
        0,
        37
    ],
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 1,
            "column": 37
        }
    },
    "body": [
        {
            "type": "VariableDeclaration",
            "kind": "type",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "range": [
                            5,
                            11
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 5
                            },
                            "end": {
                                "line": 1,
                                "column": 11
                            }
                        },
                        "name": "Result"
                    },
                    "typeParameters": {
                        "loc": {
                            "end": {
                                "column": 14,
                                "line": 1
                            },
                            "start": {
                                "column": 11,
                                "line": 1
                            }
                        },
                        "params": [
                            {
                                "loc": {
                                    "end": {
                                        "column": 13,
                                        "line": 1
                                    },
                                    "start": {
                                        "column": 12,
                                        "line": 1
                                    }
                                },
                                "name": "T",
                                "range": [
                                    12,
                                    13
                                ],
                                "type": "TypeParameter"
                            }
                        ],
                        "range": [
                            11,
                            14
                        ],
                        "type": "TypeParameterDeclaration"
                    },
                    "init": {
                        "flags": 0,
                        "loc": {
                            "end": {
                                "column": 37,
                                "line": 1
                            },
                            "start": {
                                "column": 17,
                                "line": 1
                            }
                        },
                        "range": [
                            17,
                            37
                        ],
                        "type": "TSUnionType",
                        "types": [
                            {
                                "flags": 0,
                                "loc": {
                                    "end": {
                                        "column": 27,
                                        "line": 1
                                    },
                                    "start": {
                                        "column": 17,
                                        "line": 1
                                    }
                                },
                                "range": [
                                    17,
                                    27
                                ],
                                "type": "TSTypeReference",
                                "typeArguments": [
                                    {
                                        "flags": 0,
                                        "loc": {
                                            "end": {
                                                "column": 26,
                                                "line": 1
                                            },
                                            "start": {
                                                "column": 25,
                                                "line": 1
                                            }
                                        },
                                        "range": [
                                            25,
                                            26
                                        ],
                                        "type": "TSTypeReference",
                                        "typeName": {
                                            "loc": {
                                                "end": {
                                                    "column": 26,
                                                    "line": 1
                                                },
                                                "start": {
                                                    "column": 25,
                                                    "line": 1
                                                }
                                            },
                                            "name": "T",
                                            "range": [
                                                25,
                                                26
                                            ],
                                            "type": "Identifier"
                                        }
                                    }
                                ],
                                "typeName": {
                                    "loc": {
                                        "end": {
                                            "column": 24,
                                            "line": 1
                                        },
                                        "start": {
                                            "column": 17,
                                            "line": 1
                                        }
                                    },
                                    "name": "Success",
                                    "range": [
                                        17,
                                        24
                                    ],
                                    "type": "Identifier"
                                }
                            },
                            {
                                "flags": 0,
                                "loc": {
                                    "end": {
                                        "column": 37,
                                        "line": 1
                                    },
                                    "start": {
                                        "column": 30,
                                        "line": 1
                                    }
                                },
                                "range": [
                                    30,
                                    37
                                ],
                                "type": "TSTypeReference",
                                "typeName": {
                                    "loc": {
                                        "end": {
                                            "column": 37,
                                            "line": 1
                                        },
                                        "start": {
                                            "column": 30,
                                            "line": 1
                                        }
                                    },
                                    "name": "Failure",
                                    "range": [
                                        30,
                                        37
                                    ],
                                    "type": "Identifier"
                                }
                            }
                        ]
                    }
                }
            ],
            "range": [
                0,
                37
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 37
                }
            }
        }
    ],
    "sourceType": "script",
    "tokens": [
        {
            "type": "Identifier",
            "value": "type",
            "range": [
                0,
                4
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 4
                }
            }
        },
        {
            "type": "Identifier",
            "value": "Result",
            "range": [
                5,
                11
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 5
                },
                "end": {
                    "line": 1,
                    "column": 11
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "<",
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
            "type": "Identifier",
            "value": "T",
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
            "value": ">",
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
            "type": "Punctuator",
            "value": "=",
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
            "value": "Success",
            "range": [
                17,
                24
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 17
                },
                "end": {
                    "line": 1,
                    "column": 24
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "<",
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
            "value": "T",
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
            "value": ">",
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
            "type": "Punctuator",
            "value": "|",
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
            "type": "Identifier",
            "value": "Failure",
            "range": [
                30,
                37
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 30
                },
                "end": {
                    "line": 1,
                    "column": 37
                }
            }
        }
    ]
};
