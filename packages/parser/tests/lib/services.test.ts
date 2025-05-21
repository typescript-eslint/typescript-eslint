import { createProgram } from '@typescript-eslint/typescript-estree';
import * as glob from 'glob';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { parseForESLint } from '../../src/index.js';
import {
  createConfig,
  FIXTURES_DIR,
  getRaw,
} from '../test-utils/test-utils.js';

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

const testFiles = glob.sync('**/*.src.ts', {
  absolute: true,
  cwd: FIXTURES_DIR,
});

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const program = createProgram(path.join(FIXTURES_DIR, 'tsconfig.json'));

describe.for(testFiles)('services', async filename => {
  const code = await fs.readFile(filename, {
    encoding: 'utf-8',
  });

  const { base, name } = path.parse(filename);

  const config = createConfig(base);

  const snapshotName = path.posix.join('fixtures', name);

  it(snapshotName, () => {
    const { ast } = parseForESLint(code, config);

    const result = getRaw(ast);

    expect(result).toMatchSnapshot();
  });

  it(`${snapshotName} services`, () => {
    const { services } = parseForESLint(code, config);

    assert.isNotNull(services.program);
  });

  it(`${snapshotName} services with provided program`, () => {
    const { services } = parseForESLint(code, { ...config, program });

    assert.isNotNull(services.program);
  });
});
