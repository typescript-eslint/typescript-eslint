import path from 'path';
import rule from '../../src/rules/no-unused-exports';
import {
  RuleTester,
  getFixturesRootDir,
  batchedSingleLineTests,
  noFormat,
} from '../RuleTester';

const fixturesDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: fixturesDir,
  },
});

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
 */
const exporter = path.join(fixturesDir, 'no-unused-exports', 'exporter.ts');
const exporterDefault = path.join(
  fixturesDir,
  'no-unused-exports',
  'exporter-default.ts',
);

ruleTester.run('no-unused-exports', rule, {
  valid: [
    {
      code: `
export default 1;
      `,
      filename: exporterDefault,
    },
    ...batchedSingleLineTests({
      code: noFormat`
export const used = 1;
export const { used } = { used: 1 };
export const { ...used } = { used: 1 };
export const { foo: { bar: [used] } } = { foo: { bar: [1] } };
export const { used = 1 } = { used: 1 };
export const [used] = [1];
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
  invalid: [],
});
