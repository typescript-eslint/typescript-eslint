/* eslint-disable @typescript-eslint/internal/plugin-test-formatting */
/* eslint-disable eslint-plugin/require-test-error-positions */
import { RuleTester } from '@typescript-eslint/rule-tester';
import { DefinitionType } from '@typescript-eslint/scope-manager';

import rule from '../../../src/rules/naming-convention';

const ruleTester = new RuleTester();

ruleTester.run('naming-convention generated cases', rule, {
  invalid: [
    {
      code: 'class Ignored { accessor snake_case = 10; }',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { accessor #snake_case = 10; }',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { static accessor snake_case = 10; }',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { static accessor #snake_case = 10; }',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { private accessor snake_case = 10; }',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { private static accessor snake_case = 10; }',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { override accessor snake_case = 10; }',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { accessor "snake_case" = 10; }',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { protected accessor snake_case = 10; }',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { public accessor snake_case = 10; }',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { abstract accessor snake_case; }',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'const ignored = { get snake_case() {} };',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'const ignored = { set "snake_case"(ignored) {} };',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { private get snake_case() {} }',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { private set "snake_case"(ignored) {} }',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { private static get snake_case() {} }',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { static get #snake_case() {} }',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { accessor snake_case = 10; }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Auto Accessor',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'autoAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { accessor #snake_case = 10; }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Auto Accessor',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'autoAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { static accessor snake_case = 10; }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Auto Accessor',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'autoAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { static accessor #snake_case = 10; }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Auto Accessor',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'autoAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { private accessor snake_case = 10; }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Auto Accessor',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'autoAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { private static accessor snake_case = 10; }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Auto Accessor',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'autoAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { override accessor snake_case = 10; }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Auto Accessor',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'autoAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { accessor "snake_case" = 10; }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Auto Accessor',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'autoAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { protected accessor snake_case = 10; }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Auto Accessor',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'autoAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { public accessor snake_case = 10; }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Auto Accessor',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'autoAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { abstract accessor snake_case; }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Auto Accessor',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'autoAccessor',
        },
      ],
    },
    {
      code: 'class snake_case {}',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Class',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'class',
        },
      ],
    },
    {
      code: 'abstract class snake_case {}',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Class',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'class',
        },
      ],
    },
    {
      code: 'const ignored = class snake_case {}',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Class',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'class',
        },
      ],
    },
    {
      code: 'const ignored = { get snake_case() {} };',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Classic Accessor',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classicAccessor',
        },
      ],
    },
    {
      code: 'const ignored = { set "snake_case"(ignored) {} };',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Classic Accessor',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classicAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { private get snake_case() {} }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Classic Accessor',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classicAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { private set "snake_case"(ignored) {} }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Classic Accessor',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classicAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { private static get snake_case() {} }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Classic Accessor',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classicAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { static get #snake_case() {} }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Classic Accessor',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classicAccessor',
        },
      ],
    },
    {
      code: 'abstract class Ignored { abstract get snake_case(): number }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Classic Accessor',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classicAccessor',
        },
      ],
    },
    {
      code: 'abstract class Ignored { abstract set snake_case(ignored: number) }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Classic Accessor',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classicAccessor',
        },
      ],
    },
    {
      code: 'const snake_case = 1;',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'function snake_case () {}',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: '(function (snake_case) {});',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'class Ignored { constructor(private snake_case) {} }',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'const ignored = { snake_case };',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'interface Ignored { snake_case: string }',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'type Ignored = { snake_case: string }',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'class Ignored { private snake_case = 1 }',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'class Ignored { #snake_case = 1 }',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'class Ignored { #snake_case() {} }',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'class Ignored { private snake_case() {} }',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'const ignored = { snake_case() {} };',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'class Ignored { private get snake_case() {} }',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'enum Ignored { snake_case }',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'abstract class snake_case {}',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'interface snake_case { }',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'type snake_case = { };',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'enum snake_case {}',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'interface Ignored<snake_case> extends Ignored<string> {}',
      errors: [
        {
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'enum snake_case {}',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Enum',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'enum',
        },
      ],
    },
    {
      code: 'enum Ignored { snake_case }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Enum Member',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'enumMember',
        },
      ],
    },
    {
      code: 'enum Ignored { "snake_case" }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Enum Member',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'enumMember',
        },
      ],
    },
    {
      code: 'function snake_case () {}',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Function',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'function',
        },
      ],
    },
    {
      code: '(function snake_case () {});',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Function',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'function',
        },
      ],
    },
    {
      code: 'declare function snake_case ();',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Function',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'function',
        },
      ],
    },
    {
      code: 'interface snake_case {}',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Interface',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'interface',
        },
      ],
    },
    {
      code: 'class Ignored { private snake_case() {} }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Class Method',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classMethod',
        },
      ],
    },
    {
      code: 'class Ignored { private "snake_case"() {} }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Class Method',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classMethod',
        },
      ],
    },
    {
      code: 'class Ignored { private async snake_case() {} }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Class Method',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classMethod',
        },
      ],
    },
    {
      code: 'class Ignored { private static snake_case() {} }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Class Method',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classMethod',
        },
      ],
    },
    {
      code: 'class Ignored { private static async snake_case() {} }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Class Method',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classMethod',
        },
      ],
    },
    {
      code: 'class Ignored { private snake_case = () => {} }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Class Method',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classMethod',
        },
      ],
    },
    {
      code: 'class Ignored { abstract snake_case() }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Class Method',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classMethod',
        },
      ],
    },
    {
      code: 'class Ignored { #snake_case() }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Class Method',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classMethod',
        },
      ],
    },
    {
      code: 'class Ignored { static #snake_case() }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Class Method',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classMethod',
        },
      ],
    },
    {
      code: 'const ignored = { snake_case() {} };',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Object Literal Method',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'objectLiteralMethod',
        },
      ],
    },
    {
      code: 'const ignored = { "snake_case"() {} };',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Object Literal Method',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'objectLiteralMethod',
        },
      ],
    },
    {
      code: 'const ignored = { snake_case: () => {} };',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Object Literal Method',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'objectLiteralMethod',
        },
      ],
    },
    {
      code: 'interface Ignored { snake_case(): string }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Type Method',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeMethod',
        },
      ],
    },
    {
      code: 'interface Ignored { "snake_case"(): string }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Type Method',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeMethod',
        },
      ],
    },
    {
      code: 'interface Ignored { snake_case: () => string }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Type Method',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeMethod',
        },
      ],
    },
    {
      code: 'interface Ignored { "snake_case": () => string }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Type Method',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeMethod',
        },
      ],
    },
    {
      code: 'type Ignored = { snake_case(): string }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Type Method',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeMethod',
        },
      ],
    },
    {
      code: 'type Ignored = { "snake_case"(): string }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Type Method',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeMethod',
        },
      ],
    },
    {
      code: 'type Ignored = { snake_case: () => string }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Type Method',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeMethod',
        },
      ],
    },
    {
      code: 'type Ignored = { "snake_case": () => string }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Type Method',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeMethod',
        },
      ],
    },
    {
      code: 'function ignored(snake_case) {}',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: DefinitionType.Parameter,
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameter',
        },
      ],
    },
    {
      code: '(function (snake_case) {});',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: DefinitionType.Parameter,
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameter',
        },
      ],
    },
    {
      code: 'declare function ignored(snake_case);',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: DefinitionType.Parameter,
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameter',
        },
      ],
    },
    {
      code: 'function ignored({snake_case}) {}',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: DefinitionType.Parameter,
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameter',
        },
      ],
    },
    {
      code: 'function ignored(...snake_case) {}',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: DefinitionType.Parameter,
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameter',
        },
      ],
    },
    {
      code: 'function ignored({snake_case = 1}) {}',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: DefinitionType.Parameter,
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameter',
        },
      ],
    },
    {
      code: 'function ignored({...snake_case}) {}',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: DefinitionType.Parameter,
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameter',
        },
      ],
    },
    {
      code: 'function ignored([snake_case]) {}',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: DefinitionType.Parameter,
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameter',
        },
      ],
    },
    {
      code: 'function ignored([snake_case = 1]) {}',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: DefinitionType.Parameter,
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameter',
        },
      ],
    },
    {
      code: 'function ignored([...snake_case]) {}',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: DefinitionType.Parameter,
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameter',
        },
      ],
    },
    {
      code: 'class Ignored { constructor(private snake_case) {} }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Parameter Property',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameterProperty',
        },
      ],
    },
    {
      code: 'class Ignored { constructor(readonly snake_case) {} }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Parameter Property',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameterProperty',
        },
      ],
    },
    {
      code: 'class Ignored { constructor(private readonly snake_case) {} }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Parameter Property',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameterProperty',
        },
      ],
    },
    {
      code: 'class Ignored { constructor(private readonly snake_case) {} }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Parameter Property',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          modifiers: ['readonly'],
          selector: 'parameterProperty',
        },
      ],
    },
    {
      code: 'class Ignored { private snake_case }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Class Property',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classProperty',
        },
      ],
    },
    {
      code: 'class Ignored { private "snake_case" = 1 }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Class Property',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classProperty',
        },
      ],
    },
    {
      code: 'class Ignored { private readonly snake_case = 1 }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Class Property',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classProperty',
        },
      ],
    },
    {
      code: 'class Ignored { private static snake_case }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Class Property',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classProperty',
        },
      ],
    },
    {
      code: 'class Ignored { private static readonly snake_case = 1 }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Class Property',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classProperty',
        },
      ],
    },
    {
      code: 'class Ignored { abstract snake_case }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Class Property',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classProperty',
        },
      ],
    },
    {
      code: 'class Ignored { declare snake_case }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Class Property',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classProperty',
        },
      ],
    },
    {
      code: 'class Ignored { #snake_case }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Class Property',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classProperty',
        },
      ],
    },
    {
      code: 'class Ignored { static #snake_case }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Class Property',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classProperty',
        },
      ],
    },
    {
      code: 'const ignored = { snake_case };',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Object Literal Property',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'objectLiteralProperty',
        },
      ],
    },
    {
      code: 'const ignored = { "snake_case": 1 };',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Object Literal Property',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'objectLiteralProperty',
        },
      ],
    },
    {
      code: 'interface Ignored { snake_case }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Type Property',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeProperty',
        },
      ],
    },
    {
      code: 'interface Ignored { "snake_case": string }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Type Property',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeProperty',
        },
      ],
    },
    {
      code: 'type Ignored = { snake_case }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Type Property',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeProperty',
        },
      ],
    },
    {
      code: 'type Ignored = { "snake_case": string }',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Type Property',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeProperty',
        },
      ],
    },
    {
      code: 'type snake_case = {};',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Type Alias',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeAlias',
        },
      ],
    },
    {
      code: 'type snake_case = 1;',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Type Alias',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeAlias',
        },
      ],
    },
    {
      code: 'class Ignored<snake_case> {}',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Type Parameter',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeParameter',
        },
      ],
    },
    {
      code: 'function ignored<snake_case>() {}',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Type Parameter',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeParameter',
        },
      ],
    },
    {
      code: 'type Ignored<snake_case> = { ignored: snake_case };',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Type Parameter',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeParameter',
        },
      ],
    },
    {
      code: 'interface Ignored<snake_case> extends Ignored<string> {}',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: 'Type Parameter',
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeParameter',
        },
      ],
    },
    {
      code: 'const snake_case = 1;',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: DefinitionType.Variable,
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'variable',
        },
      ],
    },
    {
      code: 'let snake_case = 1;',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: DefinitionType.Variable,
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'variable',
        },
      ],
    },
    {
      code: 'var snake_case = 1;',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: DefinitionType.Variable,
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'variable',
        },
      ],
    },
    {
      code: 'const {snake_case} = {ignored: 1};',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: DefinitionType.Variable,
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'variable',
        },
      ],
    },
    {
      code: 'const {snake_case = 2} = {ignored: 1};',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: DefinitionType.Variable,
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'variable',
        },
      ],
    },
    {
      code: 'const {...snake_case} = {ignored: 1};',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: DefinitionType.Variable,
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'variable',
        },
      ],
    },
    {
      code: 'const [snake_case] = [1];',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: DefinitionType.Variable,
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'variable',
        },
      ],
    },
    {
      code: 'const [snake_case = 1] = [1];',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: DefinitionType.Variable,
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'variable',
        },
      ],
    },
    {
      code: 'const [...snake_case] = [1];',
      errors: [
        {
          data: {
            formats: 'strictCamelCase',
            name: 'snake_case',
            type: DefinitionType.Variable,
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'variable',
        },
      ],
    },
    {
      code: 'const invalid_name = 1;',
      errors: [
        {
          data: {
            formats: 'camelCase',
            name: 'invalid_name',
            type: DefinitionType.Variable,
          },
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['camelCase'],
          selector: 'variable',
        },
      ],
    },
    {
      code: 'const _validName = 1;',
      errors: [
        {
          data: {
            name: '_validName',
            position: 'leading',
            type: DefinitionType.Variable,
          },
          messageId: 'unexpectedUnderscore',
        },
      ],
      options: [
        {
          format: ['camelCase'],
          leadingUnderscore: 'forbid',
          selector: 'variable',
        },
      ],
    },
    {
      code: 'const validName = 1;',
      errors: [
        {
          data: {
            count: 'one',
            name: 'validName',
            position: 'leading',
            type: DefinitionType.Variable,
          },
          messageId: 'missingUnderscore',
        },
      ],
      options: [
        {
          format: ['camelCase'],
          leadingUnderscore: 'require',
          selector: 'variable',
        },
      ],
    },
    {
      code: 'const validName = 1;',
      errors: [
        {
          data: {
            affixes: 'Prefix',
            name: 'validName',
            position: 'prefix',
            type: DefinitionType.Variable,
          },
          messageId: 'missingAffix',
        },
      ],
      options: [
        {
          format: ['camelCase'],
          prefix: ['Prefix'],
          selector: 'variable',
        },
      ],
    },
  ],
  valid: [
    {
      code: 'class Ignored { accessor strictCamelCase = 10; }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { accessor #strictCamelCase = 10; }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { static accessor strictCamelCase = 10; }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { static accessor #strictCamelCase = 10; }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { private accessor strictCamelCase = 10; }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { private static accessor strictCamelCase = 10; }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { override accessor strictCamelCase = 10; }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { accessor "strictCamelCase" = 10; }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { protected accessor strictCamelCase = 10; }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { public accessor strictCamelCase = 10; }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { abstract accessor strictCamelCase; }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'const ignored = { get strictCamelCase() {} };',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'const ignored = { set "strictCamelCase"(ignored) {} };',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { private get strictCamelCase() {} }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { private set "strictCamelCase"(ignored) {} }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { private static get strictCamelCase() {} }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { static get #strictCamelCase() {} }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: 'class Ignored { accessor strictCamelCase = 10; }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'autoAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { accessor #strictCamelCase = 10; }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'autoAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { static accessor strictCamelCase = 10; }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'autoAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { static accessor #strictCamelCase = 10; }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'autoAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { private accessor strictCamelCase = 10; }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'autoAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { private static accessor strictCamelCase = 10; }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'autoAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { override accessor strictCamelCase = 10; }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'autoAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { accessor "strictCamelCase" = 10; }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'autoAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { protected accessor strictCamelCase = 10; }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'autoAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { public accessor strictCamelCase = 10; }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'autoAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { abstract accessor strictCamelCase; }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'autoAccessor',
        },
      ],
    },
    {
      code: 'class strictCamelCase {}',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'class',
        },
      ],
    },
    {
      code: 'abstract class strictCamelCase {}',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'class',
        },
      ],
    },
    {
      code: 'const ignored = class strictCamelCase {}',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'class',
        },
      ],
    },
    {
      code: 'const ignored = { get strictCamelCase() {} };',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classicAccessor',
        },
      ],
    },
    {
      code: 'const ignored = { set "strictCamelCase"(ignored) {} };',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classicAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { private get strictCamelCase() {} }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classicAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { private set "strictCamelCase"(ignored) {} }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classicAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { private static get strictCamelCase() {} }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classicAccessor',
        },
      ],
    },
    {
      code: 'class Ignored { static get #strictCamelCase() {} }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classicAccessor',
        },
      ],
    },
    {
      code: 'abstract class Ignored { abstract get strictCamelCase(): number }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classicAccessor',
        },
      ],
    },
    {
      code: 'abstract class Ignored { abstract set strictCamelCase(ignored: number) }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classicAccessor',
        },
      ],
    },
    {
      code: 'const strictCamelCase = 1;',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'function strictCamelCase () {}',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: '(function (strictCamelCase) {});',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'class Ignored { constructor(private strictCamelCase) {} }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'const ignored = { strictCamelCase };',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'interface Ignored { strictCamelCase: string }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'type Ignored = { strictCamelCase: string }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'class Ignored { private strictCamelCase = 1 }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'class Ignored { #strictCamelCase = 1 }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'class Ignored { #strictCamelCase() {} }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'class Ignored { private strictCamelCase() {} }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'const ignored = { strictCamelCase() {} };',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'class Ignored { private get strictCamelCase() {} }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'enum Ignored { strictCamelCase }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'abstract class strictCamelCase {}',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'interface strictCamelCase { }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'type strictCamelCase = { };',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'enum strictCamelCase {}',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'interface Ignored<strictCamelCase> extends Ignored<string> {}',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: 'enum strictCamelCase {}',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'enum',
        },
      ],
    },
    {
      code: 'enum Ignored { strictCamelCase }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'enumMember',
        },
      ],
    },
    {
      code: 'enum Ignored { "strictCamelCase" }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'enumMember',
        },
      ],
    },
    {
      code: 'function strictCamelCase () {}',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'function',
        },
      ],
    },
    {
      code: '(function strictCamelCase () {});',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'function',
        },
      ],
    },
    {
      code: 'declare function strictCamelCase ();',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'function',
        },
      ],
    },
    {
      code: 'interface strictCamelCase {}',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'interface',
        },
      ],
    },
    {
      code: 'class Ignored { private strictCamelCase() {} }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classMethod',
        },
      ],
    },
    {
      code: 'class Ignored { private "strictCamelCase"() {} }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classMethod',
        },
      ],
    },
    {
      code: 'class Ignored { private async strictCamelCase() {} }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classMethod',
        },
      ],
    },
    {
      code: 'class Ignored { private static strictCamelCase() {} }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classMethod',
        },
      ],
    },
    {
      code: 'class Ignored { private static async strictCamelCase() {} }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classMethod',
        },
      ],
    },
    {
      code: 'class Ignored { private strictCamelCase = () => {} }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classMethod',
        },
      ],
    },
    {
      code: 'class Ignored { abstract strictCamelCase() }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classMethod',
        },
      ],
    },
    {
      code: 'class Ignored { #strictCamelCase() }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classMethod',
        },
      ],
    },
    {
      code: 'class Ignored { static #strictCamelCase() }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classMethod',
        },
      ],
    },
    {
      code: 'const ignored = { strictCamelCase() {} };',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'objectLiteralMethod',
        },
      ],
    },
    {
      code: 'const ignored = { "strictCamelCase"() {} };',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'objectLiteralMethod',
        },
      ],
    },
    {
      code: 'const ignored = { strictCamelCase: () => {} };',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'objectLiteralMethod',
        },
      ],
    },
    {
      code: 'interface Ignored { strictCamelCase(): string }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeMethod',
        },
      ],
    },
    {
      code: 'interface Ignored { "strictCamelCase"(): string }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeMethod',
        },
      ],
    },
    {
      code: 'interface Ignored { strictCamelCase: () => string }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeMethod',
        },
      ],
    },
    {
      code: 'interface Ignored { "strictCamelCase": () => string }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeMethod',
        },
      ],
    },
    {
      code: 'type Ignored = { strictCamelCase(): string }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeMethod',
        },
      ],
    },
    {
      code: 'type Ignored = { "strictCamelCase"(): string }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeMethod',
        },
      ],
    },
    {
      code: 'type Ignored = { strictCamelCase: () => string }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeMethod',
        },
      ],
    },
    {
      code: 'type Ignored = { "strictCamelCase": () => string }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeMethod',
        },
      ],
    },
    {
      code: 'function ignored(strictCamelCase) {}',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameter',
        },
      ],
    },
    {
      code: '(function (strictCamelCase) {});',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameter',
        },
      ],
    },
    {
      code: 'declare function ignored(strictCamelCase);',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameter',
        },
      ],
    },
    {
      code: 'function ignored({strictCamelCase}) {}',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameter',
        },
      ],
    },
    {
      code: 'function ignored(...strictCamelCase) {}',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameter',
        },
      ],
    },
    {
      code: 'function ignored({strictCamelCase = 1}) {}',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameter',
        },
      ],
    },
    {
      code: 'function ignored({...strictCamelCase}) {}',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameter',
        },
      ],
    },
    {
      code: 'function ignored([strictCamelCase]) {}',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameter',
        },
      ],
    },
    {
      code: 'function ignored([strictCamelCase = 1]) {}',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameter',
        },
      ],
    },
    {
      code: 'function ignored([...strictCamelCase]) {}',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameter',
        },
      ],
    },
    {
      code: 'class Ignored { constructor(private strictCamelCase) {} }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameterProperty',
        },
      ],
    },
    {
      code: 'class Ignored { constructor(readonly strictCamelCase) {} }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameterProperty',
        },
      ],
    },
    {
      code: 'class Ignored { constructor(private readonly strictCamelCase) {} }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'parameterProperty',
        },
      ],
    },
    {
      code: 'class Ignored { constructor(private readonly strictCamelCase) {} }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          modifiers: ['readonly'],
          selector: 'parameterProperty',
        },
      ],
    },
    {
      code: 'class Ignored { private strictCamelCase }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classProperty',
        },
      ],
    },
    {
      code: 'class Ignored { private "strictCamelCase" = 1 }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classProperty',
        },
      ],
    },
    {
      code: 'class Ignored { private readonly strictCamelCase = 1 }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classProperty',
        },
      ],
    },
    {
      code: 'class Ignored { private static strictCamelCase }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classProperty',
        },
      ],
    },
    {
      code: 'class Ignored { private static readonly strictCamelCase = 1 }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classProperty',
        },
      ],
    },
    {
      code: 'class Ignored { abstract strictCamelCase }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classProperty',
        },
      ],
    },
    {
      code: 'class Ignored { declare strictCamelCase }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classProperty',
        },
      ],
    },
    {
      code: 'class Ignored { #strictCamelCase }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classProperty',
        },
      ],
    },
    {
      code: 'class Ignored { static #strictCamelCase }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'classProperty',
        },
      ],
    },
    {
      code: 'const ignored = { strictCamelCase };',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'objectLiteralProperty',
        },
      ],
    },
    {
      code: 'const ignored = { "strictCamelCase": 1 };',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'objectLiteralProperty',
        },
      ],
    },
    {
      code: 'interface Ignored { strictCamelCase }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeProperty',
        },
      ],
    },
    {
      code: 'interface Ignored { "strictCamelCase": string }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeProperty',
        },
      ],
    },
    {
      code: 'type Ignored = { strictCamelCase }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeProperty',
        },
      ],
    },
    {
      code: 'type Ignored = { "strictCamelCase": string }',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeProperty',
        },
      ],
    },
    {
      code: 'type strictCamelCase = {};',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeAlias',
        },
      ],
    },
    {
      code: 'type strictCamelCase = 1;',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeAlias',
        },
      ],
    },
    {
      code: 'class Ignored<strictCamelCase> {}',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeParameter',
        },
      ],
    },
    {
      code: 'function ignored<strictCamelCase>() {}',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeParameter',
        },
      ],
    },
    {
      code: 'type Ignored<strictCamelCase> = { ignored: strictCamelCase };',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeParameter',
        },
      ],
    },
    {
      code: 'interface Ignored<strictCamelCase> extends Ignored<string> {}',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'typeParameter',
        },
      ],
    },
    {
      code: 'const strictCamelCase = 1;',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'variable',
        },
      ],
    },
    {
      code: 'let strictCamelCase = 1;',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'variable',
        },
      ],
    },
    {
      code: 'var strictCamelCase = 1;',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'variable',
        },
      ],
    },
    {
      code: 'const {strictCamelCase} = {ignored: 1};',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'variable',
        },
      ],
    },
    {
      code: 'const {strictCamelCase = 2} = {ignored: 1};',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'variable',
        },
      ],
    },
    {
      code: 'const {...strictCamelCase} = {ignored: 1};',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'variable',
        },
      ],
    },
    {
      code: 'const [strictCamelCase] = [1];',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'variable',
        },
      ],
    },
    {
      code: 'const [strictCamelCase = 1] = [1];',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'variable',
        },
      ],
    },
    {
      code: 'const [...strictCamelCase] = [1];',
      options: [
        {
          filter: {
            match: false,
            regex: '.gnored',
          },
          format: ['strictCamelCase'],
          selector: 'variable',
        },
      ],
    },
    {
      code: 'const valid_name = 1;',
      options: [
        {
          format: ['snake_case'],
          selector: 'variable',
        },
      ],
    },
    {
      code: 'const validName = 1;',
      options: [
        {
          format: ['camelCase'],
          selector: 'variable',
        },
      ],
    },
    {
      code: 'const VALID_NAME = 1;',
      options: [
        {
          format: ['UPPER_CASE'],
          selector: 'variable',
        },
      ],
    },
    {
      code: 'const _validName = 1;',
      options: [
        {
          format: ['camelCase'],
          leadingUnderscore: 'require',
          selector: 'variable',
        },
      ],
    },
    {
      code: 'const validName_ = 1;',
      options: [
        {
          format: ['camelCase'],
          selector: 'variable',
          trailingUnderscore: 'require',
        },
      ],
    },
    {
      code: 'const PrefixvalidName = 1;',
      options: [
        {
          format: ['camelCase'],
          prefix: ['Prefix'],
          selector: 'variable',
        },
      ],
    },
    {
      code: 'const validNameSuffix = 1;',
      options: [
        {
          format: ['camelCase'],
          selector: 'variable',
          suffix: ['Suffix'],
        },
      ],
    },
  ],
});
