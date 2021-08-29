/* eslint-disable eslint-comments/no-use */
// this rule tests the position of braces, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */

import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import rule from '../../src/rules/object-curly-spacing';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('object-curly-spacing', rule, {
  valid: [
    // always - object literals
    { code: 'var obj = { foo: bar, baz: qux };', options: ['always'] },
    {
      code: 'var obj = { foo: { bar: quxx }, baz: qux };',
      options: ['always'],
    },
    { code: 'var obj = {\nfoo: bar,\nbaz: qux\n};', options: ['always'] },
    { code: 'var obj = { /**/foo:bar/**/ };', options: ['always'] },
    { code: 'var obj = { //\nfoo:bar };', options: ['always'] },

    // always - destructuring
    {
      code: 'var { x } = y',
      options: ['always'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var { x, y } = y',
      options: ['always'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var { x,y } = y',
      options: ['always'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var {\nx,y } = y',
      options: ['always'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var {\nx,y\n} = z',
      options: ['always'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var { /**/x/**/ } = y',
      options: ['always'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var { //\nx } = y',
      options: ['always'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var { x = 10, y } = y',
      options: ['always'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var { x: { z }, y } = y',
      options: ['always'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var {\ny,\n} = x',
      options: ['always'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var { y, } = x',
      options: ['always'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var { y: x } = x',
      options: ['always'],
      parserOptions: { ecmaVersion: 6 },
    },

    // always - import / export
    {
      code: "import door from 'room'",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import * as door from 'room'",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import { door } from 'room'",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import {\ndoor } from 'room'",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import { /**/door/**/ } from 'room'",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import { //\ndoor } from 'room'",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "export { door } from 'room'",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import { house, mouse } from 'caravan'",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import house, { mouse } from 'caravan'",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import door, { house, mouse } from 'caravan'",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: 'var door = 0;export { door }',
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import 'room'",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import { bar as x } from 'foo';",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import { x, } from 'foo';",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import {\nx,\n} from 'foo';",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "export { x, } from 'foo';",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "export {\nx,\n} from 'foo';",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "export { /**/x/**/ } from 'foo';",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "export { //\nx } from 'foo';",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: 'var x = 1;\nexport { /**/x/**/ };',
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: 'var x = 1;\nexport { //\nx };',
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },

    // always - empty object
    { code: 'var foo = {};', options: ['always'] },

    // always - objectsInObjects
    {
      code: "var obj = { 'foo': { 'bar': 1, 'baz': 2 }};",
      options: ['always', { objectsInObjects: false }],
    },
    {
      code: 'var a = { noop: function () {} };',
      options: ['always', { objectsInObjects: false }],
    },
    {
      code: 'var { y: { z }} = x',
      options: ['always', { objectsInObjects: false }],
      parserOptions: { ecmaVersion: 6 },
    },

    // always - arraysInObjects
    {
      code: "var obj = { 'foo': [ 1, 2 ]};",
      options: ['always', { arraysInObjects: false }],
    },
    {
      code: 'var a = { thingInList: list[0] };',
      options: ['always', { arraysInObjects: false }],
    },

    // always - arraysInObjects, objectsInObjects
    {
      code: "var obj = { 'qux': [ 1, 2 ], 'foo': { 'bar': 1, 'baz': 2 }};",
      options: ['always', { arraysInObjects: false, objectsInObjects: false }],
    },

    // always - arraysInObjects, objectsInObjects (reverse)
    {
      code: "var obj = { 'foo': { 'bar': 1, 'baz': 2 }, 'qux': [ 1, 2 ]};",
      options: ['always', { arraysInObjects: false, objectsInObjects: false }],
    },

    // never
    { code: 'var obj = {foo: bar,\nbaz: qux\n};', options: ['never'] },
    { code: 'var obj = {\nfoo: bar,\nbaz: qux};', options: ['never'] },

    // never - object literals
    { code: 'var obj = {foo: bar, baz: qux};', options: ['never'] },
    { code: 'var obj = {foo: {bar: quxx}, baz: qux};', options: ['never'] },
    { code: 'var obj = {foo: {\nbar: quxx}, baz: qux\n};', options: ['never'] },
    { code: 'var obj = {foo: {\nbar: quxx\n}, baz: qux};', options: ['never'] },
    { code: 'var obj = {\nfoo: bar,\nbaz: qux\n};', options: ['never'] },
    { code: 'var obj = {foo: bar, baz: qux /* */};', options: ['never'] },
    { code: 'var obj = {/* */ foo: bar, baz: qux};', options: ['never'] },
    { code: 'var obj = {//\n foo: bar};', options: ['never'] },
    {
      code: 'var obj = { // line comment exception\n foo: bar};',
      options: ['never'],
    },

    // never - destructuring
    {
      code: 'var {x} = y',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var {x, y} = y',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var {x,y} = y',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var {\nx,y\n} = y',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var {x = 10} = y',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var {x = 10, y} = y',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var {x: {z}, y} = y',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var {\nx: {z\n}, y} = y',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var {\ny,\n} = x',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var {y,} = x',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var {y:x} = x',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var {/* */ y} = x',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var {y /* */} = x',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var {//\n y} = x',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var { // line comment exception\n y} = x',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },

    // never - import / export
    {
      code: "import door from 'room'",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import * as door from 'room'",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import {door} from 'room'",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "export {door} from 'room'",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import {/* */ door} from 'room'",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "export {/* */ door} from 'room'",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import {door /* */} from 'room'",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "export {door /* */} from 'room'",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import {//\n door} from 'room'",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "export {//\n door} from 'room'",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: 'var door = foo;\nexport {//\n door}',
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import { // line comment exception\n door} from 'room'",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "export { // line comment exception\n door} from 'room'",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: 'var door = foo; export { // line comment exception\n door}',
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import {\ndoor} from 'room'",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "export {\ndoor\n} from 'room'",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import {house,mouse} from 'caravan'",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import {house, mouse} from 'caravan'",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: 'var door = 0;export {door}',
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import 'room'",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import x, {bar} from 'foo';",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import x, {bar, baz} from 'foo';",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import {bar as y} from 'foo';",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import {x,} from 'foo';",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import {\nx,\n} from 'foo';",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "export {x,} from 'foo';",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "export {\nx,\n} from 'foo';",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },

    // never - empty object
    { code: 'var foo = {};', options: ['never'] },

    // never - objectsInObjects
    {
      code: "var obj = {'foo': {'bar': 1, 'baz': 2} };",
      options: ['never', { objectsInObjects: true }],
    },

    /*
     * https://github.com/eslint/eslint/issues/3658
     * Empty cases.
     */
    { code: 'var {} = foo;', parserOptions: { ecmaVersion: 6 } },
    { code: 'var [] = foo;', parserOptions: { ecmaVersion: 6 } },
    { code: 'var {a: {}} = foo;', parserOptions: { ecmaVersion: 6 } },
    { code: 'var {a: []} = foo;', parserOptions: { ecmaVersion: 6 } },
    {
      code: "import {} from 'foo';",
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "export {} from 'foo';",
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: 'export {};',
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: 'var {} = foo;',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var [] = foo;',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var {a: {}} = foo;',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var {a: []} = foo;',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: "import {} from 'foo';",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "export {} from 'foo';",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: 'export {};',
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },

    // https://github.com/eslint/eslint/issues/6940
    {
      code: 'function foo ({a, b}: Props) {\n}',
      options: ['never'],
    },

    // default - object literal types
    {
      code: 'const x:{}',
    },
    {
      code: 'const x:{ }',
    },
    {
      code: 'const x:{f: number}',
    },
    {
      code: 'const x:{ // line-comment\nf: number\n}',
    },
    {
      code: 'const x:{// line-comment\nf: number\n}',
    },
    {
      code: 'const x:{/* inline-comment */f: number/* inline-comment */}',
    },
    {
      code: 'const x:{\nf: number\n}',
    },
    {
      code: 'const x:{f: {g: number}}',
    },
    {
      code: 'const x:{f: [number]}',
    },
    {
      code: 'const x:{[key: string]: value}',
    },
    {
      code: 'const x:{[key: string]: [number]}',
    },

    // default - mapped types
    {
      code: "const x:{[k in 'union']: number}",
    },
    {
      code: "const x:{ // line-comment\n[k in 'union']: number\n}",
    },
    {
      code: "const x:{// line-comment\n[k in 'union']: number\n}",
    },
    {
      code: "const x:{/* inline-comment */[k in 'union']: number/* inline-comment */}",
    },
    {
      code: "const x:{\n[k in 'union']: number\n}",
    },
    {
      code: "const x:{[k in 'union']: {[k in 'union']: number}}",
    },
    {
      code: "const x:{[k in 'union']: [number]}",
    },
    {
      code: "const x:{[k in 'union']: value}",
    },

    // never - mapped types
    {
      code: "const x:{[k in 'union']: {[k in 'union']: number} }",
      options: ['never', { objectsInObjects: true }],
    },
    {
      code: "const x:{[k in 'union']: {[k in 'union']: number}}",
      options: ['never', { objectsInObjects: false }],
    },
    {
      code: "const x:{[k in 'union']: () => {[k in 'union']: number} }",
      options: ['never', { objectsInObjects: true }],
    },
    {
      code: "const x:{[k in 'union']: () => {[k in 'union']: number}}",
      options: ['never', { objectsInObjects: false }],
    },
    {
      code: "const x:{[k in 'union']: [ number ]}",
      options: ['never', { arraysInObjects: false }],
    },
    {
      code: "const x:{ [k in 'union']: value}",
      options: ['never', { arraysInObjects: true }],
    },
    {
      code: "const x:{[k in 'union']: value}",
      options: ['never', { arraysInObjects: false }],
    },
    {
      code: "const x:{ [k in 'union']: [number] }",
      options: ['never', { arraysInObjects: true }],
    },
    {
      code: "const x:{[k in 'union']: [number]}",
      options: ['never', { arraysInObjects: false }],
    },

    // never - object literal types
    {
      code: 'const x:{f: {g: number} }',
      options: ['never', { objectsInObjects: true }],
    },
    {
      code: 'const x:{f: {g: number}}',
      options: ['never', { objectsInObjects: false }],
    },
    {
      code: 'const x:{f: () => {g: number} }',
      options: ['never', { objectsInObjects: true }],
    },
    {
      code: 'const x:{f: () => {g: number}}',
      options: ['never', { objectsInObjects: false }],
    },
    {
      code: 'const x:{f: [number] }',
      options: ['never', { arraysInObjects: true }],
    },
    {
      code: 'const x:{f: [ number ]}',
      options: ['never', { arraysInObjects: false }],
    },
    {
      code: 'const x:{ [key: string]: value}',
      options: ['never', { arraysInObjects: true }],
    },
    {
      code: 'const x:{[key: string]: value}',
      options: ['never', { arraysInObjects: false }],
    },
    {
      code: 'const x:{ [key: string]: [number] }',
      options: ['never', { arraysInObjects: true }],
    },
    {
      code: 'const x:{[key: string]: [number]}',
      options: ['never', { arraysInObjects: false }],
    },

    // always - mapped types
    {
      code: "const x:{ [k in 'union']: number }",
      options: ['always'],
    },
    {
      code: "const x:{ // line-comment\n[k in 'union']: number\n}",
      options: ['always'],
    },
    {
      code: "const x:{ /* inline-comment */ [k in 'union']: number /* inline-comment */ }",
      options: ['always'],
    },
    {
      code: "const x:{\n[k in 'union']: number\n}",
      options: ['always'],
    },
    {
      code: "const x:{ [k in 'union']: [number] }",
      options: ['always'],
    },

    // always - mapped types - objectsInObjects
    {
      code: "const x:{ [k in 'union']: { [k in 'union']: number } }",
      options: ['always', { objectsInObjects: true }],
    },
    {
      code: "const x:{ [k in 'union']: { [k in 'union']: number }}",
      options: ['always', { objectsInObjects: false }],
    },
    {
      code: "const x:{ [k in 'union']: () => { [k in 'union']: number } }",
      options: ['always', { objectsInObjects: true }],
    },
    {
      code: "const x:{ [k in 'union']: () => { [k in 'union']: number }}",
      options: ['always', { objectsInObjects: false }],
    },

    // always - mapped types - arraysInObjects
    {
      code: "type x = { [k in 'union']: number }",
      options: ['always'],
    },
    {
      code: "const x:{ [k in 'union']: [number] }",
      options: ['always', { arraysInObjects: true }],
    },
    {
      code: "const x:{ [k in 'union']: value }",
      options: ['always', { arraysInObjects: true }],
    },
    {
      code: "const x:{[k in 'union']: value }",
      options: ['always', { arraysInObjects: false }],
    },
    {
      code: "const x:{[k in 'union']: [number]}",
      options: ['always', { arraysInObjects: false }],
    },

    // always - object literal types
    {
      code: 'const x:{}',
      options: ['always'],
    },
    {
      code: 'const x:{ }',
      options: ['always'],
    },
    {
      code: 'const x:{ f: number }',
      options: ['always'],
    },
    {
      code: 'const x:{ // line-comment\nf: number\n}',
      options: ['always'],
    },
    {
      code: 'const x:{ /* inline-comment */ f: number /* inline-comment */ }',
      options: ['always'],
    },
    {
      code: 'const x:{\nf: number\n}',
      options: ['always'],
    },
    {
      code: 'const x:{ f: [number] }',
      options: ['always'],
    },

    // always - literal types - objectsInObjects
    {
      code: 'const x:{ f: { g: number } }',
      options: ['always', { objectsInObjects: true }],
    },
    {
      code: 'const x:{ f: { g: number }}',
      options: ['always', { objectsInObjects: false }],
    },
    {
      code: 'const x:{ f: () => { g: number } }',
      options: ['always', { objectsInObjects: true }],
    },
    {
      code: 'const x:{ f: () => { g: number }}',
      options: ['always', { objectsInObjects: false }],
    },

    // always - literal types - arraysInObjects
    {
      code: 'const x:{ f: [number] }',
      options: ['always', { arraysInObjects: true }],
    },
    {
      code: 'const x:{ f: [ number ]}',
      options: ['always', { arraysInObjects: false }],
    },
    {
      code: 'const x:{ [key: string]: value }',
      options: ['always', { arraysInObjects: true }],
    },
    {
      code: 'const x:{[key: string]: value }',
      options: ['always', { arraysInObjects: false }],
    },
    {
      code: 'const x:{ [key: string]: [number] }',
      options: ['always', { arraysInObjects: true }],
    },
    {
      code: 'const x:{[key: string]: [number]}',
      options: ['always', { arraysInObjects: false }],
    },
  ],

  invalid: [
    {
      code: "import {bar} from 'foo.js';",
      output: "import { bar } from 'foo.js';",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [
        {
          messageId: 'requireSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ImportDeclaration,
          line: 1,
          column: 8,
          endLine: 1,
          endColumn: 9,
        },
        {
          messageId: 'requireSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ImportDeclaration,
          line: 1,
          column: 12,
          endLine: 1,
          endColumn: 13,
        },
      ],
    },
    {
      code: "import { bar as y} from 'foo.js';",
      output: "import { bar as y } from 'foo.js';",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [
        {
          messageId: 'requireSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ImportDeclaration,
          line: 1,
          column: 18,
          endLine: 1,
          endColumn: 19,
        },
      ],
    },
    {
      code: "import {bar as y} from 'foo.js';",
      output: "import { bar as y } from 'foo.js';",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [
        {
          messageId: 'requireSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ImportDeclaration,
          line: 1,
          column: 8,
          endLine: 1,
          endColumn: 9,
        },
        {
          messageId: 'requireSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ImportDeclaration,
          line: 1,
          column: 17,
          endLine: 1,
          endColumn: 18,
        },
      ],
    },
    {
      code: "import { bar} from 'foo.js';",
      output: "import { bar } from 'foo.js';",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [
        {
          messageId: 'requireSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ImportDeclaration,
          line: 1,
          column: 13,
          endLine: 1,
          endColumn: 14,
        },
      ],
    },
    {
      code: "import x, { bar} from 'foo';",
      output: "import x, { bar } from 'foo';",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [
        {
          messageId: 'requireSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ImportDeclaration,
          line: 1,
          column: 16,
          endLine: 1,
          endColumn: 17,
        },
      ],
    },
    {
      code: "import x, { bar/* */} from 'foo';",
      output: "import x, { bar/* */ } from 'foo';",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [
        {
          messageId: 'requireSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ImportDeclaration,
          line: 1,
          column: 21,
          endLine: 1,
          endColumn: 22,
        },
      ],
    },
    {
      code: "import x, {/* */bar } from 'foo';",
      output: "import x, { /* */bar } from 'foo';",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [
        {
          messageId: 'requireSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ImportDeclaration,
          line: 1,
          column: 11,
          endLine: 1,
          endColumn: 12,
        },
      ],
    },
    {
      code: "import x, {//\n bar } from 'foo';",
      output: "import x, { //\n bar } from 'foo';",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [
        {
          messageId: 'requireSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ImportDeclaration,
          line: 1,
          column: 11,
          endLine: 1,
          endColumn: 12,
        },
      ],
    },
    {
      code: "import x, { bar, baz} from 'foo';",
      output: "import x, { bar, baz } from 'foo';",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [
        {
          messageId: 'requireSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ImportDeclaration,
          line: 1,
          column: 21,
          endLine: 1,
          endColumn: 22,
        },
      ],
    },
    {
      code: "import x, {bar} from 'foo';",
      output: "import x, { bar } from 'foo';",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [
        {
          messageId: 'requireSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ImportDeclaration,
          line: 1,
          column: 11,
          endLine: 1,
          endColumn: 12,
        },
        {
          messageId: 'requireSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ImportDeclaration,
          line: 1,
          column: 15,
          endLine: 1,
          endColumn: 16,
        },
      ],
    },
    {
      code: "import x, {bar, baz} from 'foo';",
      output: "import x, { bar, baz } from 'foo';",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [
        {
          messageId: 'requireSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ImportDeclaration,
          line: 1,
          column: 11,
          endLine: 1,
          endColumn: 12,
        },
        {
          messageId: 'requireSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ImportDeclaration,
          line: 1,
          column: 20,
          endLine: 1,
          endColumn: 21,
        },
      ],
    },
    {
      code: "import {bar,} from 'foo';",
      output: "import { bar, } from 'foo';",
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [
        {
          messageId: 'requireSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ImportDeclaration,
          line: 1,
          column: 8,
          endLine: 1,
          endColumn: 9,
        },
        {
          messageId: 'requireSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ImportDeclaration,
          line: 1,
          column: 13,
          endLine: 1,
          endColumn: 14,
        },
      ],
    },
    {
      code: "import { bar, } from 'foo';",
      output: "import {bar,} from 'foo';",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [
        {
          messageId: 'unexpectedSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ImportDeclaration,
          line: 1,
          column: 9,
          endLine: 1,
          endColumn: 10,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ImportDeclaration,
          line: 1,
          column: 14,
          endLine: 1,
          endColumn: 15,
        },
      ],
    },
    {
      code: "import { /* */ bar, /* */ } from 'foo';",
      output: "import {/* */ bar, /* */} from 'foo';",
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [
        {
          messageId: 'unexpectedSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ImportDeclaration,
          line: 1,
          column: 9,
          endLine: 1,
          endColumn: 10,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ImportDeclaration,
          line: 1,
          column: 26,
          endLine: 1,
          endColumn: 27,
        },
      ],
    },
    {
      code: 'var bar = 0;\nexport {bar};',
      output: 'var bar = 0;\nexport { bar };',
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [
        {
          messageId: 'requireSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ExportNamedDeclaration,
          line: 2,
          column: 8,
          endLine: 2,
          endColumn: 9,
        },
        {
          messageId: 'requireSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ExportNamedDeclaration,
          line: 2,
          column: 12,
        },
      ],
    },
    {
      code: 'var bar = 0;\nexport {/* */ bar /* */};',
      output: 'var bar = 0;\nexport { /* */ bar /* */ };',
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [
        {
          messageId: 'requireSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ExportNamedDeclaration,
          line: 2,
          column: 8,
          endLine: 2,
          endColumn: 9,
        },
        {
          messageId: 'requireSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ExportNamedDeclaration,
          line: 2,
          column: 24,
          endLine: 2,
          endColumn: 25,
        },
      ],
    },
    {
      code: 'var bar = 0;\nexport {//\n bar };',
      output: 'var bar = 0;\nexport { //\n bar };',
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [
        {
          messageId: 'requireSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ExportNamedDeclaration,
          line: 2,
          column: 8,
          endLine: 2,
          endColumn: 9,
        },
      ],
    },
    {
      code: 'var bar = 0;\nexport { /* */ bar /* */ };',
      output: 'var bar = 0;\nexport {/* */ bar /* */};',
      options: ['never'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [
        {
          messageId: 'unexpectedSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ExportNamedDeclaration,
          line: 2,
          column: 9,
          endLine: 2,
          endColumn: 10,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ExportNamedDeclaration,
          line: 2,
          column: 25,
          endLine: 2,
          endColumn: 26,
        },
      ],
    },

    // always - arraysInObjects
    {
      code: "var obj = { 'foo': [ 1, 2 ] };",
      output: "var obj = { 'foo': [ 1, 2 ]};",
      options: ['always', { arraysInObjects: false }],
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 28,
          endLine: 1,
          endColumn: 29,
        },
      ],
    },
    {
      code: "var obj = { 'foo': [ 1, 2 ] , 'bar': [ 'baz', 'qux' ] };",
      output: "var obj = { 'foo': [ 1, 2 ] , 'bar': [ 'baz', 'qux' ]};",
      options: ['always', { arraysInObjects: false }],
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 54,
          endLine: 1,
          endColumn: 55,
        },
      ],
    },

    // always-objectsInObjects
    {
      code: "var obj = { 'foo': { 'bar': 1, 'baz': 2 } };",
      output: "var obj = { 'foo': { 'bar': 1, 'baz': 2 }};",
      options: ['always', { objectsInObjects: false }],
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 42,
          endLine: 1,
          endColumn: 43,
        },
      ],
    },
    {
      code: "var obj = { 'foo': [ 1, 2 ] , 'bar': { 'baz': 1, 'qux': 2 } };",
      output: "var obj = { 'foo': [ 1, 2 ] , 'bar': { 'baz': 1, 'qux': 2 }};",
      options: ['always', { objectsInObjects: false }],
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 60,
          endLine: 1,
          endColumn: 61,
        },
      ],
    },

    // always-destructuring trailing comma
    {
      code: 'var { a,} = x;',
      output: 'var { a, } = x;',
      options: ['always'],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'requireSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectPattern,
          line: 1,
          column: 9,
          endLine: 1,
          endColumn: 10,
        },
      ],
    },
    {
      code: 'var {a, } = x;',
      output: 'var {a,} = x;',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectPattern,
          line: 1,
          column: 8,
          endLine: 1,
          endColumn: 9,
        },
      ],
    },
    {
      code: 'var {a:b } = x;',
      output: 'var {a:b} = x;',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectPattern,
          line: 1,
          column: 9,
          endLine: 1,
          endColumn: 10,
        },
      ],
    },
    {
      code: 'var { a:b } = x;',
      output: 'var {a:b} = x;',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'unexpectedSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ObjectPattern,
          line: 1,
          column: 6,
          endLine: 1,
          endColumn: 7,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectPattern,
          line: 1,
          column: 10,
          endLine: 1,
          endColumn: 11,
        },
      ],
    },
    {
      code: 'var {  a:b  } = x;',
      output: 'var {a:b} = x;',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'unexpectedSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ObjectPattern,
          line: 1,
          column: 6,
          endLine: 1,
          endColumn: 8,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectPattern,
          line: 1,
          column: 11,
          endLine: 1,
          endColumn: 13,
        },
      ],
    },
    {
      code: 'var {   a:b    } = x;',
      output: 'var {a:b} = x;',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'unexpectedSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ObjectPattern,
          line: 1,
          column: 6,
          endLine: 1,
          endColumn: 9,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectPattern,
          line: 1,
          column: 12,
          endLine: 1,
          endColumn: 16,
        },
      ],
    },

    // never-objectsInObjects
    {
      code: "var obj = {'foo': {'bar': 1, 'baz': 2}};",
      output: "var obj = {'foo': {'bar': 1, 'baz': 2} };",
      options: ['never', { objectsInObjects: true }],
      errors: [
        {
          messageId: 'requireSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 39,
          endLine: 1,
          endColumn: 40,
        },
      ],
    },
    {
      code: "var obj = {'foo': [1, 2] , 'bar': {'baz': 1, 'qux': 2}};",
      output: "var obj = {'foo': [1, 2] , 'bar': {'baz': 1, 'qux': 2} };",
      options: ['never', { objectsInObjects: true }],
      errors: [
        {
          messageId: 'requireSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 55,
          endLine: 1,
          endColumn: 56,
        },
      ],
    },

    // always & never
    {
      code: 'var obj = {foo: bar, baz: qux};',
      output: 'var obj = { foo: bar, baz: qux };',
      options: ['always'],
      errors: [
        {
          messageId: 'requireSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 11,
          endLine: 1,
          endColumn: 12,
        },
        {
          messageId: 'requireSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 30,
          endLine: 1,
          endColumn: 31,
        },
      ],
    },
    {
      code: 'var obj = {foo: bar, baz: qux };',
      output: 'var obj = { foo: bar, baz: qux };',
      options: ['always'],
      errors: [
        {
          messageId: 'requireSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 11,
          endLine: 1,
          endColumn: 12,
        },
      ],
    },
    {
      code: 'var obj = {/* */foo: bar, baz: qux };',
      output: 'var obj = { /* */foo: bar, baz: qux };',
      options: ['always'],
      errors: [
        {
          messageId: 'requireSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 11,
          endLine: 1,
          endColumn: 12,
        },
      ],
    },
    {
      code: 'var obj = {//\n foo: bar };',
      output: 'var obj = { //\n foo: bar };',
      options: ['always'],
      errors: [
        {
          messageId: 'requireSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 11,
          endLine: 1,
          endColumn: 12,
        },
      ],
    },
    {
      code: 'var obj = { foo: bar, baz: qux};',
      output: 'var obj = { foo: bar, baz: qux };',
      options: ['always'],
      errors: [
        {
          messageId: 'requireSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 31,
          endLine: 1,
          endColumn: 32,
        },
      ],
    },
    {
      code: 'var obj = { foo: bar, baz: qux/* */};',
      output: 'var obj = { foo: bar, baz: qux/* */ };',
      options: ['always'],
      errors: [
        {
          messageId: 'requireSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 36,
          endLine: 1,
          endColumn: 37,
        },
      ],
    },
    {
      code: 'var obj = { foo: bar, baz: qux };',
      output: 'var obj = {foo: bar, baz: qux};',
      options: ['never'],
      errors: [
        {
          messageId: 'unexpectedSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 12,
          endLine: 1,
          endColumn: 13,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 31,
          endLine: 1,
          endColumn: 32,
        },
      ],
    },
    {
      code: 'var obj = {  foo: bar, baz: qux };',
      output: 'var obj = {foo: bar, baz: qux};',
      options: ['never'],
      errors: [
        {
          messageId: 'unexpectedSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 12,
          endLine: 1,
          endColumn: 14,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 32,
          endLine: 1,
          endColumn: 33,
        },
      ],
    },
    {
      code: 'var obj = {foo: bar, baz: qux };',
      output: 'var obj = {foo: bar, baz: qux};',
      options: ['never'],
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 30,
          endLine: 1,
          endColumn: 31,
        },
      ],
    },
    {
      code: 'var obj = {foo: bar, baz: qux  };',
      output: 'var obj = {foo: bar, baz: qux};',
      options: ['never'],
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 30,
          endLine: 1,
          endColumn: 32,
        },
      ],
    },
    {
      code: 'var obj = {foo: bar, baz: qux /* */ };',
      output: 'var obj = {foo: bar, baz: qux /* */};',
      options: ['never'],
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 36,
          endLine: 1,
          endColumn: 37,
        },
      ],
    },
    {
      code: 'var obj = { foo: bar, baz: qux};',
      output: 'var obj = {foo: bar, baz: qux};',
      options: ['never'],
      errors: [
        {
          messageId: 'unexpectedSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 12,
          endLine: 1,
          endColumn: 13,
        },
      ],
    },
    {
      code: 'var obj = {  foo: bar, baz: qux};',
      output: 'var obj = {foo: bar, baz: qux};',
      options: ['never'],
      errors: [
        {
          messageId: 'unexpectedSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 12,
          endLine: 1,
          endColumn: 14,
        },
      ],
    },
    {
      code: 'var obj = { /* */ foo: bar, baz: qux};',
      output: 'var obj = {/* */ foo: bar, baz: qux};',
      options: ['never'],
      errors: [
        {
          messageId: 'unexpectedSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 12,
          endLine: 1,
          endColumn: 13,
        },
      ],
    },
    {
      code: 'var obj = { // line comment exception\n foo: bar };',
      output: 'var obj = { // line comment exception\n foo: bar};',
      options: ['never'],
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 2,
          column: 10,
          endLine: 2,
          endColumn: 11,
        },
      ],
    },
    {
      code: 'var obj = { foo: { bar: quxx}, baz: qux};',
      output: 'var obj = {foo: {bar: quxx}, baz: qux};',
      options: ['never'],
      errors: [
        {
          messageId: 'unexpectedSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 12,
          endLine: 1,
          endColumn: 13,
        },
        {
          messageId: 'unexpectedSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 19,
          endLine: 1,
          endColumn: 20,
        },
      ],
    },
    {
      code: 'var obj = {foo: {bar: quxx }, baz: qux };',
      output: 'var obj = {foo: {bar: quxx}, baz: qux};',
      options: ['never'],
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 27,
          endLine: 1,
          endColumn: 28,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 39,
          endLine: 1,
          endColumn: 40,
        },
      ],
    },
    {
      code: 'export const thing = {value: 1 };',
      output: 'export const thing = { value: 1 };',
      options: ['always'],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [
        {
          messageId: 'requireSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 22,
          endLine: 1,
          endColumn: 23,
        },
      ],
    },

    // destructuring
    {
      code: 'var {x, y} = y',
      output: 'var { x, y } = y',
      options: ['always'],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'requireSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ObjectPattern,
          line: 1,
          column: 5,
          endLine: 1,
          endColumn: 6,
        },
        {
          messageId: 'requireSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectPattern,
          line: 1,
          column: 10,
          endLine: 1,
          endColumn: 11,
        },
      ],
    },
    {
      code: 'var { x, y} = y',
      output: 'var { x, y } = y',
      options: ['always'],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'requireSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectPattern,
          line: 1,
          column: 11,
          endLine: 1,
          endColumn: 12,
        },
      ],
    },
    {
      code: 'var { x, y/* */} = y',
      output: 'var { x, y/* */ } = y',
      options: ['always'],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'requireSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectPattern,
          line: 1,
          column: 16,
          endLine: 1,
          endColumn: 17,
        },
      ],
    },
    {
      code: 'var {/* */x, y } = y',
      output: 'var { /* */x, y } = y',
      options: ['always'],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'requireSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ObjectPattern,
          line: 1,
          column: 5,
          endLine: 1,
          endColumn: 6,
        },
      ],
    },
    {
      code: 'var {//\n x } = y',
      output: 'var { //\n x } = y',
      options: ['always'],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'requireSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ObjectPattern,
          line: 1,
          column: 5,
          endLine: 1,
          endColumn: 6,
        },
      ],
    },
    {
      code: 'var { x, y } = y',
      output: 'var {x, y} = y',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'unexpectedSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ObjectPattern,
          line: 1,
          column: 6,
          endLine: 1,
          endColumn: 7,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectPattern,
          line: 1,
          column: 11,
          endLine: 1,
          endColumn: 12,
        },
      ],
    },
    {
      code: 'var {x, y } = y',
      output: 'var {x, y} = y',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectPattern,
          line: 1,
          column: 10,
          endLine: 1,
          endColumn: 11,
        },
      ],
    },
    {
      code: 'var {x, y/* */ } = y',
      output: 'var {x, y/* */} = y',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectPattern,
          line: 1,
          column: 15,
          endLine: 1,
          endColumn: 16,
        },
      ],
    },
    {
      code: 'var { /* */x, y} = y',
      output: 'var {/* */x, y} = y',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'unexpectedSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ObjectPattern,
          line: 1,
          column: 6,
          endLine: 1,
          endColumn: 7,
        },
      ],
    },
    {
      code: 'var { x=10} = y',
      output: 'var { x=10 } = y',
      options: ['always'],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'requireSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectPattern,
          line: 1,
          column: 11,
          endLine: 1,
          endColumn: 12,
        },
      ],
    },
    {
      code: 'var {x=10 } = y',
      output: 'var { x=10 } = y',
      options: ['always'],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'requireSpaceAfter',
          data: { token: '{' },
          type: AST_NODE_TYPES.ObjectPattern,
          line: 1,
          column: 5,
          endLine: 1,
          endColumn: 6,
        },
      ],
    },

    // never - arraysInObjects
    {
      code: "var obj = {'foo': [1, 2]};",
      output: "var obj = {'foo': [1, 2] };",
      options: ['never', { arraysInObjects: true }],
      errors: [
        {
          messageId: 'requireSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 25,
          endLine: 1,
          endColumn: 26,
        },
      ],
    },
    {
      code: "var obj = {'foo': [1, 2] , 'bar': ['baz', 'qux']};",
      output: "var obj = {'foo': [1, 2] , 'bar': ['baz', 'qux'] };",
      options: ['never', { arraysInObjects: true }],
      errors: [
        {
          messageId: 'requireSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectExpression,
          line: 1,
          column: 49,
          endLine: 1,
          endColumn: 50,
        },
      ],
    },

    // https://github.com/eslint/eslint/issues/6940
    {
      code: 'function foo ({a, b }: Props) {\n}',
      output: 'function foo ({a, b}: Props) {\n}',
      options: ['never'],
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { token: '}' },
          type: AST_NODE_TYPES.ObjectPattern,
          line: 1,
          column: 20,
          endLine: 1,
          endColumn: 21,
        },
      ],
    },

    // object literal types
    // never - literal types
    {
      code: 'type x = { f: number }',
      output: 'type x = {f: number}',
      errors: [
        { messageId: 'unexpectedSpaceAfter' },
        { messageId: 'unexpectedSpaceBefore' },
      ],
    },
    {
      code: 'type x = { f: number}',
      output: 'type x = {f: number}',
      errors: [{ messageId: 'unexpectedSpaceAfter' }],
    },
    {
      code: 'type x = {f: number }',
      output: 'type x = {f: number}',
      errors: [{ messageId: 'unexpectedSpaceBefore' }],
    },
    // always - literal types
    {
      code: 'type x = {f: number}',
      output: 'type x = { f: number }',
      options: ['always'],
      errors: [
        { messageId: 'requireSpaceAfter' },
        { messageId: 'requireSpaceBefore' },
      ],
    },
    {
      code: 'type x = {f: number }',
      output: 'type x = { f: number }',
      options: ['always'],
      errors: [{ messageId: 'requireSpaceAfter' }],
    },
    {
      code: 'type x = { f: number}',
      output: 'type x = { f: number }',
      options: ['always'],
      errors: [{ messageId: 'requireSpaceBefore' }],
    },

    // never - mapped types
    {
      code: "type x = { [k in 'union']: number }",
      output: "type x = {[k in 'union']: number}",
      errors: [
        { messageId: 'unexpectedSpaceAfter' },
        { messageId: 'unexpectedSpaceBefore' },
      ],
    },
    {
      code: "type x = { [k in 'union']: number}",
      output: "type x = {[k in 'union']: number}",
      errors: [{ messageId: 'unexpectedSpaceAfter' }],
    },
    {
      code: "type x = {[k in 'union']: number }",
      output: "type x = {[k in 'union']: number}",
      errors: [{ messageId: 'unexpectedSpaceBefore' }],
    },
    // always - mapped types
    {
      code: "type x = {[k in 'union']: number}",
      output: "type x = { [k in 'union']: number }",
      options: ['always'],
      errors: [
        { messageId: 'requireSpaceAfter' },
        { messageId: 'requireSpaceBefore' },
      ],
    },
    {
      code: "type x = {[k in 'union']: number }",
      output: "type x = { [k in 'union']: number }",
      options: ['always'],
      errors: [{ messageId: 'requireSpaceAfter' }],
    },
    {
      code: "type x = { [k in 'union']: number}",
      output: "type x = { [k in 'union']: number }",
      options: ['always'],
      errors: [{ messageId: 'requireSpaceBefore' }],
    },
    // Mapped and literal types mix
    {
      code: "type x = { [k in 'union']: { [k: string]: number } }",
      output: "type x = {[k in 'union']: {[k: string]: number}}",
      errors: [
        { messageId: 'unexpectedSpaceAfter' },
        { messageId: 'unexpectedSpaceAfter' },
        { messageId: 'unexpectedSpaceBefore' },
        { messageId: 'unexpectedSpaceBefore' },
      ],
    },
  ],
});
