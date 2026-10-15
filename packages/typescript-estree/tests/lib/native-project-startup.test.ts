import type * as NativeSync from '@typescript/native/unstable/sync';
import type { ChildProcess } from 'node:child_process';

import fs from 'node:fs';
import path from 'node:path';

const fixtures = path.join(__dirname, '../fixtures/nativeProject');

afterEach(() => {
  vi.doUnmock('@typescript/native/unstable/sync');
  vi.resetModules();
});

async function importWithNative(API: unknown) {
  vi.doMock('@typescript/native/unstable/sync', () => ({ API }));
  return (await import('../../src/native/createNativeProjectService.js'))
    .createNativeProjectService;
}

it.each([
  ['the requested root directory', '/project/root', '/project/root'],
  ['the process directory when none is given', undefined, process.cwd()],
])('anchors the compiler process at %s', async (_name, requested, expected) => {
  const options: unknown[] = [];
  function API(apiOptions: unknown): void {
    options.push(apiOptions);
  }
  const createNativeProjectService = await importWithNative(API);

  createNativeProjectService(requested);

  expect(options).toHaveLength(1);
  expect((options[0] as { cwd: string }).cwd).toBe(expected);
});

it('opens the next file after the native process exits between files', async () => {
  const { API: NativeAPI } = await vi.importActual<typeof NativeSync>(
    '@typescript/native/unstable/sync',
  );
  const children: ChildProcess[] = [];
  class TrackedAPI extends NativeAPI {
    constructor(options: ConstructorParameters<typeof NativeAPI>[0]) {
      super(options);
      children.push(
        (this as unknown as { client: { channel: { child: ChildProcess } } })
          .client.channel.child,
      );
    }
  }
  const createNativeProjectService = await importWithNative(TrackedAPI);
  const service = createNativeProjectService();
  const firstPath = path.join(fixtures, 'file.ts');
  const secondPath = path.join(fixtures, 'second/file.ts');
  const secondCode = fs.readFileSync(secondPath, 'utf8');

  try {
    service.openFile(firstPath, fs.readFileSync(firstPath, 'utf8'));
    const exited = new Promise(resolve => children[0].once('exit', resolve));
    children[0].kill('SIGKILL');
    await exited;

    expect(service.openFile(secondPath, secondCode).sourceFile.text).toBe(
      secondCode,
    );
    expect(children).toHaveLength(2);
  } finally {
    service.close();
  }
});

it('wraps native API startup failures with their cause', async () => {
  const cause = new Error('native process failed');
  function API(): void {
    throw cause;
  }
  const createNativeProjectService = await importWithNative(API);

  expect(() => createNativeProjectService()).toThrow(
    expect.objectContaining({
      cause,
      message: expect.stringMatching(
        /^Failed to start the TypeScript native project service:/,
      ),
    }),
  );
});
