import rule from '../../src/rules/no-invalid-this';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
  },
});

const errors = [
  { messageId: 'unexpectedThis' as const },
  { messageId: 'unexpectedThis' as const },
];

ruleTester.run('no-invalid-this', rule, {
  valid: [
    `
describe('foo', () => {
  it('does something', function (this: Mocha.Context) {
    this.timeout(100);
    // done
  });
});
    `,
    `
      interface SomeType {
        prop: string;
      }
      function foo(this: SomeType) {
        this.prop;
      }
    `,
    `
function foo(this: prop) {
  this.propMethod();
}
    `,
    `
z(function (x, this: context) {
  console.log(x, this);
});
    `,
    // https://github.com/eslint/eslint/issues/3287

    `
function foo() {
  /** @this Obj*/ return function bar() {
    console.log(this);
    z(x => console.log(x, this));
  };
}
    `,

    // https://github.com/eslint/eslint/issues/6824

    `
var Ctor = function () {
  console.log(this);
  z(x => console.log(x, this));
};
    `,
    // Constructors.
    {
      code: `
function Foo() {
  console.log(this);
  z(x => console.log(x, this));
}
      `,
    },
    {
      code: `
function Foo() {
  console.log(this);
  z(x => console.log(x, this));
}
      `,

      options: [{}], // test the default value in schema
    },
    {
      code: `
function Foo() {
  console.log(this);
  z(x => console.log(x, this));
}
      `,

      options: [{ capIsConstructor: true }], // test explicitly set option to the default value
    },
    {
      code: `
var Foo = function Foo() {
  console.log(this);
  z(x => console.log(x, this));
};
      `,
    },
    {
      code: `
class A {
  constructor() {
    console.log(this);
    z(x => console.log(x, this));
  }
}
      `,
    },

    // On a property.
    {
      code: `
var obj = {
  foo: function () {
    console.log(this);
    z(x => console.log(x, this));
  },
};
      `,
    },
    {
      code: `
var obj = {
  foo() {
    console.log(this);
    z(x => console.log(x, this));
  },
};
      `,
    },
    {
      code: `
var obj = {
  foo:
    foo ||
    function () {
      console.log(this);
      z(x => console.log(x, this));
    },
};
      `,
    },
    {
      code: `
var obj = {
  foo: hasNative
    ? foo
    : function () {
        console.log(this);
        z(x => console.log(x, this));
      },
};
      `,
    },
    {
      code: `
var obj = {
  foo: (function () {
    return function () {
      console.log(this);
      z(x => console.log(x, this));
    };
  })(),
};
      `,
    },
    {
      code: `
Object.defineProperty(obj, 'foo', {
  value: function () {
    console.log(this);
    z(x => console.log(x, this));
  },
});
      `,
    },
    {
      code: `
Object.defineProperties(obj, {
  foo: {
    value: function () {
      console.log(this);
      z(x => console.log(x, this));
    },
  },
});
      `,
    },

    // Assigns to a property.
    {
      code: `
obj.foo = function () {
  console.log(this);
  z(x => console.log(x, this));
};
      `,
    },
    {
      code: `
obj.foo =
  foo ||
  function () {
    console.log(this);
    z(x => console.log(x, this));
  };
      `,
    },
    {
      code: `
obj.foo = foo
  ? bar
  : function () {
      console.log(this);
      z(x => console.log(x, this));
    };
      `,
    },
    {
      code: `
obj.foo = (function () {
  return function () {
    console.log(this);
    z(x => console.log(x, this));
  };
})();
      `,
    },
    {
      code: `
obj.foo = (() =>
  function () {
    console.log(this);
    z(x => console.log(x, this));
  })();
      `,
    },

    // Bind/Call/Apply
    `
(function () {
  console.log(this);
  z(x => console.log(x, this));
}.call(obj));
    `,
    `
var foo = function () {
  console.log(this);
  z(x => console.log(x, this));
}.bind(obj);
    `,
    `
Reflect.apply(
  function () {
    console.log(this);
    z(x => console.log(x, this));
  },
  obj,
  [],
);
    `,
    `
(function () {
  console.log(this);
  z(x => console.log(x, this));
}.apply(obj));
    `,

    // Class Instance Methods.
    `
class A {
  foo() {
    console.log(this);
    z(x => console.log(x, this));
  }
}
    `,

    // Class Properties.
    `
class A {
  b = 0;
  c = this.b;
}
    `,

    `
class A {
  b = new Array(this, 1, 2, 3);
}
    `,

    `
class A {
  b = () => {
    console.log(this);
  };
}
    `,

    // Array methods.

    `
Array.from(
  [],
  function () {
    console.log(this);
    z(x => console.log(x, this));
  },
  obj,
);
    `,

    `
foo.every(function () {
  console.log(this);
  z(x => console.log(x, this));
}, obj);
    `,

    `
foo.filter(function () {
  console.log(this);
  z(x => console.log(x, this));
}, obj);
    `,

    `
foo.find(function () {
  console.log(this);
  z(x => console.log(x, this));
}, obj);
    `,

    `
foo.findIndex(function () {
  console.log(this);
  z(x => console.log(x, this));
}, obj);
    `,

    `
foo.forEach(function () {
  console.log(this);
  z(x => console.log(x, this));
}, obj);
    `,

    `
foo.map(function () {
  console.log(this);
  z(x => console.log(x, this));
}, obj);
    `,

    `
foo.some(function () {
  console.log(this);
  z(x => console.log(x, this));
}, obj);
    `,

    // @this tag.

    `
/** @this Obj */ function foo() {
  console.log(this);
  z(x => console.log(x, this));
}
    `,

    `
foo(
  /* @this Obj */ function () {
    console.log(this);
    z(x => console.log(x, this));
  },
);
    `,

    `
/**
 * @returns {void}
 * @this Obj
 */
function foo() {
  console.log(this);
  z(x => console.log(x, this));
}
    `,

    `
Ctor = function () {
  console.log(this);
  z(x => console.log(x, this));
};
    `,

    `
function foo(
  Ctor = function () {
    console.log(this);
    z(x => console.log(x, this));
  },
) {}
    `,

    `
[
  obj.method = function () {
    console.log(this);
    z(x => console.log(x, this));
  },
] = a;
    `,

    // Static

    `
class A {
  static foo() {
    console.log(this);
    z(x => console.log(x, this));
  }
}
    `,
  ],

  invalid: [
    {
      code: `
interface SomeType {
  prop: string;
}
function foo() {
  this.prop;
}
      `,
      errors: [{ messageId: 'unexpectedThis' }],
    },
    // Global.
    {
      code: `
console.log(this);
z(x => console.log(x, this));
      `,

      errors,
    },
    {
      code: `
console.log(this);
z(x => console.log(x, this));
      `,
      parserOptions: {
        ecmaFeatures: { globalReturn: true },
      },
      errors,
    },

    // IIFE.
    {
      code: `
(function () {
  console.log(this);
  z(x => console.log(x, this));
})();
      `,

      errors,
    },

    // Just functions.
    {
      code: `
function foo() {
  console.log(this);
  z(x => console.log(x, this));
}
      `,

      errors,
    },
    {
      code: `
function foo() {
  console.log(this);
  z(x => console.log(x, this));
}
      `,

      options: [{ capIsConstructor: false }], // test that the option doesn't reverse the logic and mistakenly allows lowercase functions
      errors,
    },
    {
      code: `
function Foo() {
  console.log(this);
  z(x => console.log(x, this));
}
      `,

      options: [{ capIsConstructor: false }],
      errors,
    },
    {
      code: `
function foo() {
  'use strict';
  console.log(this);
  z(x => console.log(x, this));
}
      `,

      errors,
    },
    {
      code: `
function Foo() {
  'use strict';
  console.log(this);
  z(x => console.log(x, this));
}
      `,

      options: [{ capIsConstructor: false }],
      errors,
    },
    {
      code: `
return function () {
  console.log(this);
  z(x => console.log(x, this));
};
      `,
      parserOptions: {
        ecmaFeatures: { globalReturn: true },
      },
      errors,
    },
    {
      code: `
var foo = function () {
  console.log(this);
  z(x => console.log(x, this));
}.bar(obj);
      `,

      errors,
    },

    // Functions in methods.
    {
      code: `
var obj = {
  foo: function () {
    function foo() {
      console.log(this);
      z(x => console.log(x, this));
    }
    foo();
  },
};
      `,

      errors,
    },
    {
      code: `
var obj = {
  foo() {
    function foo() {
      console.log(this);
      z(x => console.log(x, this));
    }
    foo();
  },
};
      `,

      errors,
    },
    {
      code: `
var obj = {
  foo: function () {
    return function () {
      console.log(this);
      z(x => console.log(x, this));
    };
  },
};
      `,

      errors,
    },
    {
      code: `
var obj = {
  foo: function () {
    'use strict';
    return function () {
      console.log(this);
      z(x => console.log(x, this));
    };
  },
};
      `,

      errors,
    },
    {
      code: `
obj.foo = function () {
  return function () {
    console.log(this);
    z(x => console.log(x, this));
  };
};
      `,

      errors,
    },
    {
      code: `
obj.foo = function () {
  'use strict';
  return function () {
    console.log(this);
    z(x => console.log(x, this));
  };
};
      `,

      errors,
    },

    // Class Methods.

    {
      code: `
class A {
  foo() {
    return function () {
      console.log(this);
      z(x => console.log(x, this));
    };
  }
}
      `,

      errors,
    },

    // Class Properties.

    {
      code: `
class A {
  b = new Array(1, 2, function () {
    console.log(this);
    z(x => console.log(x, this));
  });
}
      `,

      errors,
    },

    {
      code: `
class A {
  b = () => {
    function c() {
      console.log(this);
      z(x => console.log(x, this));
    }
  };
}
      `,

      errors,
    },

    // Class Static methods.

    {
      code: `
obj.foo = (function () {
  return () => {
    console.log(this);
    z(x => console.log(x, this));
  };
})();
      `,

      errors,
    },
    {
      code: `
obj.foo = (() => () => {
  console.log(this);
  z(x => console.log(x, this));
})();
      `,

      errors,
    },
    // Bind/Call/Apply

    {
      code: `
var foo = function () {
  console.log(this);
  z(x => console.log(x, this));
}.bind(null);
      `,

      errors,
    },

    {
      code: `
(function () {
  console.log(this);
  z(x => console.log(x, this));
}.call(undefined));
      `,

      errors,
    },

    {
      code: `
(function () {
  console.log(this);
  z(x => console.log(x, this));
}.apply(void 0));
      `,

      errors,
    },

    // Array methods.
    {
      code: `
Array.from([], function () {
  console.log(this);
  z(x => console.log(x, this));
});
      `,

      errors,
    },
    {
      code: `
foo.every(function () {
  console.log(this);
  z(x => console.log(x, this));
});
      `,

      errors,
    },
    {
      code: `
foo.filter(function () {
  console.log(this);
  z(x => console.log(x, this));
});
      `,

      errors,
    },
    {
      code: `
foo.find(function () {
  console.log(this);
  z(x => console.log(x, this));
});
      `,

      errors,
    },
    {
      code: `
foo.findIndex(function () {
  console.log(this);
  z(x => console.log(x, this));
});
      `,

      errors,
    },
    {
      code: `
foo.forEach(function () {
  console.log(this);
  z(x => console.log(x, this));
});
      `,

      errors,
    },
    {
      code: `
foo.map(function () {
  console.log(this);
  z(x => console.log(x, this));
});
      `,

      errors,
    },
    {
      code: `
foo.some(function () {
  console.log(this);
  z(x => console.log(x, this));
});
      `,

      errors,
    },

    {
      code: `
foo.forEach(function () {
  console.log(this);
  z(x => console.log(x, this));
}, null);
      `,

      errors,
    },

    // @this tag.

    {
      code: `
/** @returns {void} */ function foo() {
  console.log(this);
  z(x => console.log(x, this));
}
      `,

      errors,
    },
    {
      code: `
/** @this Obj */ foo(function () {
  console.log(this);
  z(x => console.log(x, this));
});
      `,

      errors,
    },

    {
      code: `
var Ctor = function () {
  console.log(this);
  z(x => console.log(x, this));
};
      `,

      options: [{ capIsConstructor: false }],
      errors,
    },
    {
      code: `
var func = function () {
  console.log(this);
  z(x => console.log(x, this));
};
      `,

      errors,
    },
    {
      code: `
var func = function () {
  console.log(this);
  z(x => console.log(x, this));
};
      `,

      options: [{ capIsConstructor: false }],
      errors,
    },

    {
      code: `
Ctor = function () {
  console.log(this);
  z(x => console.log(x, this));
};
      `,

      options: [{ capIsConstructor: false }],
      errors,
    },
    {
      code: `
func = function () {
  console.log(this);
  z(x => console.log(x, this));
};
      `,

      errors,
    },
    {
      code: `
func = function () {
  console.log(this);
  z(x => console.log(x, this));
};
      `,

      options: [{ capIsConstructor: false }],
      errors,
    },

    {
      code: `
function foo(
  func = function () {
    console.log(this);
    z(x => console.log(x, this));
  },
) {}
      `,

      errors,
    },

    {
      code: `
[
  func = function () {
    console.log(this);
    z(x => console.log(x, this));
  },
] = a;
      `,

      errors,
    },
  ],
});
