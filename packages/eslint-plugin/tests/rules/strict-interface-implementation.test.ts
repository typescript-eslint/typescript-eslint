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
const Root = class {
  ['process'](value: string) {}
};

class Base extends Root {}

const Derived = class extends Base {
  public ['process'](value: string) {}
};
    `,
    `
const key = 'process';

const Root = class {
  [key](value: string) {}
};

class Base extends Root {}

const Derived = class extends Base {
  public [key](value: string) {}
};
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
          messageId: 'unassignable',
        },
      ],
    },
    {
      code: `
interface Base {
  process(value: string | null): void;
}

class Derived implements Base {
  public process(value: string) {}
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
  public process(prefix: string, value: string) {}
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
  public process(prefix: string | null, value: string) {}
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
  public process(prefix: string, value: string) {}
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
  public process(prefix: string, value: string, suffix: number) {}
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
  public process(value: string) {}
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
class Base {
  process(value?: string) {}
}

class Derived extends Base {
  public process(value: string) {}
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
class Root {
  process(value?: string) {}
}

class Base extends Root {}

class Derived extends Base {
  public process(value: string) {}
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
const Root = class {
  process(value?: string) {}
};

class Base extends Root {}

const Derived = class extends Base {
  public process(value: string) {}
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
          messageId: 'unassignable',
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
          messageId: 'unassignable',
        },
        {
          data: {
            interface: 'Base2',
            name: 'value',
          },
          messageId: 'unassignable',
        },
      ],
    },
    {
      code: `
interface Base {
  ['process'](value?: string): void;
}

const Derived = class implements Base {
  public ['process'](value: string) {}
};
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
  ],
});
