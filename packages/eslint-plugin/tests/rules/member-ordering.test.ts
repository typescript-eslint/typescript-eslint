import rule, {
  defaultOrder,
  MessageIds,
  Options,
} from '../../src/rules/member-ordering';
import { RuleTester } from '../RuleTester';
import { TSESLint } from '@typescript-eslint/experimental-utils';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const grouped: TSESLint.RunTests<MessageIds, Options> = {
  valid: [
    `
// no accessibility === public
interface Foo {
    [Z: string]: any;
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
    [Z: string]: any;
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
    [Z: string]: any;
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
      options: [{ default: ['signature', 'field', 'constructor', 'method'] }],
    },

    {
      code: `
// no accessibility === public
interface Foo {
    A: string;
    J();
    K();
    D: string;
    [Z: string]: any;
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
    [Z: string]: any;
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
        { interfaces: ['signature', 'method', 'constructor', 'field'] },
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
    new();
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
    F: string;
    [Z: string]: any;
}
            `,
      options: [
        {
          default: ['signature', 'field', 'constructor', 'method'],
          interfaces: ['method', 'constructor', 'field', 'signature'],
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
    [Z: string]: any;
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
    [Z: string]: any;
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
    [Z: string]: any;
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
    [Z: string]: any;
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
    [Z: string]: any;
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
      options: [{ default: ['signature', 'field', 'constructor', 'method'] }],
    },
    {
      code: `
// no accessibility === public
type Foo = {
    [Z: string]: any;
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
    [Z: string]: any;
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
    [Z: string]: any;
}
            `,
      options: [{ typeLiterals: ['method', 'field', 'signature'] }],
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
    [Z: string]: any;
}
            `,
      options: [
        { typeLiterals: ['method', 'constructor', 'field', 'signature'] },
      ],
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
    [Z: string]: any;
}
            `,
      options: [
        {
          default: ['signature', 'field', 'constructor', 'method'],
          typeLiterals: ['method', 'constructor', 'field', 'signature'],
        },
      ],
    },
    {
      code: `
// no accessibility === public
type Foo = {
    [Z: string]: any;
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
          typeLiterals: ['signature', 'field', 'method'],
        },
      ],
    },
    `
class Foo {
    [Z: string]: any;
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
    [Z: string]: any;
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
    [Z: string]: any;
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
      options: [{ default: ['signature', 'field', 'constructor', 'method'] }],
    },
    {
      code: `
class Foo {
    [Z: string]: any;
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
    [Z: string]: any;
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
    [Z: string]: any;
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
    [Z: string]: any;
}
            `,
      options: [{ classes: ['method', 'constructor', 'field', 'signature'] }],
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
    [Z: string]: any;
}
            `,
      options: [
        {
          default: ['signature', 'field', 'constructor', 'method'],
          classes: ['method', 'constructor', 'field', 'signature'],
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
    [Z: string]: any;
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
            'signature',
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
    [Z: string]: any;
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
            'signature',
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
    [Z: string]: any;
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
            'signature',
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
    [Z: string]: any;
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
            'signature',
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
    [Z: string]: any;
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
    [Z: string]: any;
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
    [Z: string]: any;
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
    [Z: string]: any;
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
    [Z: string]: any;
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
    [Z: string]: any;
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
    [Z: string]: any;
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
    [Z: string]: any;
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
      options: [{ default: ['signature', 'field', 'constructor', 'method'] }],
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
    [Z: string]: any;
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
    [Z: string]: any;
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
    [Z: string]: any;
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
    [Z: string]: any;
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
        { classExpressions: ['method', 'signature', 'constructor', 'field'] },
      ],
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
    [Z: string]: any;
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
          classExpressions: ['method', 'signature', 'constructor', 'field'],
        },
      ],
    },
    {
      code: `
const foo = class Foo {
    [Z: string]: any;
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
    [Z: string]: any;
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
    [Z: string]: any;
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
    [Z: string]: any;
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
    [Z: string]: any;
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
    [Z: string]: any;
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
    [Z: string]: any;
}
            `,
      options: [{ default: ['method', 'constructor', 'field', 'signature'] }],
    },
    {
      code: `
class Foo {
    J() {}
    K = () => {}
    constructor () {}
    [Z: string]: any;
    A: string;
    L: () => {}
}
            `,
      options: [{ default: ['method', 'constructor', 'signature', 'field'] }],
    },
    `
interface Foo {
    [Z: string]: any;
    A: string;
    K: () => {};
    J();
}
        `,
    {
      code: `
interface Foo {
    [Z: string]: any;
    J();
    K: () => {}
    A: string;
}
            `,
      options: [{ default: ['signature', 'method', 'constructor', 'field'] }],
    },
    `
type Foo = {
    [Z: string]: any;
    A: string;
    K: () => {}
    J();
}
        `,
    {
      code: `
type Foo = {
    J();
    [Z: string]: any;
    K: () => {}
    A: string;
}
            `,
      options: [{ default: ['method', 'constructor', 'signature', 'field'] }],
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
    [A:string]: number;
    public B: string;
}
    `,
    },
    {
      code: `
