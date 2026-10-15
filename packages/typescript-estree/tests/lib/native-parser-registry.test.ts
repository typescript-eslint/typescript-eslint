import { parseAndGenerateServices } from '../../src/parser.js';

it('names the load failure when the native backend is requested explicitly', () => {
  let thrown: unknown;
  try {
    parseAndGenerateServices('', {
      filePath: '/project/file.ts',
      projectService: { EXPERIMENTAL_backend: 'native' },
    });
  } catch (error) {
    thrown = error;
  }

  expect(thrown).toBeInstanceOf(Error);
  expect((thrown as Error).message).toMatch(
    /^The experimental native project service could not be loaded: Cannot find module/,
  );
  expect((thrown as Error).message).toMatch(/Install @typescript\/native\.$/);
  expect((thrown as Error).cause).toBeInstanceOf(Error);
});
