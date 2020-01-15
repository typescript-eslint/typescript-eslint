import * as execa from 'execa';
import path from 'path';

const FIXTURES_DIR = path.join(__dirname, '../fixtures/');

/**
 * Normalize json output if possible
 */
function normalizeOutput(value: string): unknown {
  try {
    return JSON.parse(value, (key, value) => {
      if (key === 'filePath') {
        return path
          .normalize(value)
          .replace(FIXTURES_DIR, '__ROOT__/')
          .replace(/\\/gm, '/');
      }
      return value;
    });
  } catch {
    return value;
  }
}

function runEslint(directory: string, paths: string): unknown {
  try {
    const response = execa.sync(
      'npx',
      ['eslint', paths, '--format', 'json', '--config', '.eslintrc.yml'],
      {
        cwd: path.join(FIXTURES_DIR, directory),
      },
    );
    return normalizeOutput(response.stdout);
  } catch (error) {
    return normalizeOutput(error.stdout || error);
  }
}

const integrationTests: [string, string][] = [
  ['markdown', '*.md'],
  ['recommended-does-not-require-program', '*.ts'],
  ['typescript-and-tslint-plugins-together', '*.ts'],
  ['vue-jsx', '*.vue'],
  ['vue-sfc', '*.vue'],
];

describe.each(integrationTests)('%s', (directory, path) => {
  it('it should produce the expected lint output', () => {
    expect(runEslint(directory, path)).toMatchSnapshot();
  });
});
