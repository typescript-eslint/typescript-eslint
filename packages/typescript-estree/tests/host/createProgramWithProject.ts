import path from 'path';
import {
  clearCache,
  createProgramWithProject,
} from '../../src/host/createProgramWithProject';
import { Program } from 'typescript';

afterEach(() => {
  clearCache();
});

describe('createProgramWithProject', () => {
  describe('simple project', () => {
    const FIXTURES_DIR = `${process.cwd()}/tests/fixtures/simpleProject`;
    const FILE_PATH = './file.ts';
    const tsconfigPath = `${FIXTURES_DIR}/tsconfig.json`;

    function parse(code = `const x = ${Math.random()};`): Program {
      const program = createProgramWithProject(code, FILE_PATH, tsconfigPath);
      expect(program).not.toBeUndefined();
      const sourceFile = program.getSourceFile(
        path.resolve(FIXTURES_DIR, FILE_PATH),
      );
      expect(sourceFile).not.toBeUndefined();
      expect(sourceFile!.getText()).toEqual(code);

      return program;
    }
    it('should parse a file', () => {
      parse();
    });

    it('should handle local updates to an existing file', () => {
      parse();
      parse();
    });

    it('should not generate a new project if the file contents do not change', () => {
      const oldProg = parse('const x = 1;');
      const newProg = parse('const x = 1;');

      expect(oldProg).toBe(newProg);
    });
  });

  describe('multi-file project', () => {
    const FIXTURES_DIR = `${process.cwd()}/tests/fixtures/multiFileProject`;
    const tsconfigPath = `${FIXTURES_DIR}/tsconfig.json`;

    function parse(
      filePath: string,
      code = `const x = ${Math.random()};`,
    ): void {
      const program = createProgramWithProject(code, filePath, tsconfigPath);
      expect(program).not.toBeUndefined();
      const sourceFile = program.getSourceFile(
        path.resolve(FIXTURES_DIR, filePath),
      );
      expect(sourceFile).not.toBeUndefined();
      expect(sourceFile!.getText()).toEqual(code);
    }
    it('should parse a file', () => {
      parse('./src/file1.ts');
    });

    it('should handle local updates to the file', () => {
      parse('./src/file1.ts');
      parse('./src/file1.ts');
    });

    it('should handle multiple files', () => {
      const file1 = `./src/file1.ts`;
      parse(file1);
      const file2 = `./src/file2.ts`;
      parse(file2);
      const file3 = `./src/file2.ts`;
      parse(file3);
    });
  });
});
