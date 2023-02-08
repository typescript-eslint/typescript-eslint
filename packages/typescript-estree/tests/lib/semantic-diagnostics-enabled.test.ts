import { readFileSync } from 'fs';
import glob from 'glob';
import path from 'path';

import * as parser from '../../src';
import { formatSnapshotName, isJSXFileType } from '../../tools/test-utils';
import { serializer } from '../../tools/tserror-serializer';

/**
 * Process all fixtures, we will only snapshot the ones that have semantic errors
 * which are ignored by default parsing logic.
 */
const AST_SPEC_DIR = path.join(__dirname, '../../../ast-spec');

const testFiles = glob.sync('{legacy-fixtures,src}/**/fixture.ts', {
  cwd: AST_SPEC_DIR,
});

expect.addSnapshotSerializer(serializer);

describe('Parse all fixtures with "errorOnTypeScriptSyntacticAndSemanticIssues" enabled', () => {
  testFiles.forEach(filename => {
    const code = readFileSync(path.join(AST_SPEC_DIR, filename), 'utf8');
    const fileExtension = path.extname(filename);
    const config: parser.TSESTreeOptions = {
      loc: true,
      range: true,
      tokens: true,
      errorOnUnknownASTType: true,
      errorOnTypeScriptSyntacticAndSemanticIssues: true,
      jsx: isJSXFileType(fileExtension),
    };
    it(formatSnapshotName(filename, AST_SPEC_DIR, fileExtension), () => {
      expect.assertions(1);
      try {
        parser.parseAndGenerateServices(code, config);
        expect(
          'TEST OUTPUT: No semantic or syntactic issues found',
        ).toMatchSnapshot();
      } catch (err) {
        expect(err).toMatchSnapshot();
      }
    });
  });
});
