import path from 'path';
import rule, { MessageIds } from '../../src/rules/no-unused-exports';
import {
  RuleTester,
  getFixturesRootDir,
  batchedSingleLineTests,
  noFormat,
} from '../RuleTester';
import { TSESLint } from '@typescript-eslint/experimental-utils';

const fixturesDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: fixturesDir,
  },
});

function fillError(
  count: number,
  error: TSESLint.TestCaseError<MessageIds>,
): TSESLint.TestCaseError<MessageIds>[] {
  const errors: TSESLint.TestCaseError<MessageIds>[] = [];
  for (let i = 2; i < count + 2; i += 1) {
    errors.push({
      ...error,
      line: i,
    });
  }
  return errors;
}

/**
 * The fixtures are setup as follows:
 * - importer.ts
 *   - import { used } from './exporter';
 * - exporter.ts
 *   - must have one named export called "used"
 *
 * - importer-default.ts
 *   - import def from './exporter-default';
 * - exporter-default.ts
 *   - must contain a default export
 *
 * - exporter-unused.ts
 *   - not imported by anything
 */
const exportsFixturesDir = path.join(fixturesDir, 'no-unused-exports');
const exporter = path.join(exportsFixturesDir, 'exporter.ts');
const exporterDefault = path.join(exportsFixturesDir, 'exporter-default.ts');
const exporterUnused = path.join(exportsFixturesDir, 'exporter-unused.ts');

ruleTester.run('no-unused-exports', rule, {
  valid: [
    ...batchedSingleLineTests({
      code: noFormat`
export const used = 1;
export const { used } = { used: 1 };
export const { ...used } = { used: 1 };
export const { foo: { bar: [used] } } = { foo: { bar: [1] } };
export const { used = 1 } = { used: 1 };
export const [used] = [1];
export const [used,,] = [1,2,3];
export const [...used] = [1];
export const [used = 1] = [1];
export class used {}
export type used = 1;
export interface used {}
export enum used {}
export function used() {}
export module used {}
export namespace used {}
const used = 1; export { used };
export { default as used } from './exporter-default';
      `,
      filename: exporter,
    }),
    // a weird, but valid exported object pattern
    {
      code: `
declare const key: string;
export const { [key]: used } = { used: 1 } as Record<string, number>;
      `,
      filename: exporter,
    },

    // default export
    ...batchedSingleLineTests({
      code: noFormat`
export default 1;
const v = 1; export default v;
export default class {}
export { default } from './exporter';
      `,
      filename: exporterDefault,
    }),
  ],
  invalid: [
    ...batchedSingleLineTests({
      code: noFormat`
export const unused = 1;
export const { unused } = { unused: 1 };
export const { ...unused } = { unused: 1 };
export const { foo: { bar: [unused] } } = { foo: { bar: [1] } };
export const { unused = 1 } = { unused: 1 };
export const [unused] = [1];
export const [...unused] = [1];
export const [unused = 1] = [1];
export class unused {}
export type unused = 1;
export interface unused {}
export enum unused {}
export function unused() {}
export module unused {}
export namespace unused {}
      `,
      filename: exporter,
      errors: [
        ...fillError(8, {
          messageId: 'unusedExportDeclaration',
          data: {
            name: 'unused',
            type: 'variable',
          },
        }),
        {
          messageId: 'unusedExportDeclaration',
          line: 10,
          data: {
            name: 'unused',
            type: 'class',
          },
        },
        {
          messageId: 'unusedExportDeclaration',
          line: 11,
          data: {
            name: 'unused',
            type: 'type',
          },
        },
        {
          messageId: 'unusedExportDeclaration',
          line: 12,
          data: {
            name: 'unused',
            type: 'interface',
          },
        },
        {
          messageId: 'unusedExportDeclaration',
          line: 13,
          data: {
            name: 'unused',
            type: 'enum',
          },
        },
        {
          messageId: 'unusedExportDeclaration',
          line: 14,
          data: {
            name: 'unused',
            type: 'function',
          },
        },
        {
          messageId: 'unusedExportDeclaration',
          line: 15,
          data: {
            name: 'unused',
            type: 'module',
          },
        },
        {
          messageId: 'unusedExportDeclaration',
          line: 16,
          data: {
            name: 'unused',
            type: 'namespace',
          },
        },
      ],
    }),
    ...batchedSingleLineTests({
      code: noFormat`
const unused = 1; export { unused };
export { default as unused } from './exporter-default';
      `,
      filename: exporterUnused,
      errors: fillError(2, {
        messageId: 'unusedNamedExport',
        data: {
          name: 'unused',
        },
      }),
    }),
    {
      code: noFormat`
export default 1;
      `,
      filename: exporterUnused,
      errors: [
        {
          messageId: 'unusedDefaultExport',
          data: {
            name: 'unused',
          },
        },
      ],
    },
    ...batchedSingleLineTests({
      code: noFormat`
export default 1;
const v = 1; export default v;
export default class {}
export { default } from './exporter';
      `,
      filename: exporterUnused,
      errors: fillError(4, {
        messageId: 'unusedDefaultExport',
        data: {
          name: 'unused',
        },
      }),
    }),

    // validate that it only flags the unused export
    ...batchedSingleLineTests({
      code: noFormat`
export const used = 1; export const unused = 1;
const unused = 1; const used = 2; export { unused, used };
export { default as unused, used } from './exporter-default';
      `,
      filename: exporter,
      errors: [
        {
          messageId: 'unusedExportDeclaration',
          line: 2,
          data: {
            name: 'unused',
            type: 'variable',
          },
        },
        {
          messageId: 'unusedNamedExport',
          line: 3,
          data: {
            name: 'unused',
          },
        },
        {
          messageId: 'unusedNamedExport',
          line: 4,
          data: {
            name: 'unused',
          },
        },
      ],
    }),
  ],
});
