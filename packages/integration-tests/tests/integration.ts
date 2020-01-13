import * as execa from 'execa';
import path from 'path';

const FIXTURES_DIR = path.join(__dirname, '../fixtures/');
const command = path.normalize('../../node_modules/.bin/eslint');

/**
 * Helper function that unifies paths between different OS
 */
function unifyPath(value: string): string {
  return value.replace(/\\(?!["])/gm, '/').replace(/\/\//gm, '/');
}

/**
 * Normalize json output if possible
 */
function normalizeOutput(value: string): unknown {
  try {
    return JSON.parse(value, (key, value) => {
      if (key === 'filePath') {
        return unifyPath(value).replace(
          new RegExp(unifyPath(FIXTURES_DIR), 'gm'),
          '__ROOT__/',
        );
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
      `${command} --format json --config .eslintrc.yml ${paths}`,
      {
        cwd: path.join(FIXTURES_DIR, directory),
      },
    );
    return normalizeOutput(response.stdout);
  } catch (error) {
    return normalizeOutput(error.stdout);
  }
}

describe('markdown', () => {
  it('it should produce the expected lint output', () => {
    const response = runEslint('markdown', '*.md');
    expect(response).toMatchSnapshot();
  });
});

describe('recommended-does-not-require-program', () => {
  it('it should produce the expected lint output', () => {
    const response = runEslint('recommended-does-not-require-program', '*.ts');
    expect(response).toMatchSnapshot();
  });
});

describe('typescript-and-tslint-plugins-together', () => {
  it('it should produce the expected lint output', () => {
    const response = runEslint(
      'typescript-and-tslint-plugins-together',
      '*.ts',
    );
    expect(response).toMatchSnapshot();
  });
});

describe('vue-jsx', () => {
  it('it should produce the expected lint output', () => {
    const response = runEslint('vue-jsx', '*.vue');
    expect(response).toMatchSnapshot();
  });
});

describe('vue-sfc', () => {
  it('it should produce the expected lint output', () => {
    const response = runEslint('vue-jsx', '*.vue');
    expect(response).toMatchSnapshot();
  });
});
