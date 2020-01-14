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
      `npx eslint --format json --config .eslintrc.yml ${paths}`,
      {
        cwd: path.join(FIXTURES_DIR, directory),
      },
    );
    return normalizeOutput(response.stdout);
  } catch (error) {
    return normalizeOutput(error.stdout || error);
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