abstract class Foo {
    [Z: string]: any;
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
      options: [{ classes: ['signature', 'field', 'constructor', 'method'] }],
    },
    {
      code: `
class Foo {
    @Dec() B: string;
    @Dec() A: string;
    constructor() {}
    D: string;
    C: string;
    E(): void;
    F(): void;
}           `,
      options: [{ default: ['decorated-field', 'field'] }],
    },
    {
      code: `
class Foo {
    A: string;
    B: string;
    @Dec() private C: string;
    private D: string;
}           `,
      options: [
        {
          default: ['public-field', 'private-decorated-field', 'private-field'],
        },
      ],
    },
    {
      code: `
class Foo {
    constructor() {}
    @Dec() public A(): void;
    @Dec() private B: string;
    private C(): void;
    private D: string;
}           `,
      options: [
        {
          default: [
            'decorated-method',
            'private-decorated-field',
            'private-method',
          ],
        },
      ],
    },
    {
      code: `
class Foo {
    @Dec() private A(): void;
    @Dec() private B: string;
    constructor() {}
    private C(): void;
    private D: string;
}           `,
      options: [
        {
          default: [
            'private-decorated-method',
            'private-decorated-field',
            'constructor',
            'private-field',
          ],
        },
      ],
    },
    {
      code: `
class Foo {
    public A: string;
    @Dec() private B: string;
}           `,
      options: [
        {
          default: ['private-decorated-field', 'public-instance-field'],
          classes: ['public-instance-field', 'private-decorated-field'],
        },
      ],
    },
    // class + ignore decorator
    {
      code: `
class Foo {
    public A(): string;
    @Dec() public B(): string;
    public C(): string;

    d: string;
}           `,
      options: [
        {
          default: ['public-method', 'field'],
        },
      ],
    },
  ],
  invalid: [
    {
      code: `
// no accessibility === public
interface Foo {
    [Z: string]: any;
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
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'new',
            rank: 'method',
          },
          line: 17,
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
    [Z: string]: any;
}
            `,
      options: [{ default: ['signature', 'method', 'constructor', 'field'] }],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'G',
            rank: 'field',
          },
          line: 10,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'H',
            rank: 'field',
          },
          line: 11,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'I',
            rank: 'field',
          },
          line: 12,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'J',
            rank: 'field',
          },
          line: 13,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'K',
            rank: 'field',
          },
          line: 14,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'L',
            rank: 'field',
          },
          line: 15,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'new',
            rank: 'field',
          },
          line: 16,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'Z',
            rank: 'field',
          },
          line: 17,
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
    [Z: string]: any;
}
            `,
      options: [
        { interfaces: ['method', 'signature', 'constructor', 'field'] },
      ],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'G',
            rank: 'field',
          },
          line: 10,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'H',
            rank: 'field',
          },
          line: 11,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'I',
            rank: 'field',
          },
          line: 12,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'J',
            rank: 'field',
          },
          line: 13,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'K',
            rank: 'field',
          },
          line: 14,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'L',
            rank: 'field',
          },
          line: 15,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'new',
            rank: 'field',
          },
          line: 16,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'Z',
            rank: 'field',
          },
          line: 17,
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
    [Z: string]: any;
}
            `,
      options: [
        {
          default: ['field', 'method', 'constructor', 'signature'],
          interfaces: ['method', 'signature', 'constructor', 'field'],
        },
      ],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'G',
            rank: 'field',
          },
          line: 10,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'H',
            rank: 'field',
          },
          line: 11,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'I',
            rank: 'field',
          },
          line: 12,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'J',
            rank: 'field',
          },
          line: 13,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'K',
            rank: 'field',
          },
          line: 14,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'L',
            rank: 'field',
          },
          line: 15,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'new',
            rank: 'field',
          },
          line: 16,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'Z',
            rank: 'field',
          },
          line: 17,
          column: 5,
        },
      ],
    },
    {
      code: `
// no accessibility === public
interface Foo {
    [Z: string]: any;
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
          interfaces: ['signature', 'constructor', 'field', 'method'],
        },
      ],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'B',
            rank: 'method',
          },
          line: 8,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'C',
            rank: 'method',
          },
          line: 10,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'D',
            rank: 'method',
          },
          line: 12,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'E',
            rank: 'method',
          },
          line: 14,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'F',
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
    [Z: string]: any;
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
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'new',
            rank: 'method',
          },
          line: 17,
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
    [Z: string]: any;
    new();
}
            `,
      options: [{ default: ['method', 'constructor', 'signature', 'field'] }],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'G',
            rank: 'field',
          },
          line: 10,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'H',
            rank: 'field',
          },
          line: 11,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'I',
            rank: 'field',
          },
          line: 12,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'J',
            rank: 'field',
          },
          line: 13,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'K',
            rank: 'field',
          },
          line: 14,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'L',
            rank: 'field',
          },
          line: 15,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'Z',
            rank: 'field',
          },
          line: 16,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'new',
            rank: 'field',
          },
          line: 17,
          column: 5,
        },
      ],
    },
    {
      code: `
// no accessibility === public
type Foo = {
    [Z: string]: any;
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
        { typeLiterals: ['method', 'constructor', 'signature', 'field'] },
      ],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'G',
            rank: 'signature',
          },
          line: 11,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'H',
            rank: 'signature',
          },
          line: 12,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'I',
            rank: 'signature',
          },
          line: 13,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'J',
            rank: 'signature',
          },
          line: 14,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'K',
            rank: 'signature',
          },
          line: 15,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'L',
            rank: 'signature',
          },
          line: 16,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'new',
            rank: 'signature',
          },
          line: 17,
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
    [Z: string]: any;
}
            `,
      options: [
        {
          default: ['field', 'method', 'constructor', 'signature'],
          typeLiterals: ['signature', 'method', 'constructor', 'field'],
        },
      ],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'G',
            rank: 'field',
          },
          line: 10,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'H',
            rank: 'field',
          },
          line: 11,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'I',
            rank: 'field',
          },
          line: 12,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'J',
            rank: 'field',
          },
          line: 13,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'K',
            rank: 'field',
          },
          line: 14,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'L',
            rank: 'field',
          },
          line: 15,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'new',
            rank: 'field',
          },
          line: 16,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'Z',
            rank: 'field',
          },
          line: 17,
          column: 5,
        },
      ],
    },
    {
      code: `
// no accessibility === public
type Foo = {
    new();
    [Z: string]: any;
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
          typeLiterals: ['constructor', 'signature', 'field', 'method'],
        },
      ],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'B',
            rank: 'method',
          },
          line: 8,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'C',
            rank: 'method',
          },
          line: 10,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'D',
            rank: 'method',
          },
          line: 12,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'E',
            rank: 'method',
          },
          line: 14,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'F',
            rank: 'method',
          },
          line: 16,
          column: 5,
        },
      ],
    },
    {
      code: `
class Foo {
    [Z: string]: any;
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
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'G',
            rank: 'public instance method',
          },
          line: 14,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'H',
            rank: 'public instance method',
          },
          line: 15,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'I',
            rank: 'public instance method',
          },
          line: 16,
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
    [Z: string]: any;
}
            `,
      options: [{ default: ['field', 'constructor', 'method', 'signature'] }],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'A',
            rank: 'constructor',
          },
          line: 4,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'B',
            rank: 'constructor',
          },
          line: 5,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'C',
            rank: 'constructor',
          },
          line: 6,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'D',
            rank: 'constructor',
          },
          line: 7,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'E',
            rank: 'constructor',
          },
          line: 8,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
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
          messageId: 'incorrectGroupOrder',
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
          messageId: 'incorrectGroupOrder',
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
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'I',
            rank: 'field',
          },
          line: 6,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'J',
            rank: 'field',
          },
          line: 7,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'K',
            rank: 'field',
          },
          line: 8,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'L',
            rank: 'field',
          },
          line: 9,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
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
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'G',
            rank: 'field',
          },
          line: 4,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'H',
            rank: 'field',
          },
          line: 5,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'I',
            rank: 'field',
          },
          line: 6,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'J',
            rank: 'field',
          },
          line: 7,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'K',
            rank: 'field',
          },
          line: 8,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'L',
            rank: 'field',
          },
          line: 9,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
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
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'A',
            rank: 'private field',
          },
          line: 12,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
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
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'H',
            rank: 'public instance method',
          },
          line: 6,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
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
          messageId: 'incorrectGroupOrder',
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
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'G',
            rank: 'private static method',
          },
          line: 5,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
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
          messageId: 'incorrectGroupOrder',
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
          messageId: 'incorrectGroupOrder',
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
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'G',
            rank: 'public instance method',
          },
          line: 13,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'H',
            rank: 'public instance method',
          },
          line: 14,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
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
    [Z: string]: any;
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
      options: [{ default: ['signature', 'field', 'constructor', 'method'] }],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'A',
            rank: 'constructor',
          },
          line: 5,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'B',
            rank: 'constructor',
          },
          line: 6,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'C',
            rank: 'constructor',
          },
          line: 7,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'D',
            rank: 'constructor',
          },
          line: 8,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'E',
            rank: 'constructor',
          },
          line: 9,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'F',
            rank: 'constructor',
          },
          line: 10,
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
    [Z: string]: any;
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
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'A',
            rank: 'method',
          },
          line: 11,
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
          messageId: 'incorrectGroupOrder',
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
    [Z: string]: any;
    private static C: string = "";
    public D: string = "";
    protected E: string = "";
    private F: string = "";
}
            `,
      options: [{ classExpressions: ['method', 'constructor', 'field'] }],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'I',
            rank: 'field',
          },
          line: 6,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'J',
            rank: 'field',
          },
          line: 7,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'K',
            rank: 'field',
          },
          line: 8,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'L',
            rank: 'field',
          },
          line: 9,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
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
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'G',
            rank: 'field',
          },
          line: 4,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'H',
            rank: 'field',
          },
          line: 5,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'I',
            rank: 'field',
          },
          line: 6,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'J',
            rank: 'field',
          },
          line: 7,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'K',
            rank: 'field',
          },
          line: 8,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'L',
            rank: 'field',
          },
          line: 9,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
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
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'A',
            rank: 'private field',
          },
          line: 12,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
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
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'H',
            rank: 'public instance method',
          },
          line: 6,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
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
          messageId: 'incorrectGroupOrder',
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
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'G',
            rank: 'private static method',
          },
          line: 5,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
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
          messageId: 'incorrectGroupOrder',
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
          messageId: 'incorrectGroupOrder',
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
    [Z: string]: any;
    J() {}
}
            `,
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'A',
            rank: 'public instance method',
          },
          line: 4,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'constructor',
            rank: 'public instance method',
          },
          line: 5,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'Z',
            rank: 'public instance method',
          },
          line: 6,
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
    [Z: string]: any;
}
            `,
      options: [{ default: ['method', 'constructor', 'field', 'signature'] }],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
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
          messageId: 'incorrectGroupOrder',
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
          messageId: 'incorrectGroupOrder',
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
          messageId: 'incorrectGroupOrder',
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
          messageId: 'incorrectGroupOrder',
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
          messageId: 'incorrectGroupOrder',
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
          messageId: 'incorrectGroupOrder',
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
          messageId: 'incorrectGroupOrder',
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
            'signature',
          ],
        },
      ],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'D',
            rank: 'signature',
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
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'A',
            rank: 'field',
          },
          line: 4,
          column: 5,
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'C',
            rank: 'field',
          },
          line: 5,
          column: 5,
        },
      ],
    },
    {
      code: `
// no accessibility === public
class Foo {
    B: string;
    @Dec() A: string = "";
    C: string = "";
    constructor() {}
    D() {}
    E() {}
}           `,
      options: [{ default: ['decorated-field', 'field'] }],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'A',
            rank: 'field',
          },
          line: 5,
          column: 5,
        },
      ],
    },
    {
      code: `
class Foo {
    A() {}

    @Decorator()
    B() {}
}           `,
      options: [{ default: ['decorated-method', 'method'] }],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'B',
            rank: 'method',
          },
          line: 5, // Symbol starts at the line with decorator
          column: 5,
        },
      ],
    },
    {
      code: `
class Foo {
    @Decorator() C() {}
    A() {}
}           `,
      options: [{ default: ['public-method', 'decorated-method'] }],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'A',
            rank: 'decorated method',
          },
          line: 4,
          column: 5,
        },
      ],
    },
    {
      code: `
class Foo {
    A(): void;
    B(): void;
    private C() {}
    constructor() {}
    @Dec() private D() {}
}           `,
      options: [
        {
          classes: ['public-method', 'decorated-method', 'private-method'],
        },
      ],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'D',
            rank: 'private method',
          },
          line: 7,
          column: 5,
        },
      ],
    },
  ],
};

