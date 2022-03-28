import { createTestCases } from './createTestCases';

createTestCases([
  {
    code: [
      'const % = 1;',
      'function % () {}',
      '(function (%) {});',
      'class Ignored { constructor(private %) {} }',
      'const ignored = { % };',
      'interface Ignored { %: string }',
      'type Ignored = { %: string }',
      'class Ignored { private % = 1 }',
      'class Ignored { #% = 1 }',
      'class Ignored { constructor(private %) {} }',
      'class Ignored { #%() {} }',
      'class Ignored { private %() {} }',
      'const ignored = { %() {} };',
      'class Ignored { private get %() {} }',
      'enum Ignored { % }',
      'abstract class % {}',
      'interface % { }',
      'type % = { };',
      'enum % {}',
      'interface Ignored<%> extends Ignored<string> {}',
    ],
    options: {
      selector: 'default',
      filter: '[iI]gnored',
    },
  },
]);
