import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as ts from 'typescript';

import { createDirectoryListingHost } from '../src/createDirectoryListingHost.js';

describe(createDirectoryListingHost, () => {
  let directory: string;

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'directory-listing-'));

    for (const file of ['a.ts', 'b.json', 'c.min.js', 'no-extension']) {
      fs.writeFileSync(path.join(directory, file), '');
    }
    fs.mkdirSync(path.join(directory, 'nested'));
    fs.mkdirSync(path.join(directory, 'nested.dir'));
    fs.writeFileSync(path.join(directory, 'nested', 'd.ts'), '');
  });

  afterEach(() => {
    fs.rmSync(directory, { force: true, recursive: true });
  });

  const toBaseNames = (filePaths: readonly string[]): string[] =>
    filePaths.map(filePath => path.basename(filePath)).sort();

  it('lists the same files as ts.sys for a single-level *.* listing', () => {
    const host = createDirectoryListingHost(ts.sys);

    const actual = host.readDirectory(directory, undefined, undefined, ['*.*']);

    expect(toBaseNames(actual)).toStrictEqual(
      toBaseNames(
        ts.sys.readDirectory(directory, undefined, undefined, ['*.*']),
      ),
    );
  });

  it('reuses the listing for getDirectories on the same directory', () => {
    const sys = { ...ts.sys, getDirectories: vi.fn(ts.sys.getDirectories) };
    const host = createDirectoryListingHost(sys);

    host.readDirectory(directory, undefined, undefined, ['*.*']);
    const actual = host.getDirectories(directory);

    expect(actual).toStrictEqual(ts.sys.getDirectories(directory));
    expect(sys.getDirectories).not.toHaveBeenCalled();
  });

  it('delegates getDirectories for a different directory', () => {
    const sys = { ...ts.sys, getDirectories: vi.fn(ts.sys.getDirectories) };
    const host = createDirectoryListingHost(sys);
    const nested = path.join(directory, 'nested');

    host.readDirectory(directory, undefined, undefined, ['*.*']);
    host.getDirectories(nested);

    expect(sys.getDirectories).toHaveBeenCalledExactlyOnceWith(nested);
  });

  it('delegates readDirectory for other patterns', () => {
    const sys = { ...ts.sys, readDirectory: vi.fn(ts.sys.readDirectory) };
    const host = createDirectoryListingHost(sys);

    host.readDirectory(directory, ['.ts'], undefined, ['**/*']);

    expect(sys.readDirectory).toHaveBeenCalledExactlyOnceWith(
      directory,
      ['.ts'],
      undefined,
      ['**/*'],
      undefined,
    );
  });

  it('returns no files for a directory that does not exist', () => {
    const host = createDirectoryListingHost(ts.sys);

    const actual = host.readDirectory(
      path.join(directory, 'missing'),
      undefined,
      undefined,
      ['*.*'],
    );

    expect(actual).toStrictEqual([]);
  });
});
