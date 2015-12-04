module.exports = {
    "type": "Program",
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 1,
            "column": 45
        }
    },
    "range": [
        0,
        45
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
                    "line": 1,
                    "column": 45
                }
            },
            "range": [
                0,
                45
            ],
            "expression": {
                "type": "TaggedTemplateExpression",
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 0
                    },
                    "end": {
                        "line": 1,
                        "column": 44
                    }
                },
                "range": [
                    0,
                    44
                ],
                "tag": {
                    "type": "Identifier",
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 0
                        },
                        "end": {
                            "line": 1,
                            "column": 3
                        }
                    },
                    "range": [
                        0,
                        3
                    ],
                    "name": "raw"
                },
                "quasi": {
                    "type": "TemplateLiteral",
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 3
                        },
                        "end": {
                            "line": 1,
                            "column": 44
                        }
                    },
                    "range": [
                        3,
                        44
                    ],
                    "expressions": [
                        {
                            "type": "TemplateLiteral",
                            "loc": {
                                "start": {
                                    "line": 1,
                                    "column": 12
                                },
                                "end": {
                                    "line": 1,
                                    "column": 42
                                }
                            },
                            "range": [
                                12,
                                42
                            ],
                            "expressions": [
                                {
                                    "type": "BinaryExpression",
                                    "loc": {
                                        "start": {
                                            "line": 1,
                                            "column": 22
                                        },
                                        "end": {
                                            "line": 1,
                                            "column": 35
                                        }
                                    },
                                    "range": [
                                        22,
                                        35
                                    ],
                                    "left": {
                                        "type": "TemplateLiteral",
                                        "loc": {
                                            "start": {
                                                "line": 1,
                                                "column": 22
                                            },
                                            "end": {
                                                "line": 1,
                                                "column": 30
                                            }
                                        },
                                        "range": [
                                            22,
                                            30
                                        ],
                                        "expressions": [],
                                        "quasis": [
                                            {
                                                "type": "TemplateElement",
                                                "loc": {
                                                    "start": {
                                                        "line": 1,
                                                        "column": 22
                                                    },
                                                    "end": {
                                                        "line": 1,
                                                        "column": 30
                                                    }
                                                },
                                                "range": [
                                                    22,
                                                    30
                                                ],
                                                "value": {
                                                    "raw": "deeply",
                                                    "cooked": "deeply"
                                                },
                                                "tail": true
                                            }
                                        ]
                                    },
                                    "operator": "+",
                                    "right": {
                                        "type": "ObjectExpression",
                                        "loc": {
                                            "start": {
                                                "line": 1,
                                                "column": 33
                                            },
                                            "end": {
                                                "line": 1,
                                                "column": 35
                                            }
                                        },
                                        "range": [
                                            33,
                                            35
                                        ],
                                        "properties": []
                                    }
                                }
                            ],
                            "quasis": [
                                {
                                    "type": "TemplateElement",
                                    "loc": {
                                        "start": {
                                            "line": 1,
                                            "column": 12
                                        },
                                        "end": {
                                            "line": 1,
                                            "column": 22
                                        }
                                    },
                                    "range": [
                                        12,
                                        22
                                    ],
                                    "value": {
                                        "raw": "nested ",
                                        "cooked": "nested "
                                    },
                                    "tail": false
                                },
                                {
                                    "type": "TemplateElement",
                                    "loc": {
                                        "start": {
                                            "line": 1,
                                            "column": 35
                                        },
                                        "end": {
                                            "line": 1,
                                            "column": 42
                                        }
                                    },
                                    "range": [
                                        35,
                                        42
                                    ],
                                    "value": {
                                        "raw": " blah",
                                        "cooked": " blah"
                                    },
                                    "tail": true
                                }
                            ]
                        }
                    ],
                    "quasis": [
                        {
                            "type": "TemplateElement",
                            "loc": {
                                "start": {
                                    "line": 1,
                                    "column": 3
                                },
                                "end": {
                                    "line": 1,
                                    "column": 12
                                }
                            },
                            "range": [
                                3,
                                12
                            ],
                            "value": {
                                "raw": "hello ",
                                "cooked": "hello "
                            },
                            "tail": false
                        },
                        {
                            "type": "TemplateElement",
                            "loc": {
                                "start": {
                                    "line": 1,
                                    "column": 42
                                },
                                "end": {
                                    "line": 1,
                                    "column": 44
                                }
                            },
                            "range": [
                                42,
                                44
                            ],
                            "value": {
                                "raw": "",
                                "cooked": ""
                            },
                            "tail": true
                        }
                    ]
                }
            }
        }
    ],
    "sourceType": "script",
    "tokens": [
        {
            "type": "Identifier",
            "value": "raw",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 3
                }
            },
            "range": [
                0,
                3
            ]
        },
        {
            "type": "Template",
            "value": "`hello ${",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 3
                },
                "end": {
                    "line": 1,
                    "column": 12
                }
            },
            "range": [
                3,
                12
            ]
        },
        {
            "type": "Template",
            "value": "`nested ${",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 12
                },
                "end": {
                    "line": 1,
                    "column": 22
                }
            },
            "range": [
                12,
                22
            ]
        },
        {
            "type": "Template",
            "value": "`deeply`",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 22
                },
                "end": {
                    "line": 1,
                    "column": 30
                }
            },
            "range": [
                22,
                30
            ]
        },
        {
            "type": "Punctuator",
            "value": "+",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 31
                },
                "end": {
                    "line": 1,
                    "column": 32
                }
            },
            "range": [
                31,
                32
            ]
        },
        {
            "type": "Punctuator",
            "value": "{",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 33
                },
                "end": {
                    "line": 1,
                    "column": 34
                }
            },
            "range": [
                33,
                34
            ]
        },
        {
            "type": "Punctuator",
            "value": "}",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 34
                },
                "end": {
                    "line": 1,
                    "column": 35
                }
            },
            "range": [
                34,
                35
            ]
        },
        {
            "type": "Template",
            "value": "} blah`",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 35
                },
                "end": {
                    "line": 1,
                    "column": 42
                }
            },
            "range": [
                35,
                42
            ]
        },
        {
            "type": "Template",
            "value": "}`",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 42
                },
                "end": {
                    "line": 1,
                    "column": 44
                }
            },
            "range": [
                42,
                44
            ]
        },
        {
            "type": "Punctuator",
            "value": ";",
            "loc": {
                "start": {
                    "line": 1,
                    "column": 44
                },
                "end": {
                    "line": 1,
                    "column": 45
                }
            },
            "range": [
                44,
                45
            ]
        }
    ]
};