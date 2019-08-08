import rule from "../../src/rules/switch-final-break";
import { RuleTester } from "../RuleTester";


const ruleTester = new RuleTester({
  parser: "@typescript-eslint/parser",
});

ruleTester.run("switch-final-break", rule, {
  valid: [
    //default option
    `switch (x) {
    case 0:
        foo();
}
`,
    `
    switch (x) {}
    `,
    `
switch (x) {
    case 0: {
        foo();
    }
}
`,
    `switch (x) {
    default:
        foo();
}
`,
    `switch (x) {
    default: {
        foo();
    }
}
`,
    `
switch (x) {
    case 0:
}
`,
    `outer: while (true) {
    switch (x) {
        case 0:
            x++;
            break;
        default:
            break outer;
    }
}`,
    //always option
    {
      code: `switch (x) {
  case 0:
    foo();
    break;
  }`,
      options: ["always"],
    }
    ,
    {
      code: `switch (x) {
  case 0: {
      foo();
      break;
    }
  }`,
      options: ["always"],
    }
    ,
    {
      code: `switch (x) {
  default:
    foo();
    break;
  }`,
      options: ["always"],
    },
  ],
  invalid: [
    {
      code: `switch (x) {
    case 0:
        foo();
        break;
}
      `,
      errors: [
        {
          messageId: "switchFinalBreakNever",
          line: 4,
          column: 9,
        },
      ],
      output: `switch (x) {
    case 0:
        foo();
}
      `,
    },
    {
      code: `
switch (x) {
    case 0: {
        foo();
        break;
    }
}
      `,
      errors: [
        {
          messageId: "switchFinalBreakNever",
          line: 5,
          column: 9,
        },
      ],
      output: `
switch (x) {
    case 0: {
        foo();
    }
}
      `,
    },
{
      code: `switch (x) {
    case 0: {
        foo();break;
    }
}`,
      errors: [
        {
          messageId: "switchFinalBreakNever",
          line: 3,
          column: 15,
        },
      ],
      output: `switch (x) {
    case 0: {
        foo();
    }
}`,
    },
    {
      code: `switch (x) {
    case 0: {
        foo();  break;
    }
}`,
      errors: [
        {
          messageId: "switchFinalBreakNever",
          line: 3,
          column: 17,
        },
      ],
      output: `switch (x) {
    case 0: {
        foo();
    }
}`,
    },
    {
      code: `
switch (x) {
    default:
        foo();
        break;
}
      `,
      errors: [
        {
          messageId: "switchFinalBreakNever",
          line: 5,
          column: 9,
        },
      ],
      output: `
switch (x) {
    default:
        foo();
}
      `,
    },

    {
      code: `
outer2: while (true) {
    inner: switch (x) {
        case 0:
            ++x;
            break;
        default:
            break inner;
    }
}      `,
      errors: [
        {
          messageId: "switchFinalBreakNever",
          line: 8,
          column: 13,
        },
      ],
      output: `
outer2: while (true) {
    inner: switch (x) {
        case 0:
            ++x;
            break;
        default:
    }
}      `,
    },
    //always option
    {
      code:
        `switch (x) {
  case 0:
    foo();
  }`,
      options: ["always"],
      errors: [
        {
          messageId: "switchFinalBreakAlways",
          line: 2,
          column: 3,
        },
      ],
      output:`switch (x) {
  case 0:
    foo();
    break;
  }`,
    },
    {
      code:
        `switch (x) {
  case 0: {
      foo();
    }
  }`,
      options: ["always"],
      errors:
        [
          {
            messageId: "switchFinalBreakAlways",
            line: 2,
            column: 3,
          },
        ],
      output: `switch (x) {
  case 0: {
      foo();
      break;
    }
  }`,
    },
    {
      code:
        `switch (x) {
  default:
    foo();
  }`,
      options: ["always"],
      errors:
        [
          {
            messageId: "switchFinalBreakAlways",
            line: 2,
            column: 3,
          },
        ],
      output:
        `switch (x) {
  default:
    foo();
    break;
  }`,
    }
    ,
    {
      code:
        `switch (x) {
  default: {
      foo();
    }
  }`,output:
        `switch (x) {
  default: {
      foo();
      break;
    }
  }`,
      options: ["always"],
      errors:
        [
          {
            messageId: "switchFinalBreakAlways",
            line: 2,
            column: 3,
          },
        ],
    },
    {
      code:
        `switch (x) {
  case 0:
  }`,
      options: ["always"],
      errors: [
        {
          messageId: "switchFinalBreakAlways",
          line: 2,
          column: 3,
        },
      ],
    },

  ],
}
)
;
