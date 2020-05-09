/* eslint-disable eslint-comments/no-use */
// this rule tests the position of braces, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */

import rule from '../../src/rules/brace-style';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {},
  },
});

ruleTester.run('brace-style', rule, {
  valid: [
    {
      code: `
function f() {
  if (true)
    return { x: 1 };
  else {
    var y = 2;
    return y;
  }
}
      `,
    },
    {
      code: `
if (tag === 1) glyph.id = pbf.readVarint();
else if (tag === 2) glyph.bitmap = pbf.readBytes();
      `,
    },
    {
      code: `
function foo () {
  return;
}
      `,
    },
    {
      code: `
function a(b,
c,
d) { }
      `,
    },
    {
      code: `
!function foo () {
  return;
}
      `,
    },
    {
      code: `
!function a(b,
c,
d) { }
      `,
    },
    {
      code: `
if (foo) {
  bar();
}
      `,
    },
    {
      code: `
if (a) {
  b();
} else {
  c();
}
      `,
    },
    {
      code: `
while (foo) {
  bar();
}
      `,
    },
    {
      code: `
for (;;) {
  bar();
}
      `,
    },
    {
      code: `
with (foo) {
  bar();
}
      `,
    },
    {
      code: `
switch (foo) {
  case 'bar': break;
}
      `,
    },
    {
      code: `
try {
  bar();
} catch (e) {
  baz();
}
      `,
    },
    {
      code: `
do {
  bar();
} while (true)
      `,
    },
    {
      code: `
for (foo in bar) {
  baz();
}
      `,
    },
    {
      code: `
if (a &&
  b &&
  c) {
  }
      `,
    },
    {
      code: `
switch(0) {
}
      `,
    },
    {
      code: `
class Foo {
}
      `,
    },
    {
      code: `
(class {
})
      `,
    },
    {
      code: `
class
Foo {
}
      `,
    },
    {
      code: `
class Foo {
  bar() {
  }
}
      `,
    },
    {
      code: `
if (foo) {
}
else {
}
      `,
      options: ['stroustrup'],
    },
    {
      code: `
if (foo)
{
}
else
{
}
      `,
      options: ['allman'],
    },
    {
      code: `
try {
  bar();
}
catch (e) {
  baz();
}
      `,
      options: ['stroustrup'],
    },
    {
      code: `
try
{
  bar();
}
catch (e)
{
  baz();
}
      `,
      options: ['allman'],
    },
    {
      code: 'function foo () { return; }',
      options: ['1tbs', { allowSingleLine: true }],
    },
    {
      code: 'function foo () { a(); b(); return; }',
      options: ['1tbs', { allowSingleLine: true }],
    },
    {
      code: 'function a(b,c,d) { }',
      options: ['1tbs', { allowSingleLine: true }],
    },
    {
      code: '!function foo () { return; }',
      options: ['1tbs', { allowSingleLine: true }],
    },
    {
      code: '!function a(b,c,d) { }',
      options: ['1tbs', { allowSingleLine: true }],
    },
    {
      code: 'if (foo) {  bar(); }',
      options: ['1tbs', { allowSingleLine: true }],
    },
    {
      code: 'if (a) { b(); } else { c(); }',
      options: ['1tbs', { allowSingleLine: true }],
    },
    {
      code: 'while (foo) {  bar(); }',
      options: ['1tbs', { allowSingleLine: true }],
    },
    {
      code: 'for (;;) {  bar(); }',
      options: ['1tbs', { allowSingleLine: true }],
    },
    {
      code: 'with (foo) {  bar(); }',
      options: ['1tbs', { allowSingleLine: true }],
    },
    {
      code: "switch (foo) {  case 'bar': break; }",
      options: ['1tbs', { allowSingleLine: true }],
    },
    {
      code: 'try {  bar(); } catch (e) { baz();  }',
      options: ['1tbs', { allowSingleLine: true }],
    },
    {
      code: 'do {  bar(); } while (true)',
      options: ['1tbs', { allowSingleLine: true }],
    },
    {
      code: 'for (foo in bar) {  baz();  }',
      options: ['1tbs', { allowSingleLine: true }],
    },
    {
      code: 'if (a && b && c) {  }',
      options: ['1tbs', { allowSingleLine: true }],
    },
    {
      code: 'switch(0) {}',
      options: ['1tbs', { allowSingleLine: true }],
    },
    {
      code: `
if (foo) {}
else {}
      `,
      options: ['stroustrup', { allowSingleLine: true }],
    },
    {
      code: `
try {  bar(); }
catch (e) { baz(); }
      `,
      options: ['stroustrup', { allowSingleLine: true }],
    },
    {
      code: 'var foo = () => { return; }',
      options: ['stroustrup', { allowSingleLine: true }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
if (foo) {}
else {}
      `,
      options: ['allman', { allowSingleLine: true }],
    },
    {
      code: `
try {  bar(); }
catch (e) { baz();  }
      `,
      options: ['allman', { allowSingleLine: true }],
    },
    {
      code: 'var foo = () => { return; }',
      options: ['allman', { allowSingleLine: true }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
if (tag === 1) fontstack.name = pbf.readString();
else if (tag === 2) fontstack.range = pbf.readString();
else if (tag === 3) {
  var glyph = pbf.readMessage(readGlyph, {});
  fontstack.glyphs[glyph.id] = glyph;
}
      `,
      options: ['1tbs'],
    },
    {
      code: `
if (tag === 1) fontstack.name = pbf.readString();
else if (tag === 2) fontstack.range = pbf.readString();
else if (tag === 3) {
  var glyph = pbf.readMessage(readGlyph, {});
  fontstack.glyphs[glyph.id] = glyph;
}
      `,
      options: ['stroustrup'],
    },
    {
      code: `
switch(x)
{
  case 1:
    bar();
}
      `,
      options: ['allman'],
    },
    {
      code: 'switch(x) {}',
      options: ['allman', { allowSingleLine: true }],
    },
    {
      code: `
class Foo {
}
      `,
      options: ['stroustrup'],
    },
    {
      code: `
(class {
})
      `,
      options: ['stroustrup'],
    },
    {
      code: `
class Foo
{
}
      `,
      options: ['allman'],
    },
    {
      code: `
(class
{
})
      `,
      options: ['allman'],
    },
    {
      code: `
class
Foo
{
}
      `,
      options: ['allman'],
    },
    {
      code: 'class Foo {}',
      options: ['1tbs', { allowSingleLine: true }],
    },
    {
      code: 'class Foo {}',
      options: ['allman', { allowSingleLine: true }],
    },
    {
      code: '(class {})',
      options: ['1tbs', { allowSingleLine: true }],
    },
    {
      code: '(class {})',
      options: ['allman', { allowSingleLine: true }],
    },

    // https://github.com/eslint/eslint/issues/7908
    {
      code: '{}',
    },
    {
      code: `
if (foo) {
}
{
}
      `,
    },
    {
      code: `
switch (foo) {
  case bar:
    baz();
    {
      qux();
    }
}
      `,
    },
    {
      code: `
{
}
      `,
    },
    {
      code: `
{
  {
  }
}
      `,
    },

    // https://github.com/eslint/eslint/issues/7974
    {
      code: `
class Ball {
  throw() {}
  catch() {}
}
      `,
    },
    {
      code: `
({
  and() {},
  finally() {}
})
      `,
    },
    {
      code: `
(class {
  or() {}
  else() {}
})
      `,
    },
    {
      code: `
if (foo) bar = function() {}
else baz()
      `,
    },
    {
      code: `
interface Foo {
}
      `,
      options: ['1tbs'],
    },
    {
      code: `
interface Foo {
}
      `,
      options: ['stroustrup'],
    },
    {
      code: `
interface Foo
{
}
      `,
      options: ['allman'],
    },
    {
      code: `
module "Foo" {
}
      `,
      options: ['1tbs'],
    },
    {
      code: `
module "Foo" {
}
      `,
      options: ['stroustrup'],
    },
    {
      code: `
module "Foo"
{
}
      `,
      options: ['allman'],
    },
    {
      code: `
namespace Foo {
}
      `,
      options: ['1tbs'],
    },
    {
      code: `
namespace Foo {
}
      `,
      options: ['stroustrup'],
    },
    {
      code: `
namespace Foo
{
}
      `,
      options: ['allman'],
    },
    {
      code: `
enum Foo
{
  A,
  B
}
      `,
      options: ['allman'],
    },
    {
      code: `
enum Foo {
  A,
  B
}
      `,
      options: ['1tbs'],
    },
    {
      code: `
enum Foo {
  A,
  B
}
      `,
      options: ['stroustrup'],
    },
    {
      code: 'enum Foo { A, B }',
      options: ['1tbs', { allowSingleLine: true }],
    },
  ],

  invalid: [
    {
      code: `
if (f) {
  bar;
}
else
  baz;
      `,
      output: `
if (f) {
  bar;
} else
  baz;
      `,
      errors: [{ messageId: 'nextLineClose' }],
    },
    {
      code: 'var foo = () => { return; }',
      output: 'var foo = () => {\n return; \n}',
      parserOptions: { ecmaVersion: 6 },
      errors: [
        { messageId: 'blockSameLine' },
        { messageId: 'singleLineClose' },
      ],
    },
    {
      code: 'function foo() { return; }',
      output: 'function foo() {\n return; \n}',
      errors: [
        { messageId: 'blockSameLine' },
        { messageId: 'singleLineClose' },
      ],
    },
    {
      code: 'function foo() \n { \n return; }',
      output: 'function foo() { \n return; \n}',
      errors: [{ messageId: 'nextLineOpen' }, { messageId: 'singleLineClose' }],
    },
    {
      code: '!function foo() \n { \n return; }',
      output: '!function foo() { \n return; \n}',
      errors: [{ messageId: 'nextLineOpen' }, { messageId: 'singleLineClose' }],
    },
    {
      code: 'if (foo) \n { \n bar(); }',
      output: 'if (foo) { \n bar(); \n}',
      errors: [{ messageId: 'nextLineOpen' }, { messageId: 'singleLineClose' }],
    },
    {
      code: 'if (a) { \nb();\n } else \n { c(); }',
      output: 'if (a) { \nb();\n } else {\n c(); \n}',
      errors: [
        { messageId: 'nextLineOpen' },
        { messageId: 'blockSameLine' },
        { messageId: 'singleLineClose' },
      ],
    },
    {
      code: 'while (foo) \n { \n bar(); }',
      output: 'while (foo) { \n bar(); \n}',
      errors: [{ messageId: 'nextLineOpen' }, { messageId: 'singleLineClose' }],
    },
    {
      code: 'for (;;) \n { \n bar(); }',
      output: 'for (;;) { \n bar(); \n}',
      errors: [{ messageId: 'nextLineOpen' }, { messageId: 'singleLineClose' }],
    },
    {
      code: 'with (foo) \n { \n bar(); }',
      output: 'with (foo) { \n bar(); \n}',
      errors: [{ messageId: 'nextLineOpen' }, { messageId: 'singleLineClose' }],
    },
    {
      code: "switch (foo) \n { \n case 'bar': break; }",
      output: "switch (foo) { \n case 'bar': break; \n}",
      errors: [{ messageId: 'nextLineOpen' }, { messageId: 'singleLineClose' }],
    },
    {
      code: 'switch (foo) \n { }',
      output: 'switch (foo) { }',
      errors: [{ messageId: 'nextLineOpen' }],
    },
    {
      code: 'try \n { \n bar(); \n } catch (e) {}',
      output: 'try { \n bar(); \n } catch (e) {}',
      errors: [{ messageId: 'nextLineOpen' }],
    },
    {
      code: 'try { \n bar(); \n } catch (e) \n {}',
      output: 'try { \n bar(); \n } catch (e) {}',
      errors: [{ messageId: 'nextLineOpen' }],
    },
    {
      code: 'do \n { \n bar(); \n} while (true)',
      output: 'do { \n bar(); \n} while (true)',
      errors: [{ messageId: 'nextLineOpen' }],
    },
    {
      code: 'for (foo in bar) \n { \n baz(); \n }',
      output: 'for (foo in bar) { \n baz(); \n }',
      errors: [{ messageId: 'nextLineOpen' }],
    },
    {
      code: 'for (foo of bar) \n { \n baz(); \n }',
      output: 'for (foo of bar) { \n baz(); \n }',
      parserOptions: { ecmaVersion: 6 },
      errors: [{ messageId: 'nextLineOpen' }],
    },
    {
      code: 'try { \n bar(); \n }\ncatch (e) {\n}',
      output: 'try { \n bar(); \n } catch (e) {\n}',
      errors: [{ messageId: 'nextLineClose' }],
    },
    {
      code: 'try { \n bar(); \n } catch (e) {\n}\n finally {\n}',
      output: 'try { \n bar(); \n } catch (e) {\n} finally {\n}',
      errors: [{ messageId: 'nextLineClose' }],
    },
    {
      code: 'if (a) { \nb();\n } \n else { \nc();\n }',
      output: 'if (a) { \nb();\n } else { \nc();\n }',
      errors: [{ messageId: 'nextLineClose' }],
    },
    {
      code: 'try { \n bar(); \n }\ncatch (e) {\n} finally {\n}',
      output: 'try { \n bar(); \n }\ncatch (e) {\n}\n finally {\n}',
      options: ['stroustrup'],
      errors: [{ messageId: 'sameLineClose' }],
    },
    {
      code: 'try { \n bar(); \n } catch (e) {\n}\n finally {\n}',
      output: 'try { \n bar(); \n }\n catch (e) {\n}\n finally {\n}',
      options: ['stroustrup'],
      errors: [{ messageId: 'sameLineClose' }],
    },
    {
      code: 'if (a) { \nb();\n } else { \nc();\n }',
      output: 'if (a) { \nb();\n }\n else { \nc();\n }',
      options: ['stroustrup'],
      errors: [{ messageId: 'sameLineClose' }],
    },
    {
      code:
        'if (foo) {\nbaz();\n} else if (bar) {\nbaz();\n}\nelse {\nqux();\n}',
      output:
        'if (foo) {\nbaz();\n}\n else if (bar) {\nbaz();\n}\nelse {\nqux();\n}',
      options: ['stroustrup'],
      errors: [{ messageId: 'sameLineClose' }],
    },
    {
      code:
        'if (foo) {\npoop();\n} \nelse if (bar) {\nbaz();\n} else if (thing) {\nboom();\n}\nelse {\nqux();\n}',
      output:
        'if (foo) {\npoop();\n} \nelse if (bar) {\nbaz();\n}\n else if (thing) {\nboom();\n}\nelse {\nqux();\n}',
      options: ['stroustrup'],
      errors: [{ messageId: 'sameLineClose' }],
    },
    {
      code: 'try { \n bar(); \n }\n catch (e) {\n}\n finally {\n}',
      output: 'try \n{ \n bar(); \n }\n catch (e) \n{\n}\n finally \n{\n}',
      options: ['allman'],
      errors: [
        { messageId: 'sameLineOpen', line: 1 },
        { messageId: 'sameLineOpen', line: 4 },
        { messageId: 'sameLineOpen', line: 6 },
      ],
    },
    {
      code: 'switch(x) { case 1: \nbar(); }\n ',
      output: 'switch(x) \n{\n case 1: \nbar(); \n}\n ',
      options: ['allman'],
      errors: [
        { messageId: 'sameLineOpen', line: 1 },
        { messageId: 'blockSameLine', line: 1 },
        { messageId: 'singleLineClose', line: 2 },
      ],
    },
    {
      code: 'if (a) { \nb();\n } else { \nc();\n }',
      output: 'if (a) \n{ \nb();\n }\n else \n{ \nc();\n }',
      options: ['allman'],
      errors: [
        { messageId: 'sameLineOpen' },
        { messageId: 'sameLineClose' },
        { messageId: 'sameLineOpen' },
      ],
    },
    {
      code:
        'if (foo) {\nbaz();\n} else if (bar) {\nbaz();\n}\nelse {\nqux();\n}',
      output:
        'if (foo) \n{\nbaz();\n}\n else if (bar) \n{\nbaz();\n}\nelse \n{\nqux();\n}',
      options: ['allman'],
      errors: [
        { messageId: 'sameLineOpen' },
        { messageId: 'sameLineClose' },
        { messageId: 'sameLineOpen' },
        { messageId: 'sameLineOpen' },
      ],
    },
    {
      code:
        'if (foo)\n{ poop();\n} \nelse if (bar) {\nbaz();\n} else if (thing) {\nboom();\n}\nelse {\nqux();\n}',
      output:
        'if (foo)\n{\n poop();\n} \nelse if (bar) \n{\nbaz();\n}\n else if (thing) \n{\nboom();\n}\nelse \n{\nqux();\n}',
      options: ['allman'],
      errors: [
        { messageId: 'blockSameLine' },
        { messageId: 'sameLineOpen' },
        { messageId: 'sameLineClose' },
        { messageId: 'sameLineOpen' },
        { messageId: 'sameLineOpen' },
      ],
    },
    {
      code: 'if (foo)\n{\n  bar(); }',
      output: 'if (foo)\n{\n  bar(); \n}',
      options: ['allman'],
      errors: [{ messageId: 'singleLineClose' }],
    },
    {
      code: 'try\n{\n  somethingRisky();\n} catch (e)\n{\n  handleError()\n}',
      output:
        'try\n{\n  somethingRisky();\n}\n catch (e)\n{\n  handleError()\n}',
      options: ['allman'],
      errors: [{ messageId: 'sameLineClose' }],
    },
    // allowSingleLine: true
    {
      code: 'function foo() { return; \n}',
      output: 'function foo() {\n return; \n}',
      options: ['1tbs', { allowSingleLine: true }],
      errors: [{ messageId: 'blockSameLine' }],
    },
    {
      code: 'function foo() { a(); b(); return; \n}',
      output: 'function foo() {\n a(); b(); return; \n}',
      options: ['1tbs', { allowSingleLine: true }],
      errors: [{ messageId: 'blockSameLine' }],
    },
    {
      code: 'function foo() { \n return; }',
      output: 'function foo() { \n return; \n}',
      options: ['1tbs', { allowSingleLine: true }],
      errors: [{ messageId: 'singleLineClose' }],
    },
    {
      code: 'function foo() {\na();\nb();\nreturn; }',
      output: 'function foo() {\na();\nb();\nreturn; \n}',
      options: ['1tbs', { allowSingleLine: true }],
      errors: [{ messageId: 'singleLineClose' }],
    },
    {
      code: '!function foo() { \n return; }',
      output: '!function foo() { \n return; \n}',
      options: ['1tbs', { allowSingleLine: true }],
      errors: [{ messageId: 'singleLineClose' }],
    },
    {
      code: 'if (a) { b();\n } else { c(); }',
      output: 'if (a) {\n b();\n } else { c(); }',
      options: ['1tbs', { allowSingleLine: true }],
      errors: [{ messageId: 'blockSameLine' }],
    },
    {
      code: 'if (a) { b(); }\nelse { c(); }',
      output: 'if (a) { b(); } else { c(); }',
      options: ['1tbs', { allowSingleLine: true }],
      errors: [{ messageId: 'nextLineClose' }],
    },
    {
      code: 'while (foo) { \n bar(); }',
      output: 'while (foo) { \n bar(); \n}',
      options: ['1tbs', { allowSingleLine: true }],
      errors: [{ messageId: 'singleLineClose' }],
    },
    {
      code: 'for (;;) { bar(); \n }',
      output: 'for (;;) {\n bar(); \n }',
      options: ['1tbs', { allowSingleLine: true }],
      errors: [{ messageId: 'blockSameLine' }],
    },
    {
      code: 'with (foo) { bar(); \n }',
      output: 'with (foo) {\n bar(); \n }',
      options: ['1tbs', { allowSingleLine: true }],
      errors: [{ messageId: 'blockSameLine' }],
    },
    {
      code: 'switch (foo) \n { \n case `bar`: break; }',
      output: 'switch (foo) { \n case `bar`: break; \n}',
      options: ['1tbs', { allowSingleLine: true }],
      errors: [{ messageId: 'nextLineOpen' }, { messageId: 'singleLineClose' }],
    },
    {
      code: 'switch (foo) \n { }',
      output: 'switch (foo) { }',
      options: ['1tbs', { allowSingleLine: true }],
      errors: [{ messageId: 'nextLineOpen' }],
    },
    {
      code: 'try {  bar(); }\ncatch (e) { baz();  }',
      output: 'try {  bar(); } catch (e) { baz();  }',
      options: ['1tbs', { allowSingleLine: true }],
      errors: [{ messageId: 'nextLineClose' }],
    },
    {
      code: 'try \n { \n bar(); \n } catch (e) {}',
      output: 'try { \n bar(); \n } catch (e) {}',
      options: ['1tbs', { allowSingleLine: true }],
      errors: [{ messageId: 'nextLineOpen' }],
    },
    {
      code: 'try { \n bar(); \n } catch (e) \n {}',
      output: 'try { \n bar(); \n } catch (e) {}',
      options: ['1tbs', { allowSingleLine: true }],
      errors: [{ messageId: 'nextLineOpen' }],
    },
    {
      code: 'do \n { \n bar(); \n} while (true)',
      output: 'do { \n bar(); \n} while (true)',
      options: ['1tbs', { allowSingleLine: true }],
      errors: [{ messageId: 'nextLineOpen' }],
    },
    {
      code: 'for (foo in bar) \n { \n baz(); \n }',
      output: 'for (foo in bar) { \n baz(); \n }',
      options: ['1tbs', { allowSingleLine: true }],
      errors: [{ messageId: 'nextLineOpen' }],
    },
    {
      code: 'try { \n bar(); \n }\ncatch (e) {\n}',
      output: 'try { \n bar(); \n } catch (e) {\n}',
      options: ['1tbs', { allowSingleLine: true }],
      errors: [{ messageId: 'nextLineClose' }],
    },
    {
      code: 'try { \n bar(); \n } catch (e) {\n}\n finally {\n}',
      output: 'try { \n bar(); \n } catch (e) {\n} finally {\n}',
      options: ['1tbs', { allowSingleLine: true }],
      errors: [{ messageId: 'nextLineClose' }],
    },
    {
      code: 'if (a) { \nb();\n } \n else { \nc();\n }',
      output: 'if (a) { \nb();\n } else { \nc();\n }',
      options: ['1tbs', { allowSingleLine: true }],
      errors: [{ messageId: 'nextLineClose' }],
    },
    {
      code: 'try { \n bar(); \n }\ncatch (e) {\n} finally {\n}',
      output: 'try { \n bar(); \n }\ncatch (e) {\n}\n finally {\n}',
      options: ['stroustrup', { allowSingleLine: true }],
      errors: [{ messageId: 'sameLineClose' }],
    },
    {
      code: 'try { \n bar(); \n } catch (e) {\n}\n finally {\n}',
      output: 'try { \n bar(); \n }\n catch (e) {\n}\n finally {\n}',
      options: ['stroustrup', { allowSingleLine: true }],
      errors: [{ messageId: 'sameLineClose' }],
    },
    {
      code: 'if (a) { \nb();\n } else { \nc();\n }',
      output: 'if (a) { \nb();\n }\n else { \nc();\n }',
      options: ['stroustrup', { allowSingleLine: true }],
      errors: [{ messageId: 'sameLineClose' }],
    },
    {
      code:
        'if (foo)\n{ poop();\n} \nelse if (bar) {\nbaz();\n} else if (thing) {\nboom();\n}\nelse {\nqux();\n}',
      output:
        'if (foo)\n{\n poop();\n} \nelse if (bar) \n{\nbaz();\n}\n else if (thing) \n{\nboom();\n}\nelse \n{\nqux();\n}',
      options: ['allman', { allowSingleLine: true }],
      errors: [
        { messageId: 'blockSameLine' },
        { messageId: 'sameLineOpen' },
        { messageId: 'sameLineClose' },
        { messageId: 'sameLineOpen' },
        { messageId: 'sameLineOpen' },
      ],
    },
    // Comment interferes with fix
    {
      code: 'if (foo) // comment \n{\nbar();\n}',
      output: null,
      errors: [{ messageId: 'nextLineOpen' }],
    },
    // https://github.com/eslint/eslint/issues/7493
    {
      code: 'if (foo) {\n bar\n.baz }',
      output: 'if (foo) {\n bar\n.baz \n}',
      errors: [{ messageId: 'singleLineClose' }],
    },
    {
      code: 'if (foo)\n{\n bar\n.baz }',
      output: 'if (foo)\n{\n bar\n.baz \n}',
      options: ['allman'],
      errors: [{ messageId: 'singleLineClose' }],
    },
    {
      code: 'if (foo) { bar\n.baz }',
      output: 'if (foo) {\n bar\n.baz \n}',
      options: ['1tbs', { allowSingleLine: true }],
      errors: [
        { messageId: 'blockSameLine' },
        { messageId: 'singleLineClose' },
      ],
    },
    {
      code: 'if (foo) { bar\n.baz }',
      output: 'if (foo) \n{\n bar\n.baz \n}',
      options: ['allman', { allowSingleLine: true }],
      errors: [
        { messageId: 'sameLineOpen' },
        { messageId: 'blockSameLine' },
        { messageId: 'singleLineClose' },
      ],
    },
    {
      code: 'switch (x) {\n case 1: foo() }',
      output: 'switch (x) {\n case 1: foo() \n}',
      options: ['1tbs', { allowSingleLine: true }],
      errors: [{ messageId: 'singleLineClose' }],
    },
    {
      code: 'class Foo\n{\n}',
      output: 'class Foo {\n}',
      errors: [{ messageId: 'nextLineOpen' }],
    },
    {
      code: '(class\n{\n})',
      output: '(class {\n})',
      errors: [{ messageId: 'nextLineOpen' }],
    },
    {
      code: 'class Foo{\n}',
      output: 'class Foo\n{\n}',
      options: ['allman'],
      errors: [{ messageId: 'sameLineOpen' }],
    },
    {
      code: '(class {\n})',
      output: '(class \n{\n})',
      options: ['allman'],
      errors: [{ messageId: 'sameLineOpen' }],
    },
    {
      code: 'class Foo {\nbar() {\n}}',
      output: 'class Foo {\nbar() {\n}\n}',
      errors: [{ messageId: 'singleLineClose' }],
    },
    {
      code: '(class Foo {\nbar() {\n}})',
      output: '(class Foo {\nbar() {\n}\n})',
      errors: [{ messageId: 'singleLineClose' }],
    },
    {
      code: 'class\nFoo{}',
      output: 'class\nFoo\n{}',
      options: ['allman'],
      errors: [{ messageId: 'sameLineOpen' }],
    },
    // https://github.com/eslint/eslint/issues/7621
    {
      code: `
if (foo)
{
  bar
}
else {
  baz
}
      `,
      output: `
if (foo) {
  bar
} else {
  baz
}
      `,
      errors: [{ messageId: 'nextLineOpen' }, { messageId: 'nextLineClose' }],
    },
    {
      code: `
interface Foo
{
}
      `,
      output: `
interface Foo {
}
      `,
      errors: [{ messageId: 'nextLineOpen' }],
    },
    {
      code: `
interface Foo
{
}
      `,
      output: `
interface Foo {
}
      `,
      options: ['stroustrup'],
      errors: [{ messageId: 'nextLineOpen' }],
    },
    {
      code: 'interface Foo { \n }',
      output: 'interface Foo \n{ \n }',
      options: ['allman'],
      errors: [{ messageId: 'sameLineOpen' }],
    },
    {
      code: `
module "Foo"
{
}
      `,
      output: `
module "Foo" {
}
      `,
      errors: [{ messageId: 'nextLineOpen' }],
    },
    {
      code: `
module "Foo"
{
}
      `,
      output: `
module "Foo" {
}
      `,
      options: ['stroustrup'],
      errors: [{ messageId: 'nextLineOpen' }],
    },
    {
      code: 'module "Foo" { \n }',
      output: 'module "Foo" \n{ \n }',
      options: ['allman'],
      errors: [{ messageId: 'sameLineOpen' }],
    },
    {
      code: `
namespace Foo
{
}
      `,
      output: `
namespace Foo {
}
      `,
      errors: [{ messageId: 'nextLineOpen' }],
    },
    {
      code: `
namespace Foo
{
}
      `,
      output: `
namespace Foo {
}
      `,
      options: ['stroustrup'],
      errors: [{ messageId: 'nextLineOpen' }],
    },
    {
      code: 'namespace Foo { \n }',
      output: 'namespace Foo \n{ \n }',
      options: ['allman'],
      errors: [{ messageId: 'sameLineOpen' }],
    },
    {
      code: `
enum Foo
{
}
      `,
      output: `
enum Foo {
}
      `,
      errors: [{ messageId: 'nextLineOpen' }],
    },
    {
      code: `
enum Foo
{
}
      `,
      output: `
enum Foo {
}
      `,
      options: ['stroustrup'],
      errors: [{ messageId: 'nextLineOpen' }],
    },
    {
      code: 'enum Foo { A }',
      output: 'enum Foo \n{\n A \n}',
      options: ['allman'],
      errors: [
        { messageId: 'sameLineOpen' },
        { messageId: 'blockSameLine' },
        { messageId: 'singleLineClose' },
      ],
    },
  ],
});
