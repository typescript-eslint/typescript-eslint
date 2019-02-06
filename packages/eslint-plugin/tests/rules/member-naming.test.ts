import rule from '../../src/rules/member-naming';
import RuleTester from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser'
});

ruleTester.run('member-naming', rule, {
  valid: [
    {
      code: `class Class { _fooBar() {} }`,
      options: [{ public: '^_' }]
    },
    {
      code: `class Class { public _fooBar() {} }`,
      options: [{ public: '^_' }]
    },
    {
      code: `class Class { protected _fooBar() {} }`,
      options: [{ protected: '^_' }]
    },
    {
      code: `class Class { private _fooBar() {} }`,
      options: [{ private: '^_' }]
    },
    {
      code: `class Class { protected fooBar() {} }`,
      options: [{ private: '^_' }]
    },
    {
      code: `
class Class {
    pubOne() {}
    public pubTwo() {}
    protected protThree() {}
    private privFour() {}
}
            `,
      options: [
        {
          public: '^pub[A-Z]',
          protected: '^prot[A-Z]',
          private: '^priv[A-Z]'
        }
      ]
    },
    {
      code: `
class Class {
    pubOne: string;
    public pubTwo: string;
    protected protThree: string;
    private privFour: string;
}
            `,
      options: [
        {
          public: '^pub[A-Z]',
          protected: '^prot[A-Z]',
          private: '^priv[A-Z]'
        }
      ]
    },
    {
      code: `
class Class {
    pubOne = true;
    public pubTwo = true;
    protected protThree = true;
    private privFour = true;
}
            `,
      options: [
        {
          public: '^pub[A-Z]',
          protected: '^prot[A-Z]',
          private: '^priv[A-Z]'
        }
      ]
    }
  ],
  invalid: [
    {
      code: `class Class { fooBar() {} }`,
      options: [{ public: '^_' }],
      errors: [
        {
          messageId: 'incorrectName',
          data: {
            accessibility: 'public',
            convention: '/^_/',
            name: 'fooBar'
          },
          line: 1,
          column: 15
        }
      ]
    },
    {
      code: `class Class { public fooBar() {} }`,
      options: [{ public: '^_' }],
      errors: [
        {
          messageId: 'incorrectName',
          data: {
            accessibility: 'public',
            convention: '/^_/',
            name: 'fooBar'
          },
          line: 1,
          column: 22
        }
      ]
    },
    {
      code: `class Class { protected fooBar() {} }`,
      options: [{ protected: '^_' }],
      errors: [
        {
          messageId: 'incorrectName',
          data: {
            accessibility: 'protected',
            convention: '/^_/',
            name: 'fooBar'
          },
          line: 1,
          column: 25
        }
      ]
    },
    {
      code: `class Class { private fooBar() {} }`,
      options: [{ private: '^_' }],
      errors: [
        {
          messageId: 'incorrectName',
          data: {
            accessibility: 'private',
            convention: '/^_/',
            name: 'fooBar'
          },
          line: 1,
          column: 23
        }
      ]
    },
    {
      code: `
class Class {
    one() {}
    public two() {}
    protected three() {}
    private four() {}
}
            `,
      options: [
        {
          public: '^pub[A-Z]',
          protected: '^prot[A-Z]',
          private: '^priv[A-Z]'
        }
      ],
      errors: [
        {
          messageId: 'incorrectName',
          data: {
            accessibility: 'public',
            convention: '/^pub[A-Z]/',
            name: 'one'
          },
          line: 3,
          column: 5
        },
        {
          messageId: 'incorrectName',
          data: {
            accessibility: 'public',
            convention: '/^pub[A-Z]/',
            name: 'two'
          },
          line: 4,
          column: 12
        },
        {
          messageId: 'incorrectName',
          data: {
            accessibility: 'protected',
            convention: '/^prot[A-Z]/',
            name: 'three'
          },
          line: 5,
          column: 15
        },
        {
          messageId: 'incorrectName',
          data: {
            accessibility: 'private',
            convention: '/^priv[A-Z]/',
            name: 'four'
          },
          line: 6,
          column: 13
        }
      ]
    },
    {
      code: `
class Class {
    one: string;
    public two: string;
    protected three: string;
    private four: string;
}
            `,
      options: [
        {
          public: '^pub[A-Z]',
          protected: '^prot[A-Z]',
          private: '^priv[A-Z]'
        }
      ],
      errors: [
        {
          messageId: 'incorrectName',
          data: {
            accessibility: 'public',
            convention: '/^pub[A-Z]/',
            name: 'one'
          },
          line: 3,
          column: 5
        },
        {
          messageId: 'incorrectName',
          data: {
            accessibility: 'public',
            convention: '/^pub[A-Z]/',
            name: 'two'
          },
          line: 4,
          column: 12
        },
        {
          messageId: 'incorrectName',
          data: {
            accessibility: 'protected',
            convention: '/^prot[A-Z]/',
            name: 'three'
          },
          line: 5,
          column: 15
        },
        {
          messageId: 'incorrectName',
          data: {
            accessibility: 'private',
            convention: '/^priv[A-Z]/',
            name: 'four'
          },
          line: 6,
          column: 13
        }
      ]
    },
    {
      code: `
class Class {
    one = true;
    public two = true;
    protected three = true;
    private four = true;
}
            `,
      options: [
        {
          public: '^pub[A-Z]',
          protected: '^prot[A-Z]',
          private: '^priv[A-Z]'
        }
      ],
      errors: [
        {
          messageId: 'incorrectName',
          data: {
            accessibility: 'public',
            convention: '/^pub[A-Z]/',
            name: 'one'
          },
          line: 3,
          column: 5
        },
        {
          messageId: 'incorrectName',
          data: {
            accessibility: 'public',
            convention: '/^pub[A-Z]/',
            name: 'two'
          },
          line: 4,
          column: 12
        },
        {
          messageId: 'incorrectName',
          data: {
            accessibility: 'protected',
            convention: '/^prot[A-Z]/',
            name: 'three'
          },
          line: 5,
          column: 15
        },
        {
          messageId: 'incorrectName',
          data: {
            accessibility: 'private',
            convention: '/^priv[A-Z]/',
            name: 'four'
          },
          line: 6,
          column: 13
        }
      ]
    }
  ]
});
