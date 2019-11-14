import rule from '../../src/rules/member-ordering';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('member-ordering', rule, {
  valid: [
    `
// no accessibility === public
interface Foo {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    new();
    G();
    H();
    I();
    J();
    K();
    L();
}
        `,
    {
      code: `
// no accessibility === public
interface Foo {
    A: string;
    J();
    K();
    D: string;
    E: string;
    F: string;
    new();
    G();
    H();
    B: string;
    C: string;
    I();
    L();
}
            `,
      options: [{ default: 'never' }],
    },
    {
      code: `
// no accessibility === public
interface Foo {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    new();
    G();
    H();
    I();
    J();
    K();
    L();
}
            `,
      options: [{ default: ['field', 'constructor', 'method'] }],
    },

    {
      code: `
// no accessibility === public
interface Foo {
    A: string;
    J();
    K();
    D: string;
    E: string;
    F: string;
    new();
    G();
    B: string;
    C: string;
    H();
    I();
    L();
}
            `,
      options: [{ interfaces: 'never' }],
    },
    {
      code: `
// no accessibility === public
interface Foo {
    G();
    H();
    I();
    J();
    K();
    L();
    new();
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
}
            `,
      options: [{ interfaces: ['method', 'constructor', 'field'] }],
    },
    {
      code: `
// no accessibility === public
interface Foo {
    G();
    H();
    I();
    J();
    K();
    L();
    new();
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
}
            `,
      options: [
        {
          default: ['field', 'constructor', 'method'],
          interfaces: ['method', 'constructor', 'field'],
        },
      ],
    },
    {
      code: `
// no accessibility === public
interface Foo {
    G();
    H();
    I();
    new();
    D: string;
    E: string;
    F: string;
    G?: string;
    J();
    K();
    L();
    A: string;
    B: string;
    C: string;
}
            `,
      options: [
        {
          default: [
            'private-instance-method',
            'public-constructor',
            'protected-static-field',
          ],
        },
      ],
    },
    {
      code: `
// no accessibility === public
interface Foo {
    G();
    H();
    I();
    J();
    K();
    L();
    D: string;
    E: string;
    F: string;
    new();
    A: string;
    B: string;
    C: string;
}
            `,
      options: [
        {
          default: ['method', 'public-constructor', 'protected-static-field'],
        },
      ],
    },
    `
// no accessibility === public
type Foo = {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    new();
    G();
    H();
    I();
    J();
    K();
    L();
}
        `,
    {
      code: `
// no accessibility === public
type Foo = {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    G();
    H();
    I();
    J();
    K();
    L();
}
            `,
      options: [{ default: 'never' }],
    },
    {
      code: `
// no accessibility === public
type Foo = {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    G();
    H();
    I();
    J();
    K();
    L();
}
            `,
      options: [{ default: ['field', 'constructor', 'method'] }],
    },
    {
      code: `
// no accessibility === public
type Foo = {
    new();
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    G();
    H();
    I();
    J();
    K();
    L();
}
            `,
      options: [{ default: ['field', 'method'] }],
    },
    {
      code: `
// no accessibility === public
type Foo = {
    G();
    H();
    K();
    L();
    A: string;
    B: string;
    I();
    J();
    C: string;
    D: string;
    E: string;
    F: string;
}
            `,
      options: [{ typeLiterals: 'never' }],
    },
    {
      code: `
// no accessibility === public
type Foo = {
    G();
    H();
    I();
    J();
    K();
    L();
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
}
            `,
      options: [{ typeLiterals: ['method', 'field'] }],
    },
    {
      code: `
// no accessibility === public
type Foo = {
    G();
    H();
    I();
    J();
    K();
    L();
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
}
            `,
      options: [{ typeLiterals: ['method', 'constructor', 'field'] }],
    },
    {
      code: `
// no accessibility === public
type Foo = {
    G();
    H();
    I();
    J();
    K();
    L();
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
}
            `,
      options: [
        {
          default: ['field', 'constructor', 'method'],
          typeLiterals: ['method', 'constructor', 'field'],
        },
      ],
    },
    {
      code: `
// no accessibility === public
type Foo = {
    D: string;
    E: string;
    F: string;
    A: string;
    B: string;
    C: string;
    G();
    H();
    I();
    J();
    K();
    L();
}
            `,
      options: [
        {
          default: [
            'public-instance-method',
            'public-constructor',
            'protected-static-field',
          ],
          typeLiterals: ['field', 'method'],
        },
      ],
    },
    `
class Foo {
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    constructor() {}
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
}
        `,
    {
      code: `
class Foo {
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    constructor() {}
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
}
            `,
      options: [{ default: 'never' }],
    },
    {
      code: `
class Foo {
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    constructor() {}
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
}
            `,
      options: [{ default: ['field', 'constructor', 'method'] }],
    },
    {
      code: `
class Foo {
    constructor() {}
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
}
            `,
      options: [{ default: ['field', 'method'] }],
    },
    {
      code: `
class Foo {
    public static G() {}
    protected K() {}
    private L() {}
    private static I() {}
    public J() {}
    public D: string = "";
    protected static H() {}
    public static A: string;
    protected static B: string = "";
    constructor() {}
    private static C: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
      options: [{ classes: 'never' }],
    },
    {
      code: `
class Foo {
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    constructor() {}
}
            `,
      options: [{ classes: ['method', 'field'] }],
    },
    {
      code: `
class Foo {
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
    constructor() {}
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
      options: [{ classes: ['method', 'constructor', 'field'] }],
    },
    {
      code: `
class Foo {
    private required: boolean;
    private typeChecker: (data: any) => boolean;
    constructor(validator: (data: any) => boolean) {
        this.typeChecker = validator;
    }
    check(data: any): boolean {
        return this.typeChecker(data);
    }
}
            `,
      options: [{ classes: ['field', 'constructor', 'method'] }],
    },
    {
      code: `
class Foo {
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
    constructor() {}
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
      options: [
        {
          default: ['field', 'constructor', 'method'],
          classes: ['method', 'constructor', 'field'],
        },
      ],
    },
    {
      code: `
class Foo {
    public J() {}
    public static G() {}
    protected static H() {}
    private static I() {}
    protected K() {}
    private L() {}
    constructor() {}
    public D: string = "";
    public static A: string;
    private static C: string = "";
    private F: string = "";
    protected static B: string = "";
    protected E: string = "";
}
            `,
      options: [
        {
          classes: [
            'public-method',
            'constructor',
            'public-field',
            'private-field',
            'protected-field',
          ],
        },
      ],
    },
    {
      code: `
class Foo {
    public static G() {}
    private static I() {}
    protected static H() {}
    public J() {}
    private L() {}
    protected K() {}
    constructor() {}
    public D: string = "";
    public static A: string;
    protected static B: string = "";
    protected E: string = "";
    private static C: string = "";
    private F: string = "";
}
            `,
      options: [
        {
          classes: [
            'public-static-method',
            'static-method',
            'public-instance-method',
            'instance-method',
            'constructor',
            'public-field',
            'protected-field',
            'private-field',
          ],
        },
      ],
    },
    {
      code: `
class Foo {
    public J() {}
    public static G() {}
    public D: string = "";
    public static A: string = "";
    constructor() {}
    protected K() {}
    private L() {}
    protected static H() {}
    private static I() {}
    protected static B: string = "";
    private static C: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
      options: [
        {
          default: [
            'public-method',
            'public-field',
            'constructor',
            'method',
            'field',
          ],
        },
      ],
    },
    {
      code: `
class Foo {
    public J() {}
    public static G() {}
    protected static H() {}
    private static I() {}
    protected K() {}
    private L() {}
    constructor() {}
    public static A: string;
    private F: string = "";
    protected static B: string = "";
    public D: string = "";
    private static C: string = "";
    protected E: string = "";
}
            `,
      options: [
        {
          classes: [
            'public-method',
            'protected-static-method',
            'private-static-method',
            'protected-instance-method',
            'private-instance-method',
            'constructor',
            'field',
          ],
        },
      ],
    },
    {
      code: `
class Foo {
    private L() {}
    private static I() {}
    protected static H() {}
    protected static B: string = "";
    public static G() {}
    public J() {}
    protected K() {}
    private static C: string = "";
    private F: string = "";
    protected E: string = "";
    public static A: string;
    public D: string = "";
    constructor() {}

}
            `,
      options: [
        {
          classes: ['private-instance-method', 'protected-static-field'],
        },
      ],
    },
    {
      code: `
class Foo {
    private L() {}
    private static I() {}
    protected static H() {}
    public static G() {}
    public J() {}
    protected static B: string = "";
    protected K() {}
    private static C: string = "";
    private F: string = "";
    protected E: string = "";
    public static A: string;
    public D: string = "";
    constructor() {}

}
            `,
      options: [
        {
          default: ['public-instance-method', 'protected-static-field'],
        },
      ],
    },
    {
      code: `
class Foo {
    private L() {}
    private static I() {}
    protected static H() {}
    public static G() {}
    public J() {}
    protected static B: string = "";
    protected K() {}
    private static C: string = "";
    private F: string = "";
    protected E: string = "";
    public static A: string;
    public D: string = "";
    constructor() {}

}
            `,
      options: [
        {
          classes: ['public-instance-method', 'protected-static-field'],
        },
      ],
    },
    {
      code: `
class Foo {
    public D: string = "";
    private L() {}
    private static I() {}
    protected static H() {}
    public static G() {}
    public J() {}
    private constructor() {}
    protected static B: string = "";
    protected K() {}
    private static C: string = "";
    private F: string = "";
    protected E: string = "";
    public static A: string;
}
            `,
      options: [
        {
          default: [
            'public-instance-method',
            'public-constructor',
            'protected-static-field',
          ],
          classes: [
            'public-instance-field',
            'private-constructor',
            'protected-instance-method',
          ],
        },
      ],
    },
    {
      code: `
class Foo {
    public constructor() {}
    public D: string = "";
    private L() {}
    private static I() {}
    protected static H() {}
    public static G() {}
    public J() {}
    protected static B: string = "";
    protected K() {}
    private static C: string = "";
    private F: string = "";
    protected E: string = "";
    public static A: string;
}
            `,
      options: [
        {
          default: [
            'public-instance-method',
            'public-constructor',
            'protected-static-field',
          ],
          classes: [
            'public-instance-field',
            'private-constructor',
            'protected-instance-method',
          ],
        },
      ],
    },
    `
const foo = class Foo {
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    constructor() {}
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
}
        `,
    {
      code: `
const foo = class Foo {
    constructor() {}
    public static A: string;
    protected static B: string = "";
    private static I() {}
    public J() {}
    private F: string = "";
    public static G() {}
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    protected static H() {}
    protected K() {}
    private L() {}
}
            `,
      options: [{ default: 'never' }],
    },
    {
      code: `
const foo = class Foo {
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    constructor() {}
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
}
            `,
      options: [{ default: ['field', 'constructor', 'method'] }],
    },
    {
      code: `
const foo = class Foo {
    constructor() {}
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
}
            `,
      options: [{ default: ['field', 'method'] }],
    },
    {
      code: `
const foo = class Foo {
    private L() {}
    protected static H() {}
    constructor() {}
    private static I() {}
    public J() {}
    private static C: string = "";
    public D: string = "";
    protected K() {}
    public static G() {}
    public static A: string;
    protected static B: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
      options: [{ classExpressions: 'never' }],
    },
    {
      code: `
const foo = class Foo {
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    constructor() {}
}
            `,
      options: [{ classExpressions: ['method', 'field'] }],
    },
    {
      code: `
const foo = class Foo {
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
    constructor() {}
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
      options: [{ classExpressions: ['method', 'constructor', 'field'] }],
    },
    {
      code: `
const foo = class Foo {
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
    constructor() {}
    public static A: string;
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
      options: [
        {
          default: ['field', 'constructor', 'method'],
          classExpressions: ['method', 'constructor', 'field'],
        },
      ],
    },
    {
      code: `
const foo = class Foo {
    private L() {}
    private static I() {}
    protected static H() {}
    protected static B: string = "";
    public static G() {}
    public J() {}
    protected K() {}
    private static C: string = "";
    private F: string = "";
    protected E: string = "";
    public static A: string;
    public D: string = "";
    constructor() {}

}
            `,
      options: [
        {
          classExpressions: [
            'private-instance-method',
            'protected-static-field',
          ],
        },
      ],
    },
    {
      code: `
const foo = class Foo {
    private L() {}
    private static I() {}
    protected static H() {}
    public static G() {}
    public J() {}
    protected static B: string = "";
    protected K() {}
    private static C: string = "";
    private F: string = "";
    protected E: string = "";
    public static A: string;
    public D: string = "";
    constructor() {}

}
            `,
      options: [
        {
          default: ['public-instance-method', 'protected-static-field'],
        },
      ],
    },
    {
      code: `
const foo = class Foo {
    private L() {}
    private static I() {}
    protected static H() {}
    public static G() {}
    public J() {}
    protected static B: string = "";
    protected K() {}
    private static C: string = "";
    private F: string = "";
    protected E: string = "";
    public static A: string;
    public D: string = "";
    constructor() {}

}
            `,
      options: [
        {
          classExpressions: [
            'public-instance-method',
            'protected-static-field',
          ],
        },
      ],
    },
    {
      code: `
const foo = class Foo {
    public D: string = "";
    private L() {}
    private static I() {}
    protected static H() {}
    public static G() {}
    public J() {}
    private constructor() {}
    protected static B: string = "";
    protected K() {}
    private static C: string = "";
    private F: string = "";
    protected E: string = "";
    public static A: string;
}
            `,
      options: [
        {
          default: [
            'public-instance-method',
            'public-constructor',
            'protected-static-field',
          ],
          classes: [
            'public-instance-method',
            'protected-constructor',
            'protected-static-method',
          ],
          classExpressions: [
            'public-instance-field',
            'private-constructor',
            'protected-instance-method',
          ],
        },
      ],
    },
    {
      code: `
const foo = class Foo {
    public constructor() {}
    public D: string = "";
    private L() {}
    private static I() {}
    protected static H() {}
    public static G() {}
    public J() {}
    protected static B: string = "";
    protected K() {}
    private static C: string = "";
    private F: string = "";
    protected E: string = "";
    public static A: string;
}
            `,
      options: [
        {
          default: [
            'public-instance-method',
            'public-constructor',
            'protected-static-field',
          ],
          classes: [
            'public-instance-method',
            'protected-constructor',
            'protected-static-method',
          ],
          classExpressions: [
            'public-instance-field',
            'private-constructor',
            'protected-instance-method',
          ],
        },
      ],
    },
    `
class Foo {
    A: string;
    constructor () {}
    J() {}
    K = () => {}
}
        `,
    {
      code: `
class Foo {
    J() {}
    K = () => {}
    constructor () {}
    A: string;
}
            `,
      options: [{ default: ['method', 'constructor', 'field'] }],
    },
    {
      code: `
class Foo {
    J() {}
    K = () => {}
    constructor () {}
    A: string;
    L: () => {}
}
            `,
      options: [{ default: ['method', 'constructor', 'field'] }],
    },
    `
interface Foo {
    A: string;
    K: () => {};
    J();
}
        `,
    {
      code: `
interface Foo {
    J();
    K: () => {}
    A: string;
}
            `,
      options: [{ default: ['method', 'constructor', 'field'] }],
    },
    `
type Foo = {
    A: string;
    K: () => {}
    J();
}
        `,
    {
      code: `
type Foo = {
    J();
    K: () => {}
    A: string;
}
            `,
      options: [{ default: ['method', 'constructor', 'field'] }],
    },
    {
      code: `
abstract class Foo {
    B: string;
    abstract A: () => {}
}
    `,
    },
    {
      code: `
interface Foo {
    public B: string;
    [A:string]: number;
}
    `,
    },
    {
      code: `
abstract class Foo {
    private static C: string;
    B: string;
    private D: string;
    protected static F(): {};
    public E(): {};
    public abstract A = () => {};
    protected abstract G(): void;
}
    `,
    },
    {
      code: `
abstract class Foo {
    protected typeChecker: (data: any) => boolean;
    public abstract required: boolean;
    abstract verify(): void;
}
            `,
      options: [{ classes: ['field', 'constructor', 'method'] }],
    },
  ],
  invalid: [
    {
      code: `
// no accessibility === public
interface Foo {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    G();
    H();
    I();
    J();
    K();
    L();
    new();
}
            `,
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'new',
            rank: 'method',
          },
          line: 16,
          column: 5,
        },
      ],
    },
    {
      code: `
// no accessibility === public
interface Foo {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    G();
    H();
    I();
    J();
    K();
    L();
    new();
}
            `,
      options: [{ default: ['method', 'constructor', 'field'] }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'G',
            rank: 'field',
          },
          line: 10,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'H',
            rank: 'field',
          },
          line: 11,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'I',
            rank: 'field',
          },
          line: 12,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'J',
            rank: 'field',
          },
          line: 13,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'K',
            rank: 'field',
          },
          line: 14,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'L',
            rank: 'field',
          },
          line: 15,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'new',
            rank: 'field',
          },
          line: 16,
          column: 5,
        },
      ],
    },
    {
      code: `
// no accessibility === public
interface Foo {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    G();
    H();
    I();
    J();
    K();
    L();
    new();
}
            `,
      options: [{ interfaces: ['method', 'constructor', 'field'] }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'G',
            rank: 'field',
          },
          line: 10,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'H',
            rank: 'field',
          },
          line: 11,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'I',
            rank: 'field',
          },
          line: 12,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'J',
            rank: 'field',
          },
          line: 13,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'K',
            rank: 'field',
          },
          line: 14,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'L',
            rank: 'field',
          },
          line: 15,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'new',
            rank: 'field',
          },
          line: 16,
          column: 5,
        },
      ],
    },
    {
      code: `
// no accessibility === public
interface Foo {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    G();
    H();
    I();
    J();
    K();
    L();
    new();
}
            `,
      options: [
        {
          default: ['field', 'method', 'constructor'],
          interfaces: ['method', 'constructor', 'field'],
        },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'G',
            rank: 'field',
          },
          line: 10,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'H',
            rank: 'field',
          },
          line: 11,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'I',
            rank: 'field',
          },
          line: 12,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'J',
            rank: 'field',
          },
          line: 13,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'K',
            rank: 'field',
          },
          line: 14,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'L',
            rank: 'field',
          },
          line: 15,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'new',
            rank: 'field',
          },
          line: 16,
          column: 5,
        },
      ],
    },
    {
      code: `
// no accessibility === public
interface Foo {
    new();
    A: string;
    G();
    B: string;
    H();
    C: string;
    I();
    D: string;
    J();
    E: string;
    K();
    F: string;
    L();
}
            `,
      options: [
        {
          interfaces: ['constructor', 'field', 'method'],
        },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'B',
            rank: 'method',
          },
          line: 7,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'C',
            rank: 'method',
          },
          line: 9,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'D',
            rank: 'method',
          },
          line: 11,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'E',
            rank: 'method',
          },
          line: 13,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'F',
            rank: 'method',
          },
          line: 15,
          column: 5,
        },
      ],
    },
    {
      code: `
// no accessibility === public
type Foo = {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    G();
    H();
    I();
    J();
    K();
    L();
    new();
}
            `,
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'new',
            rank: 'method',
          },
          line: 16,
          column: 5,
        },
      ],
    },
    {
      code: `
// no accessibility === public
type Foo = {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    G();
    H();
    I();
    J();
    K();
    L();
    new();
}
            `,
      options: [{ default: ['method', 'constructor', 'field'] }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'G',
            rank: 'field',
          },
          line: 10,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'H',
            rank: 'field',
          },
          line: 11,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'I',
            rank: 'field',
          },
          line: 12,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'J',
            rank: 'field',
          },
          line: 13,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'K',
            rank: 'field',
          },
          line: 14,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'L',
            rank: 'field',
          },
          line: 15,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'new',
            rank: 'field',
          },
          line: 16,
          column: 5,
        },
      ],
    },
    {
      code: `
// no accessibility === public
type Foo = {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    G();
    H();
    I();
    J();
    K();
    L();
    new();
}
            `,
      options: [{ typeLiterals: ['method', 'constructor', 'field'] }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'G',
            rank: 'field',
          },
          line: 10,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'H',
            rank: 'field',
          },
          line: 11,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'I',
            rank: 'field',
          },
          line: 12,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'J',
            rank: 'field',
          },
          line: 13,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'K',
            rank: 'field',
          },
          line: 14,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'L',
            rank: 'field',
          },
          line: 15,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'new',
            rank: 'field',
          },
          line: 16,
          column: 5,
        },
      ],
    },
    {
      code: `
// no accessibility === public
type Foo = {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    G();
    H();
    I();
    J();
    K();
    L();
    new();
}
            `,
      options: [
        {
          default: ['field', 'method', 'constructor'],
          typeLiterals: ['method', 'constructor', 'field'],
        },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'G',
            rank: 'field',
          },
          line: 10,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'H',
            rank: 'field',
          },
          line: 11,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'I',
            rank: 'field',
          },
          line: 12,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'J',
            rank: 'field',
          },
          line: 13,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'K',
            rank: 'field',
          },
          line: 14,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'L',
            rank: 'field',
          },
          line: 15,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'new',
            rank: 'field',
          },
          line: 16,
          column: 5,
        },
      ],
    },
    {
      code: `
// no accessibility === public
type Foo = {
    new();
    A: string;
    G();
    B: string;
    H();
    C: string;
    I();
    D: string;
    J();
    E: string;
    K();
    F: string;
    L();
}
            `,
      options: [
        {
          typeLiterals: ['constructor', 'field', 'method'],
        },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'B',
            rank: 'method',
          },
          line: 7,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'C',
            rank: 'method',
          },
          line: 9,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'D',
            rank: 'method',
          },
          line: 11,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'E',
            rank: 'method',
          },
          line: 13,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'F',
            rank: 'method',
          },
          line: 15,
          column: 5,
        },
      ],
    },
    {
      code: `
class Foo {
    public static A: string = "";
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    constructor() {}
    public J() {}
    protected K() {}
    private L() {}
    public static G() {}
    protected static H() {}
    private static I() {}
}
            `,
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'G',
            rank: 'public instance method',
          },
          line: 13,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'H',
            rank: 'public instance method',
          },
          line: 14,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'I',
            rank: 'public instance method',
          },
          line: 15,
          column: 5,
        },
      ],
    },
    {
      code: `
class Foo {
    constructor() {}
    public static A: string = "";
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    public J() {}
    protected K() {}
    private L() {}
    public static G() {}
    protected static H() {}
    private static I() {}
}
            `,
      options: [{ default: ['field', 'constructor', 'method'] }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'A',
            rank: 'constructor',
          },
          line: 4,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'B',
            rank: 'constructor',
          },
          line: 5,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'C',
            rank: 'constructor',
          },
          line: 6,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'D',
            rank: 'constructor',
          },
          line: 7,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'E',
            rank: 'constructor',
          },
          line: 8,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'F',
            rank: 'constructor',
          },
          line: 9,
          column: 5,
        },
      ],
    },
    {
      code: `
class Foo {
    constructor() {}
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    public static G() {}
    public static A: string;
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
}
            `,
      options: [{ default: ['field', 'method'] }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'A',
            rank: 'method',
          },
          line: 10,
          column: 5,
        },
      ],
    },
    {
      code: `
class Foo {
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
    public static A: string;
    public static G() {}
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    constructor() {}
}
            `,
      options: [{ default: ['method', 'field'] }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'G',
            rank: 'field',
          },
          line: 9,
          column: 5,
        },
      ],
    },
    {
      code: `
class Foo {
    public static G() {}
    protected static H() {}
    protected static B: string = "";
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
    public static A: string;
    constructor() {}
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
      options: [{ classes: ['method', 'constructor', 'field'] }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'I',
            rank: 'field',
          },
          line: 6,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'J',
            rank: 'field',
          },
          line: 7,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'K',
            rank: 'field',
          },
          line: 8,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'L',
            rank: 'field',
          },
          line: 9,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'constructor',
            rank: 'field',
          },
          line: 11,
          column: 5,
        },
      ],
    },
    {
      code: `
class Foo {
    public static A: string;
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
    constructor() {}
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
      options: [
        {
          default: ['field', 'constructor', 'method'],
          classes: ['method', 'constructor', 'field'],
        },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'G',
            rank: 'field',
          },
          line: 4,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'H',
            rank: 'field',
          },
          line: 5,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'I',
            rank: 'field',
          },
          line: 6,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'J',
            rank: 'field',
          },
          line: 7,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'K',
            rank: 'field',
          },
          line: 8,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'L',
            rank: 'field',
          },
          line: 9,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'constructor',
            rank: 'field',
          },
          line: 10,
          column: 5,
        },
      ],
    },
    {
      code: `
class Foo {
    private L() {}
    public J() {}
    public static G() {}
    protected static H() {}
    private static I() {}
    protected K() {}
    constructor() {}
    public D: string = "";
    private static C: string = "";
    public static A: string;
    private static C: string = "";
    protected static B: string = "";
    private F: string = "";
    protected static B: string = "";
    protected E: string = "";
}
            `,
      options: [
        {
          classes: [
            'public-method',
            'constructor',
            'public-field',
            'private-field',
            'protected-field',
          ],
        },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'A',
            rank: 'private field',
          },
          line: 12,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'F',
            rank: 'protected field',
          },
          line: 15,
          column: 5,
        },
      ],
    },
    {
      code: `
class Foo {
    public static G() {}
    private static I() {}
    public J() {}
    protected static H() {}
    private L() {}
    protected K() {}
    public D: string = "";
    constructor() {}
    public static A: string;
    protected static B: string = "";
    protected E: string = "";
    private static C: string = "";
    private F: string = "";
}
            `,
      options: [
        {
          classes: [
            'public-static-method',
            'static-method',
            'public-instance-method',
            'instance-method',
            'constructor',
            'public-field',
            'protected-field',
            'private-field',
          ],
        },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'H',
            rank: 'public instance method',
          },
          line: 6,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'constructor',
            rank: 'public field',
          },
          line: 10,
          column: 5,
        },
      ],
    },
    {
      code: `
class Foo {
    public J() {}
    public static G() {}
    public D: string = "";
    public static A: string = "";
    private L() {}
    constructor() {}
    protected K() {}
    protected static H() {}
    private static I() {}
    protected static B: string = "";
    private static C: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
      options: [
        {
          default: [
            'public-method',
            'public-field',
            'constructor',
            'method',
            'field',
          ],
        },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'constructor',
            rank: 'method',
          },
          line: 8,
          column: 5,
        },
      ],
    },
    {
      code: `
class Foo {
    public J() {}
    private static I() {}
    public static G() {}
    protected static H() {}
    protected K() {}
    private L() {}
    constructor() {}
    public static A: string;
    private F: string = "";
    protected static B: string = "";
    public D: string = "";
    private static C: string = "";
    protected E: string = "";
}
            `,
      options: [
        {
          classes: [
            'public-method',
            'protected-static-method',
            'private-static-method',
            'protected-instance-method',
            'private-instance-method',
            'constructor',
            'field',
          ],
        },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'G',
            rank: 'private static method',
          },
          line: 5,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'H',
            rank: 'private static method',
          },
          line: 6,
          column: 5,
        },
      ],
    },
    {
      code: `
class Foo {
    private static I() {}
    protected static H() {}
    protected static B: string = "";
    public static G() {}
    public J() {}
    protected K() {}
    private static C: string = "";
    private L() {}
    private F: string = "";
    protected E: string = "";
    public static A: string;
    public D: string = "";
    constructor() {}
}
            `,
      options: [
        {
          classes: ['private-instance-method', 'protected-static-field'],
        },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'L',
            rank: 'protected static field',
          },
          line: 10,
          column: 5,
        },
      ],
    },
    {
      code: `
class Foo {
    private L() {}
    private static I() {}
    protected static H() {}
    public static G() {}
    protected static B: string = "";
    public J() {}
    protected K() {}
    private static C: string = "";
    private F: string = "";
    protected E: string = "";
    public static A: string;
    public D: string = "";
    constructor() {}

}
            `,
      options: [
        {
          default: ['public-instance-method', 'protected-static-field'],
        },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'J',
            rank: 'protected static field',
          },
          line: 8,
          column: 5,
        },
      ],
    },
    {
      code: `
const foo = class Foo {
    public static A: string = "";
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    constructor() {}
    public J() {}
    protected K() {}
    private L() {}
    public static G() {}
    protected static H() {}
    private static I() {}
}
            `,
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'G',
            rank: 'public instance method',
          },
          line: 13,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'H',
            rank: 'public instance method',
          },
          line: 14,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'I',
            rank: 'public instance method',
          },
          line: 15,
          column: 5,
        },
      ],
    },
    {
      code: `
const foo = class {
    constructor() {}
    public static A: string = "";
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    public J() {}
    protected K() {}
    private L() {}
    public static G() {}
    protected static H() {}
    private static I() {}
}
            `,
      options: [{ default: ['field', 'constructor', 'method'] }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'A',
            rank: 'constructor',
          },
          line: 4,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'B',
            rank: 'constructor',
          },
          line: 5,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'C',
            rank: 'constructor',
          },
          line: 6,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'D',
            rank: 'constructor',
          },
          line: 7,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'E',
            rank: 'constructor',
          },
          line: 8,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'F',
            rank: 'constructor',
          },
          line: 9,
          column: 5,
        },
      ],
    },
    {
      code: `
const foo = class {
    constructor() {}
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    public static G() {}
    public static A: string;
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
}
            `,
      options: [{ default: ['field', 'method'] }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'A',
            rank: 'method',
          },
          line: 10,
          column: 5,
        },
      ],
    },
    {
      code: `
const foo = class {
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
    public static A: string;
    public static G() {}
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
    constructor() {}
}
            `,
      options: [{ default: ['method', 'field'] }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'G',
            rank: 'field',
          },
          line: 9,
          column: 5,
        },
      ],
    },
    {
      code: `
const foo = class {
    public static G() {}
    protected static H() {}
    protected static B: string = "";
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
    public static A: string;
    constructor() {}
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
      options: [{ classExpressions: ['method', 'constructor', 'field'] }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'I',
            rank: 'field',
          },
          line: 6,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'J',
            rank: 'field',
          },
          line: 7,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'K',
            rank: 'field',
          },
          line: 8,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'L',
            rank: 'field',
          },
          line: 9,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'constructor',
            rank: 'field',
          },
          line: 11,
          column: 5,
        },
      ],
    },
    {
      code: `
const foo = class {
    public static A: string;
    public static G() {}
    protected static H() {}
    private static I() {}
    public J() {}
    protected K() {}
    private L() {}
    constructor() {}
    protected static B: string = "";
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
      options: [
        {
          default: ['field', 'constructor', 'method'],
          classExpressions: ['method', 'constructor', 'field'],
        },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'G',
            rank: 'field',
          },
          line: 4,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'H',
            rank: 'field',
          },
          line: 5,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'I',
            rank: 'field',
          },
          line: 6,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'J',
            rank: 'field',
          },
          line: 7,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'K',
            rank: 'field',
          },
          line: 8,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'L',
            rank: 'field',
          },
          line: 9,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'constructor',
            rank: 'field',
          },
          line: 10,
          column: 5,
        },
      ],
    },
    {
      code: `
const foo = class {
    private L() {}
    public J() {}
    public static G() {}
    protected static H() {}
    private static I() {}
    protected K() {}
    constructor() {}
    public D: string = "";
    private static C: string = "";
    public static A: string;
    private static C: string = "";
    protected static B: string = "";
    private F: string = "";
    protected static B: string = "";
    protected E: string = "";
}
            `,
      options: [
        {
          classExpressions: [
            'public-method',
            'constructor',
            'public-field',
            'private-field',
            'protected-field',
          ],
        },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'A',
            rank: 'private field',
          },
          line: 12,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'F',
            rank: 'protected field',
          },
          line: 15,
          column: 5,
        },
      ],
    },
    {
      code: `
const foo = class {
    public static G() {}
    private static I() {}
    public J() {}
    protected static H() {}
    private L() {}
    protected K() {}
    public D: string = "";
    constructor() {}
    public static A: string;
    protected static B: string = "";
    protected E: string = "";
    private static C: string = "";
    private F: string = "";
}
            `,
      options: [
        {
          classExpressions: [
            'public-static-method',
            'static-method',
            'public-instance-method',
            'instance-method',
            'constructor',
            'public-field',
            'protected-field',
            'private-field',
          ],
        },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'H',
            rank: 'public instance method',
          },
          line: 6,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'constructor',
            rank: 'public field',
          },
          line: 10,
          column: 5,
        },
      ],
    },
    {
      code: `
const foo = class {
    public J() {}
    public static G() {}
    public D: string = "";
    public static A: string = "";
    private L() {}
    constructor() {}
    protected K() {}
    protected static H() {}
    private static I() {}
    protected static B: string = "";
    private static C: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
      options: [
        {
          default: [
            'public-method',
            'public-field',
            'constructor',
            'method',
            'field',
          ],
        },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'constructor',
            rank: 'method',
          },
          line: 8,
          column: 5,
        },
      ],
    },
    {
      code: `
const foo = class {
    public J() {}
    private static I() {}
    public static G() {}
    protected static H() {}
    protected K() {}
    private L() {}
    constructor() {}
    public static A: string;
    private F: string = "";
    protected static B: string = "";
    public D: string = "";
    private static C: string = "";
    protected E: string = "";
}
            `,
      options: [
        {
          classExpressions: [
            'public-method',
            'protected-static-method',
            'private-static-method',
            'protected-instance-method',
            'private-instance-method',
            'constructor',
            'field',
          ],
        },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'G',
            rank: 'private static method',
          },
          line: 5,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'H',
            rank: 'private static method',
          },
          line: 6,
          column: 5,
        },
      ],
    },
    {
      code: `
const foo = class {
    private static I() {}
    protected static H() {}
    protected static B: string = "";
    public static G() {}
    public J() {}
    protected K() {}
    private static C: string = "";
    private L() {}
    private F: string = "";
    protected E: string = "";
    public static A: string;
    public D: string = "";
    constructor() {}

}
            `,
      options: [
        {
          classExpressions: [
            'private-instance-method',
            'protected-static-field',
          ],
        },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'L',
            rank: 'protected static field',
          },
          line: 10,
          column: 5,
        },
      ],
    },
    {
      code: `
const foo = class {
    private L() {}
    private static I() {}
    protected static H() {}
    public static G() {}
    protected static B: string = "";
    public J() {}
    protected K() {}
    private static C: string = "";
    private F: string = "";
    protected E: string = "";
    public static A: string;
    public D: string = "";
    constructor() {}

}
            `,
      options: [
        {
          default: ['public-instance-method', 'protected-static-field'],
        },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'J',
            rank: 'protected static field',
          },
          line: 8,
          column: 5,
        },
      ],
    },

    {
      code: `
class Foo {
    K = () => {}
    A: string;
    constructor () {}
    J() {}
}
            `,
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'A',
            rank: 'public instance method',
          },
          line: 4,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'constructor',
            rank: 'public instance method',
          },
          line: 5,
          column: 5,
        },
      ],
    },
    {
      code: `
class Foo {
    J() {}
    constructor () {}
    K = () => {}
    A: string;
}
            `,
      options: [{ default: ['method', 'constructor', 'field'] }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'K',
            rank: 'constructor',
          },
          line: 5,
          column: 5,
        },
      ],
    },
    {
      code: `
class Foo {
    J() {}
    constructor () {}
    K = () => {}
    L: () => {}
    A: string;
}
            `,
      options: [{ default: ['method', 'constructor', 'field'] }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'K',
            rank: 'constructor',
          },
          line: 5,
          column: 5,
        },
      ],
    },
    {
      code: `
interface Foo {
    K: () => {}
    J();
    A: string;
}
            `,
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'A',
            rank: 'method',
          },
          line: 5,
          column: 5,
        },
      ],
    },
    {
      code: `
type Foo = {
    K: () => {}
    J();
    A: string;
}
            `,
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'A',
            rank: 'method',
          },
          line: 5,
          column: 5,
        },
      ],
    },
    {
      code: `
type Foo = {
    A: string;
    K: () => {}
    J();
}
            `,
      options: [{ default: ['method', 'constructor', 'field'] }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'J',
            rank: 'field',
          },
          line: 5,
          column: 5,
        },
      ],
    },
    {
      code: `
abstract class Foo {
    abstract A = () => {};
    B: string;
}
          `,
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'B',
            rank: 'public abstract method',
          },
          line: 4,
          column: 5,
        },
      ],
    },
    {
      code: `
abstract class Foo {
    abstract A: () => {};
    B: string;
    public C() {};
    private D() {};
    abstract E() {};
}
          `,
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'B',
            rank: 'public abstract field',
          },
          line: 4,
          column: 5,
        },
      ],
    },
    {
      code: `
abstract class Foo {
    B: string;
    abstract C = () => {};
    abstract A: () => {};
}
          `,
      options: [{ default: ['method', 'constructor', 'field'] }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'C',
            rank: 'field',
          },
          line: 4,
          column: 5,
        },
      ],
    },
    {
      code: `
class Foo {
    C: number;
    [A:string]: number;
    public static D(): {};
    private static [B:string]: number;
}
          `,
      options: [
        {
          default: [
            'field',
            'method',
            'public-static-method',
            'private-static-method',
          ],
        },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'D',
            rank: 'private static method',
          },
          line: 5,
          column: 5,
        },
      ],
    },
    {
      code: `
abstract class Foo {
    abstract B: string;
    abstract A(): void;
    public C(): {};

}
          `,
      options: [{ default: ['method', 'constructor', 'field'] }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'A',
            rank: 'field',
          },
          line: 4,
          column: 5,
        },
        {
          messageId: 'incorrectOrder',
          data: {
            name: 'C',
            rank: 'field',
          },
          line: 5,
          column: 5,
        },
      ],
    },
  ],
});
