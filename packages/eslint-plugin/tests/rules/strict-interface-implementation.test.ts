import rule from '../../src/rules/strict-interface-implementation';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('strict-interface-implementation', rule, {
  valid: [
    'class Standalone {}',
    'const Standalone = class {};',
    'const Standalone = class Standalone {};',
    `
interface Base {}
class Derived implements Base {}
    `,
    `
interface Base {
  process(): void;
}
class Derived implements Base {
  process() {}
}
    `,
    `
interface Base {
  value: string;
}
class Derived implements Base {
  value: string;
}
    `,
    `
interface Root {
  value: string;
}
class Base implements Root {
  value: string;
}
class Derived implements Base {
  value: string;
}
    `,
    `
interface Base1 {
  value: string;
}
interface Base2 {
  value: string;
}
class Derived implements Base1, Base2 {
  value: string;
}
    `,
    `
interface Root {
  ['process'](value: string): void;
}

class Base implements Root {}

const Derived = class extends Base {
  public ['process'](value: string) {}
};
    `,
    `
const key = 'process';

interface Root {
  [key](value: string): void;
}

class Base implements Root {}

const Derived = class extends Base {
  public [key](value: string) {}
};
    `,
    `
class Base {
  process(prefix: string | null) {}
}

class Derived extends Base {
  process(prefix: string, value: string) {}
}
    `,
    `
class Derived implements NotResolved {
  process(prefix: string, value: string) {}
}
    `,
    `
class Derived extends NotResolved {
  process(prefix: string, value: string) {}
}
    `,
    `
class ExtendsNotResolved extends NotResolved {}

class Derived extends ExtendsNotResolved {
  process(prefix: string, value: string) {}
}
    `,
    `
class ImplementsNotResolved implements NotResolved {}

class Derived extends ImplementsNotResolved {
  process(prefix: string, value: string) {}
}
    `,
    `
interface Base<T> {
  value: T;
}

class Derived<T> implements Base<T> {
  value: T;
}
    `,
    `
interface Base<T> {
  value: T;
}

class Derived<T extends string> implements Base<T> {
  value: T;
}
    `,
    `
interface Base<T extends string | undefined> {
  value: T;
}

class Derived<T extends string | undefined> implements Base<T> {
  value: T;
}
    `,
    `
interface Base<Key> {
  get(key: Key): object | undefined;
}

class Derived<Key> implements Base<Key> {
  get(key: Key): object | undefined {
    return undefined;
  }
}
    `,
    `
interface Base<Key> {
  get(key: Key): object | undefined;
}

class Derived<Key extends string> implements Base<Key> {
  get(key: Key): object | undefined {
    return undefined;
  }
}
    `,
    `
interface Base<Key> {
  get(key: Key): object | undefined;
  set(key: Key, value: object): this;
}

class Derived<Key> implements Base<Key> {
  get(key: Key): object | undefined {
    return undefined;
  }

  set(key: Key, value: object): this {
    return this;
  }
}
    `,
    `
interface CacheLike<Key, Value> {
  get(key: Key): Value | undefined;
  set(key: Key, value: Value): this;
}

class ExpiringCache<Key, Value> implements CacheLike<Key, Value> {
  get(key: Key): Value | undefined {
    return undefined;
  }

  set(key: Key, value: Value): this {
    return this;
  }
}
    `,
  ],
  invalid: [
    {
      code: `
interface Base {
  value: string | undefined;
}

class Derived implements Base {
  value: string;
}
      `,
      errors: [
        {
          data: {
            interface: 'Base',
            name: 'value',
          },
          messageId: 'property',
        },
      ],
    },
    {
      code: `
interface Base {
  process(value: string | null): void;
}

class Derived implements Base {
  process(value: string) {}
}
      `,
      errors: [
        {
          data: {
            index: 0,
            interface: 'Base',
            name: 'process',
          },
          messageId: 'methodParameter',
        },
      ],
    },
    {
      code: `
interface Base {
  process(prefix: string, value: string | null): void;
}

class Derived implements Base {
  process(prefix: string, value: string) {}
}
      `,
      errors: [
        {
          data: {
            index: 1,
            interface: 'Base',
            name: 'process',
          },
          messageId: 'methodParameter',
        },
      ],
    },
    {
      code: `
interface Base {
  process(prefix: string | null, value: string | null): void;
}

class Derived implements Base {
  process(prefix: string | null, value: string) {}
}
      `,
      errors: [
        {
          data: {
            index: 1,
            interface: 'Base',
            name: 'process',
          },
          messageId: 'methodParameter',
        },
      ],
    },
    {
      code: `
interface Base {
  process(prefix: string | null, value: string | null): void;
}

class Derived implements Base {
  process(prefix: string, value: string) {}
}
      `,
      errors: [
        {
          data: {
            index: 0,
            interface: 'Base',
            name: 'process',
          },
          messageId: 'methodParameter',
        },
        {
          data: {
            index: 1,
            interface: 'Base',
            name: 'process',
          },
          messageId: 'methodParameter',
        },
      ],
    },
    {
      code: `
interface Base {
  process(prefix: string | null, value: string | null, suffix: number): void;
}

class Derived implements Base {
  process(prefix: string, value: string, suffix: number) {}
}
      `,
      errors: [
        {
          data: {
            index: 0,
            interface: 'Base',
            name: 'process',
          },
          messageId: 'methodParameter',
        },
        {
          data: {
            index: 1,
            interface: 'Base',
            name: 'process',
          },
          messageId: 'methodParameter',
        },
      ],
    },
    {
      code: `
interface Base {
  process(value?: string): void;
}

class Derived implements Base {
  process(value: string) {}
}
      `,
      errors: [
        {
          data: {
            index: 0,
            interface: 'Base',
            name: 'process',
          },
          messageId: 'methodParameter',
        },
      ],
    },
    {
      code: `
interface Base {
  process(first: string): void;
}

class Derived implements Base {
  process(first: string, second: string) {}
}
      `,
      errors: [
        {
          data: {
            interface: 'Base',
            name: 'process',
          },
          messageId: 'methodExcessParameters',
        },
      ],
    },
    {
      code: `
interface Base {
  process(first: string, second: string): void;
}

class Derived implements Base {
  process(first: string, second: string, third: string) {}
}
      `,
      errors: [
        {
          data: {
            interface: 'Base',
            name: 'process',
          },
          messageId: 'methodExcessParameters',
        },
      ],
    },
    {
      code: `
interface Base {
  process(first: string, second?: string): void;
}

class Derived implements Base {
  process(first: string, second: string, third: string) {}
}
      `,
      errors: [
        {
          data: {
            interface: 'Base',
            name: 'process',
          },
          messageId: 'methodExcessParameters',
        },
      ],
    },
    {
      code: `
interface Root {
  process(value?: string): void;
}

class Base implements Root {
  process(value?: string) {}
}

class Derived extends Base {
  process(value: string) {}
}
      `,
      errors: [
        {
          data: {
            index: 0,
            interface: 'Root',
            name: 'process',
          },
          messageId: 'methodParameter',
        },
      ],
    },
    {
      code: `
interface Root {
  process(value?: string): void;
}

class Base implements Root {
  process(value?: string): void {}
}

const Derived = class extends Base {
  process(value: string) {}
};
      `,
      errors: [
        {
          data: {
            index: 0,
            interface: 'Root',
            name: 'process',
          },
          messageId: 'methodParameter',
        },
      ],
    },
    {
      code: `
interface Root {
  process(value?: string): void;
}

abstract class Base implements Root {
  process(value?: string): void;
}

abstract class Derived extends Base {
  process(value: string): void;
}
      `,
      errors: [
        {
          data: {
            index: 0,
            interface: 'Root',
            name: 'process',
          },
          messageId: 'methodParameter',
        },
      ],
    },
    {
      code: `
interface Root {
  process(value?: string): void;
}

abstract class Base implements Root {
  process(value?: string): void {}
}

abstract class Derived extends Base {
  process(value: string) {}
}
      `,
      errors: [
        {
          data: {
            index: 0,
            interface: 'Root',
            name: 'process',
          },
          messageId: 'methodParameter',
        },
      ],
    },
    {
      code: `
interface Root {
  process(value?: string): void;
}

abstract class Base implements Root {
  process(value?: string): void {}
}

const Derived = class extends Base {
  process(value: string) {}
};
      `,
      errors: [
        {
          data: {
            index: 0,
            interface: 'Root',
            name: 'process',
          },
          messageId: 'methodParameter',
        },
      ],
    },
    {
      code: `
interface Root {
  process(value?: string): void;
}

abstract class Base implements Root {
  process(value?: string): void;
}

const Derived = class extends Base {
  process(value: string) {}
};
      `,
      errors: [
        {
          data: {
            index: 0,
            interface: 'Root',
            name: 'process',
          },
          messageId: 'methodParameter',
        },
      ],
    },
    {
      code: `
interface Base1 {
  value?: string;
}
interface Base2 {
  value: string;
}
class Derived implements Base1, Base2 {
  value: string;
}
      `,
      errors: [
        {
          data: {
            interface: 'Base1',
            name: 'value',
          },
          messageId: 'property',
        },
      ],
    },
    {
      code: `
interface Base1 {
  value?: string;
}
interface Base2 {
  value: string | undefined;
}
class Derived implements Base1, Base2 {
  value: string;
}
      `,
      errors: [
        {
          data: {
            interface: 'Base1',
            name: 'value',
          },
          messageId: 'property',
        },
        {
          data: {
            interface: 'Base2',
            name: 'value',
          },
          messageId: 'property',
        },
      ],
    },
    {
      code: `
interface Base1 {
  value?: string;
}
interface Base2 extends Base1 {
  unrelated?: boolean;
}
interface Base3 {
  value: string | undefined;
}
class Derived implements Base3, Base2 {
  value: string;
}
      `,
      errors: [
        {
          data: {
            interface: 'Base3',
            name: 'value',
          },
          messageId: 'property',
        },
        {
          data: {
            interface: 'Base1',
            name: 'value',
          },
          messageId: 'property',
        },
      ],
    },
    {
      code: `
interface Base1 {
  value1?: string;
}
interface Base2 extends Base1 {
  unrelated?: boolean;
}
interface Base3 {
  value3: string | undefined;
}
class Derived implements Base3, Base2 {
  value1: string;
  value3: string;
}
      `,
      errors: [
        {
          data: {
            interface: 'Base1',
            name: 'value1',
          },
          messageId: 'property',
        },
        {
          data: {
            interface: 'Base3',
            name: 'value3',
          },
          messageId: 'property',
        },
      ],
    },
    {
      code: `
interface Base<T extends object> {
  value: T | undefined;
}

class Derived<T extends object> implements Base<T> {
  value: T;
}
      `,
      errors: [
        {
          data: {
            index: 0,
            interface: 'Base',
            name: 'value',
          },
          messageId: 'property',
        },
      ],
    },
    {
      code: `
interface Base<T extends object | undefined> {
  value: T;
}

class Derived<T extends object> implements Base<T> {
  value: T;
}
      `,
      errors: [
        {
          data: {
            index: 0,
            interface: 'Base',
            name: 'value',
          },
          messageId: 'property',
        },
      ],
    },
    {
      code: `
interface CacheLike<Value> {
  get(key: string): Value | undefined;
  set(key: string | undefined, value: Value): this;
}

class ExpiringCache<Value> implements CacheLike<Value> {
  get(key: string): Value | undefined {
    return undefined;
  }

  set(key: string, value: Value): this {
    return this;
  }
}
      `,
      errors: [
        {
          data: {
            index: 0,
            interface: 'CacheLike',
            name: 'set',
          },
          messageId: 'methodParameter',
        },
      ],
    },
    {
      code: `
interface CacheLike<Key> {
  get(key: Key): unknown | undefined;
  set(key: Key, value: unknown[] | undefined): this;
}

class ExpiringCache<Key> implements CacheLike<Key> {
  get(key: Key): unknown | undefined {
    return undefined;
  }

  set(key: Key, value: unknown[]): this {
    return this;
  }
}
      `,
      errors: [
        {
          data: {
            index: 1,
            interface: 'CacheLike',
            name: 'set',
          },
          messageId: 'methodParameter',
        },
      ],
    },
  ],
});

// todo: variadic parameters (mixed and equivalent)