const sortedWithoutGroupingDefaultOption: TSESLint.RunTests<
  MessageIds,
  Options
> = {
  valid: [
    // default option + interface + multiple types
    {
      code: `
interface Foo {
  a(): Foo;
  (): Foo;
  b(): Foo;
}
            `,
      options: [
        { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
      ],
    },

    // default option + interface + lower/upper case
    {
      code: `
interface Foo {
  A : b;
  a : b;
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // default option + interface + numbers
    {
      code: `
interface Foo {
  a1 : b;
  aa : b;
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // default option + type literal + multiple types
    {
      code: `
type Foo = {
  a : b;
  [a: string] : number;
  b() : void;
  new () : Bar;
  () : Baz;
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // default option + type literal + lower/upper case
    {
      code: `
type Foo = {
  A : b;
  a : b;
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // default option + type literal + numbers
    {
      code: `
type Foo = {
  a1 : b;
  aa : b;
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // default option + class + multiple types
    {
      code: `
class Foo {
  public static a : string;
  protected static b : string = "";
  private static c : string = "";
  constructor() {}
  @Dec() d: string;
  public e : string = "";
  @Dec() f : string = "";
  protected g : string = "";
  private h : string = "";
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // default option + class + lower/upper case
    {
      code: `
class Foo {
  public static A : string;
  public static a : string;
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // default option + class + numbers
    {
      code: `
class Foo {
  public static a1 : string;
  public static aa : string;
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // default option + class expression + multiple types
    {
      code: `
const foo = class Foo {
  public static a : string;
  protected static b : string = "";
  private static c : string = "";
  constructor() {}
  public d : string = "";
  protected e : string = "";
  private f : string = "";
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // default option + class expression + lower/upper case
    {
      code: `
const foo = class Foo {
  public static A : string;
  public static a : string;
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // default option + class expression + numbers
    {
      code: `
const foo = class Foo {
  public static a1 : string;
  public static aa : string;
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // default option + class + decorators
    {
      code: `
class Foo {
  public static a : string;
  @Dec() static b : string;
  public static c : string;
}
            `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
    },
  ],
  invalid: [
    // default option + interface + wrong order
    {
      code: `
interface Foo {
  b() : void;
  a : b;
  [a: string] : number;
  new () : Bar;
  () : Baz;
}
          `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },

    // default option + interface + wrong order (multiple)
    {
      code: `
interface Foo {
  c : string;
  b : string;
  a : string;
}
          `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'b',
            beforeMember: 'c',
          },
        },
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },

    // default option + type literal + wrong order
    {
      code: `
type Foo = {
  b() : void;
  a : b;
  [a: string] : number;
  new () : Bar;
  () : Baz;
}
          `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },

    // default option + type literal + wrong order (multiple)
    {
      code: `
type Foo = {
  c : string;
  b : string;
  a : string;
}
          `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'b',
            beforeMember: 'c',
          },
        },
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },

    // default option + class + wrong order
    {
      code: `
class Foo {
  protected static b : string = "";
  public static a : string;
  private static c : string = "";
  constructor() {}
  public d : string = "";
  protected e : string = "";
  private f : string = "";
}
          `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },

    // default option + class + wrong order (multiple)
    {
      code: `
class Foo {
  public static c: string;
  public static b: string;
  public static a: string;
}
          `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'b',
            beforeMember: 'c',
          },
        },
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },

    // default option + class expression + wrong order
    {
      code: `
const foo = class Foo {
  protected static b : string = "";
  public static a : string;
  private static c : string = "";
  constructor() {}
  public d : string = "";
  protected e : string = "";
  private f : string = "";
}
          `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },

    // default option + class expression + wrong order (multiple)
    {
      code: `
const foo = class Foo {
  public static c: string;
  public static b: string;
  public static a: string;
}
          `,
      options: [{ default: { memberTypes: 'never', order: 'alphabetically' } }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'b',
            beforeMember: 'c',
          },
        },
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },
  ],
};

const sortedWithoutGroupingClassesOption: TSESLint.RunTests<
  MessageIds,
  Options
> = {
  valid: [
    // classes option + interface + multiple types --> Only member group order is checked (default config)
    {
      code: `
interface Foo {
  [a: string] : number;
  c : b;
  new () : Bar;
  b() : void;
  () : Baz;
}
            `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // classes option + interface + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
interface Foo {
  a : b;
  A : b;
}
            `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // classes option + interface + numbers --> Only member group order is checked (default config)
    {
      code: `
interface Foo {
  aa : b;
  a1 : b;
}
            `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // classes option + type literal + multiple types --> Only member group order is checked (default config)
    {
      code: `
type Foo = {
  [a: string] : number;
  c : b;
  new () : Bar;
  b() : void;
  () : Baz;
}
            `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // classes option + type literal + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
type Foo = {
  a : b;
  A : b;
}
            `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // classes option + type literal + numbers --> Only member group order is checked (default config)
    {
      code: `
type Foo = {
  aa : b;
  a1 : b;
}
            `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // classes option + class + multiple types
    {
      code: `
class Foo {
  public static a : string;
  protected static b : string = "";
  @Dec() private static c : string = "";
  constructor() {}
  public d : string = "";
  protected e : string = "";
  @Dec()
  private f : string = "";
}
            `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // classes option + class + lower/upper case
    {
      code: `
class Foo {
  public static A : string;
  public static a : string;
}
            `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // classes option + class + numbers
    {
      code: `
class Foo {
  public static a1 : string;
  public static aa : string;
}
            `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // classes option + class expression + multiple types --> Only member group order is checked (default config)
    {
      code: `
const foo = class Foo {
  public static a : string;
  protected static b : string = "";
  private static c : string = "";
  public d : string = "";
  protected e : string = "";
  private f : string = "";
  constructor() {}
}
            `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // classes option + class expression + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
const foo = class Foo {
  public static a : string;
  public static A : string;
}
            `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
    },

    // classes option + class expression + numbers --> Only member group order is checked (default config)
    {
      code: `
const foo = class Foo {
  public static aa : string;
  public static a1 : string;
}
            `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
    },
  ],
  invalid: [
    // classes option + class + wrong order
    {
      code: `
class Foo {
  protected static b : string = "";
  public static a : string;
  private static c : string = "";
  constructor() {}
  public d : string = "";
  protected e : string = "";
  private f : string = "";
}
          `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },

    // classes option + class + wrong order (multiple)
    {
      code: `
class Foo {
  public static c: string;
  public static b: string;
  public static a: string;
}
          `,
      options: [{ classes: { memberTypes: 'never', order: 'alphabetically' } }],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'b',
            beforeMember: 'c',
          },
        },
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },
  ],
};

const sortedWithoutGroupingClassExpressionsOption: TSESLint.RunTests<
  MessageIds,
  Options
> = {
  valid: [
    // classExpressions option + interface + multiple types --> Only member group order is checked (default config)
    {
      code: `
interface Foo {
  [a: string] : number;
  c : b;
  new () : Bar;
  b() : void;
  () : Baz;
}
            `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // classExpressions option + interface + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
interface Foo {
  a : b;
  A : b;
}
            `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // classExpressions option + interface + numbers --> Only member group order is checked (default config)
    {
      code: `
interface Foo {
  aa : b;
  a1 : b;
}
            `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // classExpressions option + type literal + multiple types --> Only member group order is checked (default config)
    {
      code: `
type Foo = {
  [a: string] : number;
  c : b;
  new () : Bar;
  b() : void;
  () : Baz;
}
            `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // classExpressions option + type literal + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
type Foo = {
  a : b;
  A : b;
}
            `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // classExpressions option + type literal + numbers --> Only member group order is checked (default config)
    {
      code: `
type Foo = {
  aa : b;
  a1 : b;
}
            `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // classExpressions option + class + multiple types --> Only member group order is checked (default config)
    {
      code: `
class Foo {
  public static a : string;
  protected static b : string = "";
  private static c : string = "";
  public d : string = "";
  protected e : string = "";
  private f : string = "";
  constructor() {}
}
            `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // classExpressions option + class + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
class Foo {
  public static a : string;
  public static A : string;
}
            `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // classExpressions option + class + numbers --> Only member group order is checked (default config)
    {
      code: `
class Foo {
  public static aa : string;
  public static a1 : string;
}
            `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // classExpressions option + class expression + multiple types
    {
      code: `
const foo = class Foo {
  public static a : string;
  protected static b : string = "";
  private static c : string = "";
  constructor() {}
  public d : string = "";
  protected e : string = "";
  private f : string = "";
}
            `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // classExpressions option + class expression + lower/upper case
    {
      code: `
const foo = class Foo {
  public static A : string;
  public static a : string;
}
            `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // classExpressions option + class expression + numbers
    {
      code: `
const foo = class Foo {
  public static a1 : string;
  public static aa : string;
}
            `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },
  ],
  invalid: [
    // classExpressions option + class expression + wrong order
    {
      code: `
const foo = class Foo {
  protected static b : string = "";
  public static a : string;
  private static c : string = "";
  constructor() {}
  public d : string = "";
  protected e : string = "";
  private f : string = "";
}
          `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },

    // classExpressions option + class expression + wrong order (multiple)
    {
      code: `
const foo = class Foo {
  public static c: string;
  public static b: string;
  public static a: string;
}
          `,
      options: [
        { classExpressions: { memberTypes: 'never', order: 'alphabetically' } },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'b',
            beforeMember: 'c',
          },
        },
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },
  ],
};

const sortedWithoutGroupingInterfacesOption: TSESLint.RunTests<
  MessageIds,
  Options
> = {
  valid: [
    // interfaces option + interface + multiple types
    {
      code: `
interface Foo {
  [a: string] : number;
  a : b;
  b() : void;
  new () : Bar;
  () : Baz;
}
            `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // interfaces option + interface + lower/upper case
    {
      code: `
interface Foo {
  A : b;
  a : b;
}
            `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // interfaces option + interface + numbers
    {
      code: `
interface Foo {
  a1 : b;
  aa : b;
}
            `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // interfaces option + type literal + multiple types --> Only member group order is checked (default config)
    {
      code: `
type Foo = {
  [a: string] : number;
  c : b;
  new () : Bar;
  b() : void;
  () : Baz;
}
            `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // interfaces option + type literal + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
type Foo = {
  a : b;
  A : b;
}
            `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // interfaces option + type literal + numbers --> Only member group order is checked (default config)
    {
      code: `
type Foo = {
  aa : b;
  a1 : b;
}
            `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // interfaces option + class + multiple types --> Only member group order is checked (default config)
    {
      code: `
class Foo {
  public static a : string;
  protected static b : string = "";
  private static c : string = "";
  public d : string = "";
  protected e : string = "";
  private f : string = "";
  constructor() {}
}
            `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // interfaces option + class + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
class Foo {
  public static a : string;
  public static A : string;
}
            `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // interfaces option + class + numbers --> Only member group order is checked (default config)
    {
      code: `
class Foo {
  public static aa : string;
  public static a1 : string;
}
            `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // interfaces option + class expression + multiple types --> Only member group order is checked (default config)
    {
      code: `
const foo = class Foo {
  public static a : string;
  protected static b : string = "";
  private static c : string = "";
  public d : string = "";
  protected e : string = "";
  private f : string = "";
  constructor() {}
}
            `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // interfaces option + class expression + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
const foo = class Foo {
  public static a : string;
  public static A : string;
}
            `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // interfaces option + class expression + numbers --> Only member group order is checked (default config)
    {
      code: `
const foo = class Foo {
  public static aa : string;
  public static a1 : string;
}
            `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },
  ],
  invalid: [
    // interfaces option + interface + wrong order
    {
      code: `
interface Foo {
  b() : void;
  a : b;
  [a: string] : number;
  new () : Bar;
  () : Baz;
}
          `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },

    // interfaces option + interface + wrong order (multiple)
    {
      code: `
interface Foo {
  c : string;
  b : string;
  a : string;
}
          `,
      options: [
        { interfaces: { memberTypes: 'never', order: 'alphabetically' } },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'b',
            beforeMember: 'c',
          },
        },
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },
  ],
};

const sortedWithoutGroupingTypeLiteralsOption: TSESLint.RunTests<
  MessageIds,
  Options
> = {
  valid: [
    // typeLiterals option + interface + multiple types --> Only member group order is checked (default config)
    {
      code: `
interface Foo {
  [a: string] : number;
  c : b;
  new () : Bar;
  b() : void;
  () : Baz;
}
            `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // typeLiterals option + interface + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
interface Foo {
  a : b;
  A : b;
}
            `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // typeLiterals option + interface + numbers --> Only member group order is checked (default config)
    {
      code: `
interface Foo {
  aa : b;
  a1 : b;
}
            `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // typeLiterals option + type literal + multiple types
    {
      code: `
type Foo = {
  [a: string] : number;
  a : b;
  b() : void;
  new () : Bar;
  () : Baz;
}
            `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // typeLiterals option + type literal + lower/upper case
    {
      code: `
type Foo = {
  A : b;
  a : b;
}
            `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // typeLiterals option + type literal + numbers
    {
      code: `
type Foo = {
  a1 : b;
  aa : b;
}
            `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // typeLiterals option + class + multiple types --> Only member group order is checked (default config)
    {
      code: `
class Foo {
  public static a : string;
  protected static b : string = "";
  private static c : string = "";
  public d : string = "";
  protected e : string = "";
  private f : string = "";
  constructor() {}
}
            `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // typeLiterals option + class + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
class Foo {
  public static a : string;
  public static A : string;
}
            `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // typeLiterals option + class + numbers --> Only member group order is checked (default config)
    {
      code: `
class Foo {
  public static aa : string;
  public static a1 : string;
}
            `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // typeLiterals option + class expression + multiple types --> Only member group order is checked (default config)
    {
      code: `
const foo = class Foo {
  public static a : string;
  protected static b : string = "";
  private static c : string = "";
  public d : string = "";
  protected e : string = "";
  private f : string = "";
  constructor() {}
}
            `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // typeLiterals option + class expression + lower/upper case --> Only member group order is checked (default config)
    {
      code: `
const foo = class Foo {
  public static a : string;
  public static A : string;
}
            `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },

    // typeLiterals option + class expression + numbers --> Only member group order is checked (default config)
    {
      code: `
const foo = class Foo {
  public static aa : string;
  public static a1 : string;
}
            `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
    },
  ],
  invalid: [
    // typeLiterals option + type literal + wrong order
    {
      code: `
type Foo = {
  b() : void;
  a : b;
  [a: string] : number;
  new () : Bar;
  () : Baz;
}
          `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },

    // typeLiterals option + type literal + wrong order (multiple)
    {
      code: `
type Foo = {
  c : string;
  b : string;
  a : string;
}
          `,
      options: [
        { typeLiterals: { memberTypes: 'never', order: 'alphabetically' } },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'b',
            beforeMember: 'c',
          },
        },
        {
          messageId: 'incorrectOrder',
          data: {
            member: 'a',
            beforeMember: 'b',
          },
        },
      ],
    },
  ],
};

const sortedWithGroupingDefaultOption: TSESLint.RunTests<
  MessageIds,
  Options
> = {
  valid: [
    // default option + interface + default order + alphabetically
    {
      code: `
interface Foo {
  [a: string] : number;

  a : x;
  b : x;
  c : x;

  new () : Bar;

  a() : void;
  b() : void;
  c() : void;

  () : Baz;
}
            `,
      options: [
        { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
      ],
    },

    // default option + interface + custom order + alphabetically
    {
      code: `
interface Foo {
  new () : Bar;

  a() : void;
  b() : void;
  c() : void;

  a : x;
  b : x;
  c : x;

  [a: string] : number;
  () : Baz;
}
            `,
      options: [
        {
          default: {
            memberTypes: ['constructor', 'method', 'field'],
            order: 'alphabetically',
          },
        },
      ],
    },

    // default option + type literal + default order + alphabetically
    {
      code: `
type Foo = {
  [a: string] : number;

  a : x;
  b : x;
  c : x;

  new () : Bar;

  a() : void;
  b() : void;
  c() : void;

  () : Baz;
}
            `,
      options: [
        { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
      ],
    },

    // default option + type literal + custom order + alphabetically
    {
      code: `
type Foo = {
  [a: string] : number;

  new () : Bar;

  a() : void;
  b() : void;
  c() : void;

  a : x;
  b : x;
  c : x;

  () : Baz;
}
            `,
      options: [
        {
          default: {
            memberTypes: ['constructor', 'method', 'field'],
            order: 'alphabetically',
          },
        },
      ],
    },

    // default option + class + default order + alphabetically
    {
      code: `
class Foo {
  public static a: string;
  protected static b: string = "";
  private static c: string = "";

  public d: string = "";
  protected e: string = "";
  private f: string = "";

  constructor() {}
}
            `,
      options: [
        { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
      ],
    },
    // default option + class + decorators + default order + alphabetically
    {
      code: `
class Foo {
  public static a: string;
  protected static b: string = "";
  private static c: string = "";

  @Dec() public d: string;
  @Dec() protected e: string;
  @Dec() private f: string;

  public g: string = "";
  protected h: string = "";
  private i: string = "";

  constructor() {}
}
            `,
      options: [
        { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
      ],
    },

    // default option + class + custom order + alphabetically
    {
      code: `
class Foo {
  constructor() {}

  public d: string = "";
  protected e: string = "";
  private f: string = "";

  public static a: string;
  protected static b: string = "";
  private static c: string = "";
}
            `,
      options: [
        {
          default: {
            memberTypes: ['constructor', 'instance-field', 'static-field'],
            order: 'alphabetically',
          },
        },
      ],
    },

    // default option + class expression + default order + alphabetically
    {
      code: `
const foo = class Foo {
  public static a: string;
  protected static b: string = "";
  private static c: string = "";

  public d: string = "";
  protected e: string = "";
  private f: string = "";

  constructor() {}
}
            `,
      options: [
        { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
      ],
    },

    // default option + class expression + custom order + alphabetically
    {
      code: `
const foo = class Foo {
  constructor() {}

  public d: string = "";
  protected e: string = "";
  private f: string = "";

  public static a: string;
  protected static b: string = "";
  private static c: string = "";
}
            `,
      options: [
        {
          default: {
            memberTypes: ['constructor', 'instance-field', 'static-field'],
            order: 'alphabetically',
          },
        },
      ],
    },
  ],
  invalid: [
    // default option + interface + wrong order within group and wrong group order + alphabetically
    {
      code: `
interface Foo {
  [a: string] : number;

  a : x;
  b : x;
  c : x;

  c() : void;
  b() : void;
  a() : void;

  () : Baz;

  new () : Bar;
}
            `,
      options: [
        { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
      ],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'new',
            rank: 'method',
          },
        },
      ],
    },

    // default option + type literal + wrong order within group and wrong group order + alphabetically
    {
      code: `
type Foo = {
  [a: string] : number;

  a : x;
  b : x;
  c : x;

  c() : void;
  b() : void;
  a() : void;

  () : Baz;

  new () : Bar;
}
            `,
      options: [
        { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
      ],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'new',
            rank: 'method',
          },
        },
      ],
    },

    // default option + class + wrong order within group and wrong group order + alphabetically
    {
      code: `
class Foo {
  public static c: string = "";
  public static b: string = "";
  public static a: string;

  constructor() {}

  public d: string = "";
}
            `,
      options: [
        { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
      ],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'd',
            rank: 'public constructor',
          },
        },
      ],
    },

    // default option + class expression + wrong order within group and wrong group order + alphabetically
    {
      code: `
const foo = class Foo {
  public static c: string = "";
  public static b: string = "";
  public static a: string;

  constructor() {}

  public d: string = "";
}
            `,
      options: [
        { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
      ],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'd',
            rank: 'public constructor',
          },
        },
      ],
    },
    // default option + class + decorators + custom order + wrong order within group and wrong group order + alphabetically
    {
      code: `
class Foo {
  @Dec() a1: string;
  @Dec()
  a3: string;
  @Dec()
  a2: string;

  constructor() {}

  b1: string;
  b2: string;

  public c(): void;
  @Dec() d(): void
}
            `,
      options: [
        {
          default: {
            memberTypes: [
              'decorated-field',
              'field',
              'constructor',
              'decorated-method',
            ],
            order: 'alphabetically',
          },
        },
      ],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'b1',
            rank: 'constructor',
          },
        },
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'b2',
            rank: 'constructor',
          },
        },
      ],
    },
  ],
};

const sortedWithGroupingClassesOption: TSESLint.RunTests<
  MessageIds,
  Options
> = {
  valid: [
    // classes option + interface + alphabetically --> Default order applies
    {
      code: `
interface Foo {
  [a: string] : number;

  c : x;
  b : x;
  a : x;

  new () : Bar;

  c() : void;
  b() : void;
  a() : void;

  () : Baz;
}
            `,
      options: [{ classes: { order: 'alphabetically' } }],
    },

    // classes option + type literal + alphabetically --> Default order applies
    {
      code: `
type Foo = {
  [a: string] : number;

  c : x;
  b : x;
  a : x;

  new () : Bar;

  c() : void;
  b() : void;
  a() : void;

  () : Baz;
}
            `,
      options: [{ classes: { order: 'alphabetically' } }],
    },

    // classes option + class + default order + alphabetically
    {
      code: `
class Foo {
  public static a: string;
  protected static b: string = "";
  private static c: string = "";

  public d: string = "";
  protected e: string = "";
  private f: string = "";

  constructor() {}
}
            `,
      options: [
        { classes: { memberTypes: defaultOrder, order: 'alphabetically' } },
      ],
    },

    // classes option + class + custom order + alphabetically
    {
      code: `
class Foo {
  constructor() {}

  public d: string = "";
  protected e: string = "";
  private f: string = "";

  public static a: string;
  protected static b: string = "";
  private static c: string = "";
}
            `,
      options: [
        {
          classes: {
            memberTypes: ['constructor', 'instance-field', 'static-field'],
            order: 'alphabetically',
          },
        },
      ],
    },

    // classes option + class expression + alphabetically --> Default order applies
    {
      code: `
const foo = class Foo {
  public static a: string;
  protected static b: string = "";
  private static c: string = "";

  public d: string = "";
  protected e: string = "";
  private f: string = "";

  constructor() {}
}
            `,
      options: [{ classes: { order: 'alphabetically' } }],
    },
  ],
  invalid: [
    // default option + class + wrong order within group and wrong group order + alphabetically
    {
      code: `
class Foo {
  public static c: string = "";
  public static b: string = "";
  public static a: string;

  constructor() {}

  public d: string = "";
}
            `,
      options: [
        { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
      ],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'd',
            rank: 'public constructor',
          },
        },
      ],
    },
  ],
};

const sortedWithGroupingClassExpressionsOption: TSESLint.RunTests<
  MessageIds,
  Options
> = {
  valid: [
    // classExpressions option + interface + alphabetically --> Default order applies
    {
      code: `
interface Foo {
  [a: string] : number;

  c : x;
  b : x;
  a : x;

  new () : Bar;

  c() : void;
  b() : void;
  a() : void;

  () : Baz;
}
            `,
      options: [{ classExpressions: { order: 'alphabetically' } }],
    },

    // classExpressions option + type literal + alphabetically --> Default order applies
    {
      code: `
type Foo = {
  [a: string] : number;

  c : x;
  b : x;
  a : x;

  new () : Bar;

  c() : void;
  b() : void;
  a() : void;

  () : Baz;
}
            `,
      options: [{ classExpressions: { order: 'alphabetically' } }],
    },

    // classExpressions option + class + alphabetically --> Default order applies
    {
      code: `
class Foo {
  public static a: string;
  protected static b: string = "";
  private static c: string = "";

  public d: string = "";
  protected e: string = "";
  private f: string = "";

  constructor() {}
}
            `,
      options: [{ classExpressions: { order: 'alphabetically' } }],
    },

    // classExpressions option + class expression + default order + alphabetically
    {
      code: `
const foo = class Foo {
  public static a: string;
  protected static b: string = "";
  private static c: string = "";

  public d: string = "";
  protected e: string = "";
  private f: string = "";

  constructor() {}
}
            `,
      options: [
        {
          classExpressions: {
            memberTypes: defaultOrder,
            order: 'alphabetically',
          },
        },
      ],
    },

    // classExpressions option + class expression + custom order + alphabetically
    {
      code: `
const foo = class Foo {
  constructor() {}

  public d: string = "";
  protected e: string = "";
  private f: string = "";

  public static a: string;
  protected static b: string = "";
  private static c: string = "";
}
            `,
      options: [
        {
          classExpressions: {
            memberTypes: ['constructor', 'instance-field', 'static-field'],
            order: 'alphabetically',
          },
        },
      ],
    },
  ],
  invalid: [
    // default option + class expression + wrong order within group and wrong group order + alphabetically
    {
      code: `
const foo = class Foo {
  public static c: string = "";
  public static b: string = "";
  public static a: string;

  constructor() {}

  public d: string = "";
}
            `,
      options: [
        { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
      ],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'd',
            rank: 'public constructor',
          },
        },
      ],
    },
  ],
};

const sortedWithGroupingInterfacesOption: TSESLint.RunTests<
  MessageIds,
  Options
> = {
  valid: [
    // interfaces option + interface + default order + alphabetically
    {
      code: `
interface Foo {
  [a: string] : number;

  a : x;
  b : x;
  c : x;

  a() : void;
  b() : void;
  c() : void;

  new () : Bar;

  () : Baz;
}
            `,
      options: [
        {
          interfaces: {
            memberTypes: ['signature', 'field', 'method', 'constructor'],
            order: 'alphabetically',
          },
        },
      ],
    },

    // interfaces option + interface + custom order + alphabetically
    {
      code: `
interface Foo {
  new () : Bar;

  a() : void;
  b() : void;
  c() : void;

  a : x;
  b : x;
  c : x;

  [a: string] : number;
  () : Baz;
}
            `,
      options: [
        {
          interfaces: {
            memberTypes: ['constructor', 'method', 'field'],
            order: 'alphabetically',
          },
        },
      ],
    },

    // interfaces option + type literal + alphabetically --> Default order applies
    {
      code: `
type Foo = {
  [a: string] : number;

  c : x;
  b : x;
  a : x;

  new () : Bar;

  c() : void;
  b() : void;
  a() : void;

  () : Baz;
}
            `,
      options: [{ interfaces: { order: 'alphabetically' } }],
    },

    // interfaces option + class + alphabetically --> Default order applies
    {
      code: `
class Foo {
  public static a: string;
  protected static b: string = "";
  private static c: string = "";

  public d: string = "";
  protected e: string = "";
  private f: string = "";

  constructor() {}
}
            `,
      options: [{ interfaces: { order: 'alphabetically' } }],
    },

    // interfaces option + class expression + alphabetically --> Default order applies
    {
      code: `
const foo = class Foo {
  public static a: string;
  protected static b: string = "";
  private static c: string = "";

  public d: string = "";
  protected e: string = "";
  private f: string = "";

  constructor() {}
}
            `,
      options: [{ interfaces: { order: 'alphabetically' } }],
    },
  ],
  invalid: [
    // default option + interface + wrong order within group and wrong group order + alphabetically
    {
      code: `
interface Foo {
  [a: string] : number;

  a : x;
  b : x;
  c : x;

  c() : void;
  b() : void;
  a() : void;

  () : Baz;

  new () : Bar;
}
            `,
      options: [
        { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
      ],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'new',
            rank: 'method',
          },
        },
      ],
    },
  ],
};

const sortedWithGroupingTypeLiteralsOption: TSESLint.RunTests<
  MessageIds,
  Options
> = {
  valid: [
    // typeLiterals option + interface + alphabetically --> Default order applies
    {
      code: `
interface Foo {
  [a: string] : number;

  c : x;
  b : x;
  a : x;

  new () : Bar;

  c() : void;
  b() : void;
  a() : void;

  () : Baz;
}
            `,
      options: [{ typeLiterals: { order: 'alphabetically' } }],
    },

    // typeLiterals option + type literal + default order + alphabetically
    {
      code: `
type Foo = {
  [a: string] : number;

  a : x;
  b : x;
  c : x;

  a() : void;
  b() : void;
  c() : void;

  new () : Bar;

  () : Baz;
}
            `,
      options: [
        {
          typeLiterals: {
            memberTypes: ['signature', 'field', 'method', 'constructor'],
            order: 'alphabetically',
          },
        },
      ],
    },

    // typeLiterals option + type literal + custom order + alphabetically
    {
      code: `
type Foo = {
  new () : Bar;

  a() : void;
  b() : void;
  c() : void;

  a : x;
  b : x;
  c : x;

  [a: string] : number;
  () : Baz;
}
            `,
      options: [
        {
          typeLiterals: {
            memberTypes: ['constructor', 'method', 'field'],
            order: 'alphabetically',
          },
        },
      ],
    },

    // typeLiterals option + class + alphabetically --> Default order applies
    {
      code: `
class Foo {
  public static a: string;
  protected static b: string = "";
  private static c: string = "";

  public d: string = "";
  protected e: string = "";
  private f: string = "";

  constructor() {}
}
            `,
      options: [{ typeLiterals: { order: 'alphabetically' } }],
    },

    // typeLiterals option + class expression + alphabetically --> Default order applies
    {
      code: `
const foo = class Foo {
  public static a: string;
  protected static b: string = "";
  private static c: string = "";

  public d: string = "";
  protected e: string = "";
  private f: string = "";

  constructor() {}
}
            `,
      options: [{ typeLiterals: { order: 'alphabetically' } }],
    },
  ],
  invalid: [
    // default option + type literal + wrong order within group and wrong group order + alphabetically
    {
      code: `
type Foo = {
  [a: string] : number;

  a : x;
  b : x;
  c : x;

  c() : void;
  b() : void;
  a() : void;

  () : Baz;

  new () : Bar;
}
            `,
      options: [
        { default: { memberTypes: defaultOrder, order: 'alphabetically' } },
      ],
      errors: [
        {
          messageId: 'incorrectGroupOrder',
          data: {
            name: 'new',
            rank: 'method',
          },
        },
      ],
    },
  ],
};

const sortedWithoutGrouping = {
  valid: [
    ...sortedWithoutGroupingDefaultOption.valid,
    ...sortedWithoutGroupingClassesOption.valid,
    ...sortedWithoutGroupingClassExpressionsOption.valid,
    ...sortedWithoutGroupingInterfacesOption.valid,
    ...sortedWithoutGroupingTypeLiteralsOption.valid,
  ],
  invalid: [
    ...sortedWithoutGroupingDefaultOption.invalid,
    ...sortedWithoutGroupingClassesOption.invalid,
    ...sortedWithoutGroupingClassExpressionsOption.invalid,
    ...sortedWithoutGroupingInterfacesOption.invalid,
    ...sortedWithoutGroupingTypeLiteralsOption.invalid,
  ],
};

const sortedWithGrouping = {
  valid: [
    ...sortedWithGroupingDefaultOption.valid,
    ...sortedWithGroupingClassesOption.valid,
    ...sortedWithGroupingClassExpressionsOption.valid,
    ...sortedWithGroupingInterfacesOption.valid,
    ...sortedWithGroupingTypeLiteralsOption.valid,
  ],
  invalid: [
    ...sortedWithGroupingDefaultOption.invalid,
    ...sortedWithGroupingClassesOption.invalid,
    ...sortedWithGroupingClassExpressionsOption.invalid,
    ...sortedWithGroupingInterfacesOption.invalid,
    ...sortedWithGroupingTypeLiteralsOption.invalid,
  ],
};

ruleTester.run('member-ordering', rule, {
  valid: [
    ...grouped.valid,
    ...sortedWithoutGrouping.valid,
    ...sortedWithGrouping.valid,
  ],
  invalid: [
    ...grouped.invalid,
    ...sortedWithoutGrouping.invalid,
    ...sortedWithGrouping.invalid,
  ],
});
