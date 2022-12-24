import { readFileSync } from 'fs';
import glob from 'glob';
import path from 'path';

import * as parser from '../../src';
import { formatSnapshotName, isJSXFileType } from '../../tools/test-utils';
import { serializer } from '../../tools/tserror-serializer';

/**
 * Process all fixtures, we will only snapshot the ones that have syntactic errors
 * which are ignored by default parsing logic.
 */
const FIXTURES_DIR = path.join(__dirname, '../../../shared-fixtures/fixtures');

const testFiles = glob.sync('**/*.src.*', {
  cwd: FIXTURES_DIR,
});

expect.addSnapshotSerializer(serializer);

describe('Parse all fixtures with "errorOnTypeScriptIssues" set to TypeScriptIssueDetection.Syntactic', () => {
  testFiles.forEach(filename => {
    const code = readFileSync(path.join(FIXTURES_DIR, filename), 'utf8');
    const fileExtension = path.extname(filename);
    const config: parser.TSESTreeOptions = {
      loc: true,
      range: true,
      tokens: true,
      errorOnUnknownASTType: true,
      errorOnTypeScriptIssues: parser.TypeScriptIssueDetection.Syntactic,
      jsx: isJSXFileType(fileExtension),
    };
    it(formatSnapshotName(filename, FIXTURES_DIR, fileExtension), () => {
      expect.assertions(1);
      try {
        parser.parseAndGenerateServices(code, config);
        expect('TEST OUTPUT: No syntactic issues found').toMatchSnapshot();
      } catch (err) {
        expect(err).toMatchSnapshot();
      }
    });
  });
});
