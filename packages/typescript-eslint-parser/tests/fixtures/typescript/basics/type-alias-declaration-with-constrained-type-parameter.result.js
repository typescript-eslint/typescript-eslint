module.exports = {
    "type": "Program",
    "range": [
        0,
        48
    ],
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 1,
            "column": 48
        }
    },
    "body": [
        {
            "type": "VariableDeclaration",
            "range": [
                0,
                48
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 48
                }
            },
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
                    "init": {
                        "type": "TSUnionType",
                        "range": [
                            28,
                            48
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 28
                            },
                            "end": {
                                "line": 1,
                                "column": 48
                            }
                        },
                        "types": [
                            {
                                "type": "TSTypeReference",
                                "range": [
                                    28,
                                    38
                                ],
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 28
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 38
                                    }
                                },
                                "typeName": {
                                    "type": "Identifier",
                                    "range": [
                                        28,
                                        35
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 1,
                                            "column": 28
                                        },
                                        "end": {
                                            "line": 1,
                                            "column": 35
                                        }
                                    },
                                    "name": "Success"
                                },
                                "typeParameters": {
                                    "type": "TypeParameterInstantiation",
                                    "range": [
                                        35,
                                        38
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 1,
                                            "column": 35
                                        },
                                        "end": {
                                            "line": 1,
                                            "column": 38
                                        }
                                    },
                                    "params": [
                                        {
                                            "type": "GenericTypeAnnotation",
                                            "range": [
                                                36,
                                                37
                                            ],
                                            "loc": {
                                                "start": {
                                                    "line": 1,
                                                    "column": 36
                                                },
                                                "end": {
                                                    "line": 1,
                                                    "column": 37
                                                }
                                            },
                                            "id": {
                                                "type": "Identifier",
                                                "range": [
                                                    36,
                                                    37
                                                ],
                                                "loc": {
                                                    "start": {
                                                        "line": 1,
                                                        "column": 36
                                                    },
                                                    "end": {
                                                        "line": 1,
                                                        "column": 37
                                                    }
                                                },
                                                "name": "T"
                                            },
                                            "typeParameters": null
                                        }
                                    ]
                                }
                            },
                            {
                                "type": "TSTypeReference",
                                "range": [
                                    41,
                                    48
                                ],
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 41
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 48
                                    }
                                },
                                "typeName": {
                                    "type": "Identifier",
                                    "range": [
                                        41,
                                        48
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 1,
                                            "column": 41
                                        },
                                        "end": {
                                            "line": 1,
                                            "column": 48
                                        }
                                    },
                                    "name": "Failure"
                                }
                            }
                        ]
                    },
                    "range": [
                        5,
                        48
                    ],
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 5
                        },
                        "end": {
                            "line": 1,
                            "column": 48
                        }
                    },
                    "typeParameters": {
                        "type": "TypeParameterDeclaration",
                        "range": [
                            11,
                            25
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 11
                            },
                            "end": {
                                "line": 1,
                                "column": 25
                            }
                        },
                        "params": [
                            {
                                "type": "TypeParameter",
                                "range": [
                                    12,
                                    24
                                ],
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 12
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 24
                                    }
                                },
                                "name": "T",
                                "constraint": {
                                    "type": "TypeAnnotation",
                                    "loc": {
                                        "start": {
                                            "line": 1,
                                            "column": 22
                                        },
                                        "end": {
                                            "line": 1,
                                            "column": 24
                                        }
                                    },
                                    "range": [
                                        22,
                                        24
                                    ],
                                    "typeAnnotation": {
                                        "type": "TSTypeLiteral",
                                        "range": [
                                            22,
                                            24
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 1,
                                                "column": 22
                                            },
                                            "end": {
                                                "line": 1,
                                                "column": 24
                                            }
                                        },
                                        "members": []
                                    }
                                }
                            }
                        ]
                    }
                }
            ]
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
            "type": "Keyword",
            "value": "extends",
            "range": [
                14,
                21
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 14
                },
                "end": {
                    "line": 1,
                    "column": 21
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "{",
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
            "value": "}",
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
            "value": ">",
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
            "type": "Punctuator",
            "value": "=",
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
            "value": "Success",
            "range": [
                28,
                35
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 28
                },
                "end": {
                    "line": 1,
                    "column": 35
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "<",
            "range": [
                35,
                36
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 35
                },
                "end": {
                    "line": 1,
                    "column": 36
                }
            }
        },
        {
            "type": "Identifier",
            "value": "T",
            "range": [
                36,
                37
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 36
                },
                "end": {
                    "line": 1,
                    "column": 37
                }
            }
        },
        {
            "type": "Punctuator",
            "value": ">",
            "range": [
                37,
                38
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 37
                },
                "end": {
                    "line": 1,
                    "column": 38
                }
            }
        },
        {
            "type": "Punctuator",
            "value": "|",
            "range": [
                39,
                40
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 39
                },
                "end": {
                    "line": 1,
                    "column": 40
                }
            }
        },
        {
            "type": "Identifier",
            "value": "Failure",
            "range": [
                41,
                48
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 41
                },
                "end": {
                    "line": 1,
                    "column": 48
                }
            }
        }
    ]
};