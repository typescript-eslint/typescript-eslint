import rule from '../../src/rules/unbound-method';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('unbound-method', rule, {
  valid: [
    'Promise.resolve().then(console.log);',
    "['1', '2', '3'].map(Number.parseInt);",
    '[5.2, 7.1, 3.6].map(Math.floor);',
    `
const foo = Number;
['1', '2', '3'].map(foo.parseInt);
    `,
    `
const foo = Math;
[5.2, 7.1, 3.6].map(foo.floor);
    `,
    "['1', '2', '3'].map(Number['floor']);",
    'const x = console.log;',
    'const x = Object.defineProperty;',
    `
const foo = Object;
const x = foo.defineProperty;
    `,
    'const x = String.fromCharCode;',
    `
const foo = String;
const x = foo.fromCharCode;
    `,
    'const x = RegExp.prototype;',
    'const x = Symbol.keyFor;',
    `
const foo = Symbol;
const x = foo.keyFor;
    `,
    'const x = Array.isArray;',
    `
const foo = Array;
const x = foo.isArray;
    `,
    `
class Foo extends Array {}
const x = Foo.isArray;
    `,
    'const x = Proxy.revocable;',
    `
const foo = Proxy;
const x = foo.revocable;
    `,
    'const x = Date.parse;',
    `
const foo = Date;
const x = foo.parse;
    `,
    'const x = Atomics.load;',
    `
const foo = Atomics;
const x = foo.load;
    `,
    'const x = Reflect.deleteProperty;',
    'const x = JSON.stringify;',
    `
const foo = JSON;
const x = foo.stringify;
    `,
    `
const o = {
  f: function (this: void) {},
};
const f = o.f;
    `,
    `
const { alert } = window;
    `,
    `
let b = window.blur;
    `,
    `
function foo() {}
const fooObject = { foo };
const { foo: bar } = fooObject;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

instance.bound();
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

instance.unbound();
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

ContainsMethods.boundStatic();
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

ContainsMethods.unboundStatic();
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

const bound = instance.bound;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

const boundStatic = ContainsMethods;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

const { bound } = instance;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

const { boundStatic } = ContainsMethods;
    `,
    `
class ContainsMethods {
  bound?: () => void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

instance.bound();
    `,
    `
class ContainsMethods {
  unbound?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

instance.unbound();
    `,
    `
class ContainsMethods {
  static boundStatic?: () => void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

ContainsMethods.boundStatic();
    `,
    `
class ContainsMethods {
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

ContainsMethods.unboundStatic();
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

instance.bound\`\`;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

instance.unbound\`\`;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

if (instance.bound) {
}
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

if (instance.unbound) {
}
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

if (instance.bound !== undefined) {
}
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

if (instance.unbound !== undefined) {
}
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

if (ContainsMethods.boundStatic) {
}
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

if (ContainsMethods.unboundStatic) {
}
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

if (ContainsMethods.boundStatic !== undefined) {
}
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

if (ContainsMethods.unboundStatic !== undefined) {
}
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

if (ContainsMethods.boundStatic && instance) {
}
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

if (ContainsMethods.unboundStatic && instance) {
}
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

if (instance.bound || instance) {
}
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

if (instance.unbound || instance) {
}
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

(ContainsMethods.unboundStatic && 0) || ContainsMethods;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

instance.bound || instance ? 1 : 0;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

instance.unbound || instance ? 1 : 0;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

while (instance.bound) {}
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

while (instance.unbound) {}
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

while (instance.bound !== undefined) {}
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

while (instance.unbound !== undefined) {}
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

while (ContainsMethods.boundStatic) {}
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

while (ContainsMethods.unboundStatic) {}
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

while (ContainsMethods.boundStatic !== undefined) {}
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

while (ContainsMethods.unboundStatic !== undefined) {}
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

instance.bound as any;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

ContainsMethods.boundStatic as any;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

instance.bound++;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

+instance.bound;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

++instance.bound;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

instance.bound--;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

-instance.bound;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

--instance.bound;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

instance.bound += 1;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

instance.bound -= 1;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

instance.bound *= 1;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

instance.bound /= 1;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

instance.bound || 0;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

instance.bound && 0;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

instance.bound ? 1 : 0;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

instance.unbound ? 1 : 0;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

ContainsMethods.boundStatic++;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

+ContainsMethods.boundStatic;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

++ContainsMethods.boundStatic;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

ContainsMethods.boundStatic--;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

-ContainsMethods.boundStatic;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

--ContainsMethods.boundStatic;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

ContainsMethods.boundStatic += 1;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

ContainsMethods.boundStatic -= 1;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

ContainsMethods.boundStatic *= 1;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

ContainsMethods.boundStatic /= 1;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

ContainsMethods.boundStatic || 0;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

instane.boundStatic && 0;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

ContainsMethods.boundStatic ? 1 : 0;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

ContainsMethods.unboundStatic ? 1 : 0;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

typeof instance.bound === 'function';
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

typeof instance.unbound === 'function';
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

typeof ContainsMethods.boundStatic === 'function';
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

typeof ContainsMethods.unboundStatic === 'function';
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

instance.unbound = () => {};
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

instance.unbound = instance.unbound.bind(instance);
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

if (!!instance.unbound) {
}
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

void instance.unbound;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

delete instance.unbound;
    `,
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

const { double } = arith;
    `,
    `
interface RecordA {
  readonly type: 'A';
  readonly a: {};
}
interface RecordB {
  readonly type: 'B';
  readonly b: {};
}
type AnyRecord = RecordA | RecordB;

function test(obj: AnyRecord) {
  switch (obj.type) {
  }
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/496
    `
class CommunicationError {
  constructor() {
    const x = CommunicationError.prototype;
  }
}
    `,
    `
class CommunicationError {}
const x = CommunicationError.prototype;
    `,
    // optional chain
    `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

function foo(instance: ContainsMethods | null) {
  instance?.bound();
  instance?.unbound();

  if (instance?.bound) {
  }
  if (instance?.unbound) {
  }

  typeof instance?.bound === 'function';
  typeof instance?.unbound === 'function';
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/1425
    `
interface OptionalMethod {
  mightBeDefined?(): void;
}

const x: OptionalMethod = {};
declare const myCondition: boolean;
if (myCondition || x.mightBeDefined) {
  console.log('hello world');
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/1256
    `
class A {
  unbound(): void {
    this.unbound = undefined;
    this.unbound = this.unbound.bind(this);
  }
}
    `,
    'const { parseInt } = Number;',
    'const { log } = console;',
    `
let parseInt;
({ parseInt } = Number);
    `,
    `
let log;
({ log } = console);
    `,
    `
const foo = {
  bar: 'bar',
};
const { bar } = foo;
    `,
    `
class Foo {
  unbnound() {}
  bar = 4;
}
const { bar } = new Foo();
    `,
    `
class Foo {
  bound = () => 'foo';
}
const { bound } = new Foo();
    `,
    `
class Foo {
  bound = () => 'foo';
}
function foo({ bound } = new Foo()) {}
    `,
    `
class Foo {
  bound = () => 'foo';
}
declare const bar: Foo;
function foo({ bound }: Foo) {}
    `,
    `
class Foo {
  bound = () => 'foo';
}
class Bar {
  bound = () => 'bar';
}
function foo({ bound }: Foo | Bar) {}
    `,
    `
class Foo {
  bound = () => 'foo';
}
type foo = ({ bound }: Foo) => void;
    `,
    `
class Foo {
  unbound = function () {};
}
type foo = ({ unbound }: Foo) => void;
    `,
    `
class Foo {
  bound = () => 'foo';
}
class Bar {
  bound = () => 'bar';
}
function foo({ bound }: Foo & Bar) {}
    `,
    `
class Foo {
  unbound = function () {};
}
declare const { unbound }: Foo;
    `,
    "declare const { unbound } = '***';",
    `
class Foo {
  unbound = function () {};
}
type foo = (a: (b: (c: ({ unbound }: Foo) => void) => void) => void) => void;
    `,
    `
class Foo {
  unbound = function () {};
}
class Bar {
  property: ({ unbound }: Foo) => void;
}
    `,
    `
class Foo {
  unbound = function () {};
}
function foo<T extends ({ unbound }: Foo) => void>() {}
    `,
    `
class Foo {
  unbound = function () {};
}
abstract class Bar {
  abstract foo({ unbound }: Foo);
}
    `,
    `
class Foo {
  unbound = function () {};
}
declare class Bar {
  foo({ unbound }: Foo);
}
    `,
    `
class Foo {
  unbound = function () {};
}
declare function foo({ unbound }: Foo);
    `,
    `
class Foo {
  unbound = function () {};
}
interface Bar {
  foo: ({ unbound }: Foo) => void;
}
    `,
    `
class Foo {
  unbound = function () {};
}
interface Bar {
  foo({ unbound }: Foo): void;
}
    `,
    `
class Foo {
  unbound = function () {};
}
interface Bar {
  new ({ unbound }: Foo): Foo;
}
    `,
    `
class Foo {
  unbound = function () {};
}
type foo = new ({ unbound }: Foo) => void;
    `,
    'const { unbound } = { unbound: () => {} };',
    'function foo({ unbound }: { unbound: () => void } = { unbound: () => {} }) {}',
    // https://github.com/typescript-eslint/typescript-eslint/issues/1866
    `
class BaseClass {
  x: number = 42;
  logThis() {}
}
class OtherClass extends BaseClass {
  superLogThis: any;
  constructor() {
    super();
    this.superLogThis = super.logThis;
  }
}
const oc = new OtherClass();
oc.superLogThis();
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/11683
    `
class Foo {
  bound = () => {};
}
class Bar {
  bound = 1;
}
declare const union: Foo | Bar;
const bound = union.bound;
    `,
    `
class Foo {
  bazz() {}
}
declare const foo: Foo;
declare const key: string;
const bound = foo[key];
    `,
    `
class Foo {
  bazz() {}
}
declare const foo: Foo;
declare const bazz: string;
foo[bazz];
    `,
  ],
  invalid: [
    {
      code: `
class Console {
  log(str) {
    process.stdout.write(str);
  }
}

const console = new Console();

Promise.resolve().then(console.log);
      `,
      errors: [
        {
          column: 24,
          endColumn: 35,
          endLine: 10,
          line: 10,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
import { console } from './class';
const x = console.log;
      `,
      errors: [
        {
          column: 11,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

function foo(arg: ContainsMethods | null) {
  const unbound = arg?.unbound;
  arg.unbound += 1;
  arg?.unbound as any;
}
      `,
      errors: [
        {
          column: 19,
          endColumn: 31,
          endLine: 19,
          line: 19,
          messageId: 'unboundWithoutThisAnnotation',
        },
        {
          column: 3,
          endColumn: 14,
          endLine: 20,
          line: 20,
          messageId: 'unboundWithoutThisAnnotation',
        },
        {
          column: 3,
          endColumn: 15,
          endLine: 21,
          line: 21,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

const unbound = instance.unbound;
      `,
      errors: [
        {
          column: 17,
          endColumn: 33,
          endLine: 18,
          line: 18,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

const unboundStatic = ContainsMethods.unboundStatic;
      `,
      errors: [
        {
          column: 23,
          endColumn: 52,
          endLine: 18,
          line: 18,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

const { unbound } = instance;
      `,
      errors: [
        {
          column: 9,
          endColumn: 16,
          endLine: 18,
          line: 18,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

const { unboundStatic } = ContainsMethods;
      `,
      errors: [
        {
          column: 9,
          endColumn: 22,
          endLine: 18,
          line: 18,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

<any>instance.unbound;
      `,
      errors: [
        {
          column: 6,
          endColumn: 22,
          endLine: 18,
          line: 18,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

instance.unbound as any;
      `,
      errors: [
        {
          column: 1,
          endColumn: 17,
          endLine: 18,
          line: 18,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

<any>ContainsMethods.unboundStatic;
      `,
      errors: [
        {
          column: 6,
          endColumn: 35,
          endLine: 18,
          line: 18,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

ContainsMethods.unboundStatic as any;
      `,
      errors: [
        {
          column: 1,
          endColumn: 30,
          endLine: 18,
          line: 18,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

instance.unbound || 0;
      `,
      errors: [
        {
          column: 1,
          endColumn: 17,
          endLine: 18,
          line: 18,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

ContainsMethods.unboundStatic || 0;
      `,
      errors: [
        {
          column: 1,
          endColumn: 30,
          endLine: 18,
          line: 18,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class ContainsMethods {
  bound?: () => void;
  unbound?(): void;

  static boundStatic?: () => void;
  static unboundStatic?(): void;
}

let instance = new ContainsMethods();

const arith = {
  double(this: void, x: number): number {
    return x * 2;
  },
};

instance.unbound ? instance.unbound : null;
      `,
      errors: [
        {
          column: 20,
          endColumn: 36,
          endLine: 18,
          line: 18,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class ContainsMethods {
  unbound?(): void;

  static unboundStatic?(): void;
}

new ContainsMethods().unbound;

ContainsMethods.unboundStatic;
      `,
      errors: [
        {
          column: 1,
          endColumn: 30,
          endLine: 8,
          line: 8,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
      options: [{ ignoreStatic: true }],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/496
    {
      code: `
class CommunicationError {
  foo() {}
}
const x = CommunicationError.prototype.foo;
      `,
      errors: [
        {
          column: 11,
          endColumn: 43,
          endLine: 5,
          line: 5,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      // Promise.all is not auto-bound to Promise
      code: 'const x = Promise.all;',
      errors: [
        {
          column: 11,
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound() {}
}
const instance = new Foo();

let x;

x = instance.unbound; // THIS SHOULD ERROR
instance.unbound = x; // THIS SHOULD NOT
      `,
      errors: [
        {
          column: 5,
          endColumn: 21,
          endLine: 9,
          line: 9,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class Foo extends Number {
  static parseInt = function (string: string, radix?: number): number {};
}
const foo = Foo;
['1', '2', '3'].map(foo.parseInt);
      `,
      errors: [
        {
          column: 21,
          endColumn: 33,
          endLine: 6,
          line: 6,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
declare const foo: Number;
const x = foo.toFixed;
      `,
      errors: [
        {
          column: 11,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
declare const foo: Object;
const x = foo.hasOwnProperty;
      `,
      errors: [
        {
          column: 11,
          endColumn: 29,
          endLine: 3,
          line: 3,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
declare const foo: String;
const x = foo.slice;
      `,
      errors: [
        {
          column: 11,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
declare const foo: Date;
const x = foo.getTime;
      `,
      errors: [
        {
          column: 11,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class Foo extends Number {}
const x = Foo.parseInt;
      `,
      errors: [
        {
          column: 11,
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class Foo extends String {}
const x = Foo.fromCharCode;
      `,
      errors: [
        {
          column: 11,
          endColumn: 27,
          endLine: 3,
          line: 3,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class Foo extends Object {}
const x = Foo.defineProperty;
      `,
      errors: [
        {
          column: 11,
          endColumn: 29,
          endLine: 3,
          line: 3,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class Foo extends Date {}
const x = Foo.parse;
      `,
      errors: [
        {
          column: 11,
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound = function () {};
}
const unbound = new Foo().unbound;
      `,
      errors: [
        {
          column: 17,
          endColumn: 34,
          endLine: 5,
          line: 5,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound() {}
}
const { unbound } = new Foo();
      `,
      errors: [
        {
          column: 9,
          endColumn: 16,
          endLine: 5,
          line: 5,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound = function () {};
}
const { unbound } = new Foo();
      `,
      errors: [
        {
          column: 9,
          endColumn: 16,
          endLine: 5,
          line: 5,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound() {}
}
let unbound;
({ unbound } = new Foo());
      `,
      errors: [
        {
          column: 4,
          endColumn: 11,
          endLine: 6,
          line: 6,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound = function () {};
}
let unbound;
({ unbound } = new Foo());
      `,
      errors: [
        {
          column: 4,
          endColumn: 11,
          endLine: 6,
          line: 6,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound = function () {};
}
function foo({ unbound }: Foo = new Foo()) {}
      `,
      errors: [
        {
          column: 16,
          endColumn: 23,
          endLine: 5,
          line: 5,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound = function () {};
}
declare const bar: Foo;
function foo({ unbound }: Foo = bar) {}
      `,
      errors: [
        {
          column: 16,
          endColumn: 23,
          endLine: 6,
          line: 6,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound = function () {};
}
declare const bar: Foo;
function foo({ unbound }: Foo = { unbound: () => {} }) {}
      `,
      errors: [
        {
          column: 16,
          endColumn: 23,
          endLine: 6,
          line: 6,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound = function () {};
}
declare const bar: Foo;
function foo({ unbound }: Foo = { unbound: function () {} }) {}
      `,
      errors: [
        {
          column: 16,
          endColumn: 23,
          endLine: 6,
          line: 6,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound = function () {};
}
function foo({ unbound }: Foo) {}
      `,
      errors: [
        {
          column: 16,
          endColumn: 23,
          endLine: 5,
          line: 5,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound = function () {};
}
function bar(cb: (arg: Foo) => void) {}
bar(({ unbound }) => {});
      `,
      errors: [
        {
          column: 8,
          endColumn: 15,
          endLine: 6,
          line: 6,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound = function () {};
}
function bar(cb: (arg: { unbound: () => void }) => void) {}
bar(({ unbound } = new Foo()) => {});
      `,
      errors: [
        {
          column: 8,
          endColumn: 15,
          endLine: 6,
          line: 6,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound = function () {};
}
for (const { unbound } of [new Foo(), new Foo()]) {
}
      `,
      errors: [
        {
          column: 14,
          endColumn: 21,
          endLine: 5,
          line: 5,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound = function () {};

  foo({ unbound }: Foo) {}
}
      `,
      errors: [
        {
          column: 9,
          endColumn: 16,
          endLine: 5,
          line: 5,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound = function () {};
}
class Bar {
  unbound = function () {};
}
function foo({ unbound }: Foo | Bar) {}
      `,
      errors: [
        {
          column: 16,
          endColumn: 23,
          endLine: 8,
          line: 8,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound = function () {};
}
function foo({ unbound }: { unbound: () => string } | Foo) {}
      `,
      errors: [
        {
          column: 16,
          endColumn: 23,
          endLine: 5,
          line: 5,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound = function () {};
}
class Bar {
  unbound = () => {};
}
function foo({ unbound }: Foo | Bar) {}
      `,
      errors: [
        {
          column: 16,
          endColumn: 23,
          endLine: 8,
          line: 8,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound = function () {};
}
const foo = ({ unbound }: Foo & { foo: () => 'bar' }) => {};
      `,
      errors: [
        {
          column: 16,
          endColumn: 23,
          endLine: 5,
          line: 5,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound = function () {};
}
class Bar {
  unbound = () => {};
}
const foo = ({ unbound }: (Foo & { foo: () => 'bar' }) | Bar) => {};
      `,
      errors: [
        {
          column: 16,
          endColumn: 23,
          endLine: 8,
          line: 8,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound = function () {};
}
class Bar {
  unbound = () => {};
}
const foo = ({ unbound }: Foo & Bar) => {};
      `,
      errors: [
        {
          column: 16,
          endColumn: 23,
          endLine: 8,
          line: 8,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: `
class Foo {
  unbound = function () {};

  other = function () {};
}
class Bar {
  unbound = () => {};
}
const foo = ({ unbound, ...rest }: Foo & Bar) => {};
      `,
      errors: [
        {
          column: 16,
          endColumn: 23,
          endLine: 10,
          line: 10,
          messageId: 'unbound',
        },
      ],
    },
    {
      code: 'const { unbound } = { unbound: function () {} };',
      errors: [
        {
          column: 9,
          endColumn: 16,
          endLine: 1,
          line: 1,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
function foo(
  { unbound }: { unbound: () => void } = { unbound: function () {} },
) {}
      `,
      errors: [
        {
          column: 5,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class Foo {
  floor = function () {};
}

const { floor } = Math.random() > 0.5 ? new Foo() : Math;
      `,
      errors: [
        {
          column: 9,
          endColumn: 14,
          endLine: 6,
          line: 6,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class CommunicationError {
  foo() {}
}
const { foo } = CommunicationError.prototype;
      `,
      errors: [
        {
          column: 9,
          endColumn: 12,
          endLine: 5,
          line: 5,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class CommunicationError {
  foo() {}
}
let foo;
({ foo } = CommunicationError.prototype);
      `,
      errors: [
        {
          column: 4,
          endColumn: 7,
          endLine: 6,
          line: 6,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
import { console } from './class';
const { log } = console;
      `,
      errors: [
        {
          column: 9,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: 'const { all } = Promise;',
      errors: [
        {
          column: 9,
          endColumn: 12,
          endLine: 1,
          line: 1,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/1866
    {
      code: `
class BaseClass {
  logThis() {}
}
class OtherClass extends BaseClass {
  constructor() {
    super();
    const x = super.logThis;
  }
}
      `,
      errors: [
        {
          column: 15,
          endColumn: 28,
          endLine: 8,
          line: 8,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/1866
    {
      code: `
class BaseClass {
  logThis() {}
}
class OtherClass extends BaseClass {
  constructor() {
    super();
    let x;
    x = super.logThis;
  }
}
      `,
      errors: [
        {
          column: 9,
          endColumn: 22,
          endLine: 9,
          line: 9,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
const values = {
  a() {},
  b: () => {},
};

const { a, b } = values;
      `,
      errors: [
        {
          column: 9,
          endColumn: 10,
          endLine: 7,
          line: 7,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
const values = {
  a() {},
  b: () => {},
};

const { a: c } = values;
      `,
      errors: [
        {
          column: 9,
          endColumn: 10,
          endLine: 7,
          line: 7,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
const values = {
  a() {},
  b: () => {},
};

const { b, a } = values;
      `,
      errors: [
        {
          column: 12,
          endColumn: 13,
          endLine: 7,
          line: 7,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/8636
    {
      code: `
const objectLiteral = {
  f: function () {},
};
const f = objectLiteral.f;
      `,
      errors: [
        {
          column: 11,
          endColumn: 26,
          endLine: 5,
          line: 5,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/11683
    {
      code: `
class Foo {
  bazz() {}
}
class Bar {
  bazz = 1;
}
declare const union: Foo | Bar;
const bound = union.bazz;
      `,
      errors: [
        {
          column: 15,
          endColumn: 25,
          endLine: 9,
          line: 9,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class Foo {
  bazz() {}
}
class Bar {
  bazz = 1;
}
declare const union: Foo | Bar;
declare const bazz: 'bazz';
const bound = union[bazz];
      `,
      errors: [
        {
          column: 15,
          endColumn: 26,
          endLine: 10,
          line: 10,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class Foo {
  bazz() {}
}
declare const foo: Foo;
foo['bazz'];
      `,
      errors: [
        {
          column: 1,
          endColumn: 12,
          endLine: 6,
          line: 6,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class Foo {
  bazz() {}
}
declare const foo: Foo;
declare const bazz: keyof Foo;
const bound = foo[bazz];
      `,
      errors: [
        {
          column: 15,
          endColumn: 24,
          endLine: 7,
          line: 7,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class Foo {
  bazz() {}
}
declare const foo: Foo;
const bound = foo[\`ba\${'zz'}\`];
      `,
      errors: [
        {
          column: 15,
          endColumn: 31,
          endLine: 6,
          line: 6,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
    {
      code: `
class Foo {
  1() {}
}
declare const foo: Foo;
foo[1];
      `,
      errors: [
        {
          column: 1,
          endColumn: 7,
          endLine: 6,
          line: 6,
          messageId: 'unboundWithoutThisAnnotation',
        },
      ],
    },
  ],
});
