import { parseAndGenerateServices } from '../../src/parser.js';

it.skipIf(process.env.TYPESCRIPT_ESLINT_EXPERIMENTAL_BACKEND === 'tsgo')(
  'names the load failure when the tsgo backend is requested explicitly',
  () => {
    let thrown: unknown;
    try {
      parseAndGenerateServices('', {
        filePath: '/project/file.ts',
        projectService: { EXPERIMENTAL_backend: 'tsgo' },
      });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).message).toMatch(
      /^The experimental tsgo backend could not be loaded: Cannot find module/,
    );
    expect((thrown as Error).message).toMatch(
      /Install a TypeScript 7\.1 nightly or newer aliased as @typescript\/native\.$/,
    );
    expect((thrown as Error).cause).toBeInstanceOf(Error);
  },
);

it.each([
  ['stable TypeScript 7.0', '7.0.2'],
  ['an older 7.1 nightly', '7.1.0-dev.20260930.1'],
])('rejects %s as @typescript/native', async (_name, version) => {
  vi.resetModules();
  vi.doMock('@typescript/native/package.json', () => ({ version }));

  await expect(import('../../src/native/index.js')).rejects.toThrow(
    `@typescript/native ${version} is not supported`,
  );

  vi.doUnmock('@typescript/native/package.json');
  vi.resetModules();
});
