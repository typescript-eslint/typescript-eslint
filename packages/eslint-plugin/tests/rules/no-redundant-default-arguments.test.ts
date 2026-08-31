import { noFormat } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-redundant-default-arguments';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes({
  ecmaFeatures: {
    jsx: true,
  },
});

ruleTester.run('no-redundant-default-arguments', rule, {
  valid: [
    `
function loadPage(page = 20) {}
loadPage();
    `,
    `
function loadPage(page = 20) {}
loadPage(1);
    `,
    `
function loadPage(page = 20) {}
loadPage(page);
    `,
    `
declare const DEFAULT_PAGE: number;
function loadPage(page = DEFAULT_PAGE) {}
loadPage(20);
    `,
    `
function loadPage(page = 20, limit = 10) {}
loadPage(20, 5);
    `,
    `
declare const ids: string[];
function loadPage(id: string, page = 20) {}
loadPage(...ids, 20);
    `,
    `
declare const extra: number[];
function loadPage(page = 20, ...rest: number[]) {}
loadPage(20, ...extra);
    `,
    `
declare const ids: string[];
function loadOptions(id: string, { page = 20 }: { page?: number }) {}
loadOptions(...ids, { page: 20 });
    `,
    `
function loadPage(page: number) {}
loadPage(20);
    `,
    `
const api = {
  loadPage(page = 20) {},
};
api.loadPage(20);
    `,
    `
let loadPage = (page = 20) => {};
loadPage(20);
    `,
    `
function loadPage(page = 20) {}
loadPage = (page = 1) => {};
loadPage(20);
    `,
    `
function loadPage(page?: number): void;
function loadPage(page = 20): void {}
loadPage(20);
    `,
    `
function loadPage(page = 20) {}
function nested() {
  function loadPage(page = 1) {}
  loadPage(20);
}
    `,
    `
function loadOptions({ page = 20 }: { page?: number }) {}
loadOptions({ page: 1 });
    `,
    `
declare const page: number;
function loadOptions({ page = 20 }: { page?: number }) {}
loadOptions({ page });
    `,
    `
declare const other: { extra?: number };
function loadOptions({ page = 20 }: { page?: number }) {}
loadOptions({ page: 20, ...other });
    `,
    `
declare const other: { extra?: number };
function loadOptions({ page = 20 }: { page?: number }) {}
loadOptions({ ...other, page: 20 });
    `,
    `
function loadOptions({ page = 20 }: { page?: number }) {}
loadOptions({ ['page']: 20 });
    `,
    {
      code: '<Unknown title="Inbox" />;',
      filename: 'react.tsx',
    },
    {
      code: `
function Header({ title = 'Inbox' }: { title?: string }) {
  return null;
}
<Header title="Sent" />;
      `,
      filename: 'react.tsx',
    },
    {
      code: `
declare const label: string;
function Header({ title = 'Inbox' }: { title?: string }) {
  return null;
}
<Header title={label} />;
      `,
      filename: 'react.tsx',
    },
    {
      code: `
declare const other: { subtitle?: string };
function Header({ title = 'Inbox' }: { title?: string }) {
  return null;
}
<Header title="Inbox" {...other} />;
      `,
      filename: 'react.tsx',
    },
    {
      code: `
declare const other: { subtitle?: string };
function Header({ title = 'Inbox' }: { title?: string }) {
  return null;
}
<Header {...other} title="Inbox" />;
      `,
      filename: 'react.tsx',
    },
    {
      code: '<div title="Inbox" />;',
      filename: 'react.tsx',
    },
    `
function loadPage(page = -0) {}
loadPage(0);
    `,
    `
import { importedWithDefault } from './redundant-default-arguments';
importedWithDefault(1);
    `,
    {
      code: `
import { ImportedComponent } from './redundant-default-arguments';
<ImportedComponent value={1} />;
      `,
      filename: 'react.tsx',
    },
    `
function loadOptions({ page = 5 }: { page?: number }) {}
loadOptions({ page: 1, page: 5 });
    `,
    `
declare const loadPage: (page?: number) => void;
loadPage(20);
    `,
    `
const loadPage = (page: number) => {};
loadPage(20);
    `,
    `
function run(loadPage = (page = 20) => {}) {
  loadPage(20);
}
    `,
    `
function loadPage([page = 20] = []) {}
loadPage([20]);
    `,
    `
function loadOptions({ page }: { page: number }) {}
loadOptions({ page: 5 });
    `,
    `
function loadOptions({} = {}) {}
loadOptions({});
    `,
    `
function loadOptions({ ['page']: page = 5 }: { page?: number }) {}
loadOptions({ page: 5 });
    `,
    `
function loadPage(page = 1n) {}
loadPage(1n);
    `,
    `
function loadPage(page = \`x\${1}\`) {}
loadPage('x1');
    `,
    `
function loadPage(page = +1) {}
loadPage(1);
    `,
    `
import { importedOverload } from './redundant-default-arguments';
importedOverload(0);
    `,
    `
import { importedLet } from './redundant-default-arguments';
importedLet(0);
    `,
    `
import { importedAny } from './redundant-default-arguments';
importedAny(0);
    `,
    `
import { importedDecl } from './redundant-default-arguments';
importedDecl(20);
    `,
    `
import { importedKeys } from './redundant-default-arguments';
importedKeys({ skip: 5 });
    `,
  ],
  invalid: [
    {
      code: `
function loadPage(page = 20) {}
loadPage(20);
      `,
      errors: [
        {
          column: 10,
          data: { kind: 'argument', name: 'page', value: '20' },
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function loadPage(page = 20) {}
loadPage();
      `,
    },
    {
      code: `
loadPage(0);
function loadPage(page = 0) {}
      `,
      errors: [
        {
          column: 10,
          data: { kind: 'argument', name: 'page', value: '0' },
          endColumn: 11,
          endLine: 2,
          line: 2,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
loadPage();
function loadPage(page = 0) {}
      `,
    },
    {
      code: `
const loadMode = (mode = 'all') => {};
loadMode('all');
      `,
      errors: [
        {
          column: 10,
          data: { kind: 'argument', name: 'mode', value: '"all"' },
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
const loadMode = (mode = 'all') => {};
loadMode();
      `,
    },
    {
      code: `
const loadFlag = function (enabled = false) {};
loadFlag(false);
      `,
      errors: [
        {
          column: 10,
          data: { kind: 'argument', name: 'enabled', value: 'false' },
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
const loadFlag = function (enabled = false) {};
loadFlag();
      `,
    },
    {
      code: `
function configure(enabled = false, mode = 'all') {}
configure(false, 'all');
      `,
      errors: [
        {
          column: 11,
          data: { kind: 'argument', name: 'enabled', value: 'false' },
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
        {
          column: 18,
          data: { kind: 'argument', name: 'mode', value: '"all"' },
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function configure(enabled = false, mode = 'all') {}
configure();
      `,
    },
    {
      code: `
function configure(first = false, second = true) {}
configure(false, /* keep */ true);
      `,
      errors: [
        {
          column: 11,
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
        {
          column: 29,
          endColumn: 33,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: null,
    },
    {
      code: `
function offsetBy(value = -1) {}
offsetBy(-1);
      `,
      errors: [
        {
          column: 10,
          data: { kind: 'argument', name: 'value', value: '-1' },
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function offsetBy(value = -1) {}
offsetBy();
      `,
    },
    {
      code: `
function loadMode(mode = \`all\`) {}
loadMode('all');
      `,
      errors: [
        {
          column: 10,
          data: { kind: 'argument', name: 'mode', value: '"all"' },
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function loadMode(mode = \`all\`) {}
loadMode();
      `,
    },
    {
      code: `
function loadOptions({ page = 5 }: { page?: number }) {}
loadOptions({ page: 5 });
      `,
      errors: [
        {
          column: 15,
          data: { kind: 'property', name: 'page', value: '5' },
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function loadOptions({ page = 5 }: { page?: number }) {}
loadOptions({});
      `,
    },
    {
      code: `
function loadOptions({ page: localPage = 5 }: { page?: number }) {}
loadOptions({ page: 5 });
      `,
      errors: [
        {
          column: 15,
          data: { kind: 'property', name: 'page', value: '5' },
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function loadOptions({ page: localPage = 5 }: { page?: number }) {}
loadOptions({});
      `,
    },
    {
      code: `
declare const values: unknown[];
function loadOptions({ page = 5 }: { page?: number }, ...rest: unknown[]) {}
loadOptions({ page: 5 }, ...values);
      `,
      errors: [
        {
          column: 15,
          endColumn: 22,
          endLine: 4,
          line: 4,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
declare const values: unknown[];
function loadOptions({ page = 5 }: { page?: number }, ...rest: unknown[]) {}
loadOptions({}, ...values);
      `,
    },
    {
      code: `
function loadOptions({
  first = 1,
  second = 2,
}: {
  first?: number;
  second?: number;
}) {}
loadOptions({ first: 1, second: 2 });
      `,
      errors: [
        {
          column: 15,
          endColumn: 23,
          endLine: 9,
          line: 9,
          messageId: 'redundantDefaultValue',
        },
        {
          column: 25,
          endColumn: 34,
          endLine: 9,
          line: 9,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function loadOptions({
  first = 1,
  second = 2,
}: {
  first?: number;
  second?: number;
}) {}
loadOptions({});
      `,
    },
    {
      code: `
function Header({ title = 5 }: { title?: number }) {
  return null;
}
<Header title={5} />;
      `,
      errors: [
        {
          column: 9,
          data: { kind: 'prop', name: 'title', value: '5' },
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'redundantDefaultValue',
        },
      ],
      filename: 'react.tsx',
      output: `
function Header({ title = 5 }: { title?: number }) {
  return null;
}
<Header />;
      `,
    },
    {
      code: `
const Label = ({ text = 'hello' }: { text?: string }) => null;
<Label text="hello" />;
      `,
      errors: [
        {
          column: 8,
          data: { kind: 'prop', name: 'text', value: '"hello"' },
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      filename: 'react.tsx',
      output: `
const Label = ({ text = 'hello' }: { text?: string }) => null;
<Label />;
      `,
    },
    {
      code: `
function Toggle({ enabled = true }: { enabled?: boolean }) {
  return null;
}
<Toggle enabled />;
      `,
      errors: [
        {
          column: 9,
          data: { kind: 'prop', name: 'enabled', value: 'true' },
          endColumn: 16,
          endLine: 5,
          line: 5,
          messageId: 'redundantDefaultValue',
        },
      ],
      filename: 'react.tsx',
      output: `
function Toggle({ enabled = true }: { enabled?: boolean }) {
  return null;
}
<Toggle />;
      `,
    },
    {
      code: `
function Header({ title = 5 }: { title?: number } = {}) {
  return null;
}
<Header title={5} />;
      `,
      errors: [
        {
          column: 9,
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'redundantDefaultValue',
        },
      ],
      filename: 'react.tsx',
      output: `
function Header({ title = 5 }: { title?: number } = {}) {
  return null;
}
<Header />;
      `,
    },
    {
      code: `
function Panel({ first = 1, second = 2 }: { first?: number; second?: number }) {
  return null;
}
<Panel first={1} second={2} />;
      `,
      errors: [
        {
          column: 8,
          endColumn: 17,
          endLine: 5,
          line: 5,
          messageId: 'redundantDefaultValue',
        },
        {
          column: 18,
          endColumn: 28,
          endLine: 5,
          line: 5,
          messageId: 'redundantDefaultValue',
        },
      ],
      filename: 'react.tsx',
      output: `
function Panel({ first = 1, second = 2 }: { first?: number; second?: number }) {
  return null;
}
<Panel />;
      `,
    },
    {
      code: `
const loadPage = (page = 5 as const) => {};
loadPage(5 as const);
      `,
      errors: [
        {
          column: 10,
          data: { kind: 'argument', name: 'page', value: '5' },
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
const loadPage = (page = 5 as const) => {};
loadPage();
      `,
    },
    {
      code: `
import { importedWithDefault } from './redundant-default-arguments';
importedWithDefault(0);
      `,
      errors: [
        {
          column: 21,
          data: { kind: 'argument', name: 'value', value: '0' },
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
import { importedWithDefault } from './redundant-default-arguments';
importedWithDefault();
      `,
    },
    {
      code: `
import { importedWithOptions } from './redundant-default-arguments';
importedWithOptions({ value: 5 });
      `,
      errors: [
        {
          column: 23,
          data: { kind: 'property', name: 'value', value: '5' },
          endColumn: 31,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
import { importedWithOptions } from './redundant-default-arguments';
importedWithOptions({});
      `,
    },
    {
      code: `
import { ImportedComponent } from './redundant-default-arguments';
<ImportedComponent value={5} />;
      `,
      errors: [
        {
          column: 20,
          data: { kind: 'prop', name: 'value', value: '5' },
          endColumn: 29,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      filename: 'react.tsx',
      output: `
import { ImportedComponent } from './redundant-default-arguments';
<ImportedComponent />;
      `,
    },
    {
      code: `
function loadPage(this: void, page = 20) {}
loadPage(20);
      `,
      errors: [
        {
          column: 10,
          data: { kind: 'argument', name: 'page', value: '20' },
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function loadPage(this: void, page = 20) {}
loadPage();
      `,
    },
    {
      code: `
function loadOptions({ page = 5 }: { page?: number; extra?: number }) {}
loadOptions({ page: 5, extra: 1 });
      `,
      errors: [
        {
          column: 15,
          data: { kind: 'property', name: 'page', value: '5' },
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function loadOptions({ page = 5 }: { page?: number; extra?: number }) {}
loadOptions({ extra: 1 });
      `,
    },
    {
      code: `
function loadOptions({ page = 5 }: { page?: number; extra?: number }) {}
loadOptions({ extra: 1, page: 5 });
      `,
      errors: [
        {
          column: 25,
          data: { kind: 'property', name: 'page', value: '5' },
          endColumn: 32,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function loadOptions({ page = 5 }: { page?: number; extra?: number }) {}
loadOptions({ extra: 1 });
      `,
    },
    {
      code: `
function loadPage(id: string, page = 20) {}
loadPage('a', 20);
      `,
      errors: [
        {
          column: 15,
          data: { kind: 'argument', name: 'page', value: '20' },
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function loadPage(id: string, page = 20) {}
loadPage('a');
      `,
    },
    {
      code: noFormat`
function loadPage(page = 20) {}
loadPage(20,);
      `,
      errors: [
        {
          column: 10,
          data: { kind: 'argument', name: 'page', value: '20' },
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function loadPage(page = 20) {}
loadPage();
      `,
    },
    {
      code: noFormat`
function loadOptions({ page = 5 }: { page?: number; extra?: number }) {}
loadOptions({ extra: 1, page: 5, });
      `,
      errors: [
        {
          column: 25,
          data: { kind: 'property', name: 'page', value: '5' },
          endColumn: 32,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function loadOptions({ page = 5 }: { page?: number; extra?: number }) {}
loadOptions({ extra: 1 });
      `,
    },
    {
      code: `
function Header({ title = 5, extra }: { title?: number; extra?: number }) {
  return null;
}
<Header title={5} extra={1} />;
      `,
      errors: [
        {
          column: 9,
          data: { kind: 'prop', name: 'title', value: '5' },
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'redundantDefaultValue',
        },
      ],
      filename: 'react.tsx',
      output: `
function Header({ title = 5, extra }: { title?: number; extra?: number }) {
  return null;
}
<Header extra={1} />;
      `,
    },
    {
      code: `
function Header({ title = 5 }: any) {
  return null;
}
<Header foo:bar={1} title={5} />;
      `,
      errors: [
        {
          column: 21,
          data: { kind: 'prop', name: 'title', value: '5' },
          endColumn: 30,
          endLine: 5,
          line: 5,
          messageId: 'redundantDefaultValue',
        },
      ],
      filename: 'react.tsx',
      output: `
function Header({ title = 5 }: any) {
  return null;
}
<Header foo:bar={1} />;
      `,
    },
    {
      code: noFormat`
function loadOptions({ page = 5 }: { page?: number }) {}
loadOptions({ 'page': 5 });
      `,
      errors: [
        {
          column: 15,
          data: { kind: 'property', name: 'page', value: '5' },
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function loadOptions({ page = 5 }: { page?: number }) {}
loadOptions({});
      `,
    },
    {
      code: `
function loadOptions({ 0: page = 5 }: { 0?: number }) {}
loadOptions({ 0: 5 });
      `,
      errors: [
        {
          column: 15,
          data: { kind: 'property', name: '0', value: '5' },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function loadOptions({ 0: page = 5 }: { 0?: number }) {}
loadOptions({});
      `,
    },
    {
      code: `
function loadOptions({ page = 5, ...rest }: { page?: number }) {}
loadOptions({ page: 5 });
      `,
      errors: [
        {
          column: 15,
          data: { kind: 'property', name: 'page', value: '5' },
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function loadOptions({ page = 5, ...rest }: { page?: number }) {}
loadOptions({});
      `,
    },
    {
      code: `
const loadPage = ((page = 5) => {}) as (page?: number) => void;
loadPage(5);
      `,
      errors: [
        {
          column: 10,
          data: { kind: 'argument', name: 'page', value: '5' },
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
const loadPage = ((page = 5) => {}) as (page?: number) => void;
loadPage();
      `,
    },
    {
      code: `
const loadPage = ((page = 5) => {})!;
loadPage(5);
      `,
      errors: [
        {
          column: 10,
          data: { kind: 'argument', name: 'page', value: '5' },
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
const loadPage = ((page = 5) => {})!;
loadPage();
      `,
    },
    {
      code: `
const loadPage = ((page = 5) => {}) satisfies (page?: number) => void;
loadPage(5);
      `,
      errors: [
        {
          column: 10,
          data: { kind: 'argument', name: 'page', value: '5' },
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
const loadPage = ((page = 5) => {}) satisfies (page?: number) => void;
loadPage();
      `,
    },
    {
      code: `
import { importedArrow } from './redundant-default-arguments';
importedArrow(0);
      `,
      errors: [
        {
          column: 15,
          data: { kind: 'argument', name: 'value', value: '0' },
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
import { importedArrow } from './redundant-default-arguments';
importedArrow();
      `,
    },
    {
      code: `
import { importedFnExpr } from './redundant-default-arguments';
importedFnExpr(0);
      `,
      errors: [
        {
          column: 16,
          data: { kind: 'argument', name: 'value', value: '0' },
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
import { importedFnExpr } from './redundant-default-arguments';
importedFnExpr();
      `,
    },
    {
      code: `
import { importedWithThis } from './redundant-default-arguments';
importedWithThis(0);
      `,
      errors: [
        {
          column: 18,
          data: { kind: 'argument', name: 'value', value: '0' },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
import { importedWithThis } from './redundant-default-arguments';
importedWithThis();
      `,
    },
    {
      code: `
import { importedLiterals } from './redundant-default-arguments';
importedLiterals('all', true, false, null, -1);
      `,
      errors: [
        {
          column: 18,
          data: { kind: 'argument', name: 'mode', value: '"all"' },
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
        {
          column: 25,
          data: { kind: 'argument', name: 'enabled', value: 'true' },
          endColumn: 29,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
        {
          column: 31,
          data: { kind: 'argument', name: 'disabled', value: 'false' },
          endColumn: 36,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
        {
          column: 38,
          data: { kind: 'argument', name: 'empty', value: 'null' },
          endColumn: 42,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
        {
          column: 44,
          data: { kind: 'argument', name: 'offset', value: '-1' },
          endColumn: 46,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
import { importedLiterals } from './redundant-default-arguments';
importedLiterals();
      `,
    },
    {
      code: `
import { importedWrapped } from './redundant-default-arguments';
importedWrapped(0, 0, 0, 0);
      `,
      errors: [
        {
          column: 17,
          data: { kind: 'argument', name: 'asserted', value: '0' },
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
        {
          column: 20,
          data: { kind: 'argument', name: 'parens', value: '0' },
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
        {
          column: 23,
          data: { kind: 'argument', name: 'nonNull', value: '0' },
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
        {
          column: 26,
          data: { kind: 'argument', name: 'satisfied', value: '0' },
          endColumn: 27,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
import { importedWrapped } from './redundant-default-arguments';
importedWrapped();
      `,
    },
    {
      code: `
import { importedKeys } from './redundant-default-arguments';
importedKeys({ 'the-value': 5, 0: 5 });
      `,
      errors: [
        {
          column: 16,
          data: { kind: 'property', name: 'the-value', value: '5' },
          endColumn: 30,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
        {
          column: 32,
          data: { kind: 'property', name: '0', value: '5' },
          endColumn: 36,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
import { importedKeys } from './redundant-default-arguments';
importedKeys({});
      `,
    },
  ],
});
