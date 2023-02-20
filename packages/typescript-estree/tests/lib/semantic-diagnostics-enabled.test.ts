import * as fs from 'fs';
import glob from 'glob';
import path from 'path';
import * as semver from 'semver';
import * as ts from 'typescript';

import * as parser from '../../src';
import { formatSnapshotName, isJSXFileType } from '../../tools/test-utils';
import { serializer } from '../../tools/tserror-serializer';

/**
 * Process all fixtures, we will only snapshot the ones that have semantic errors
 * which are ignored by default parsing logic.
 */
const FIXTURES_DIR = path.join(__dirname, '../../../ast-spec/src');

const FILE_NAME_START = 'fixture.ts';

const testFiles = glob.sync(`**/${FILE_NAME_START}`, {
  cwd: FIXTURES_DIR,
});

expect.addSnapshotSerializer(serializer);

interface FixtureVersionConfig {
  readonly typescript: string;
}

describe('Parse all fixtures with "errorOnTypeScriptSyntacticAndSemanticIssues" enabled', () => {
  testFiles.forEach(filename => {
    const configPath = path.join(
      FIXTURES_DIR,
      filename.replace(FILE_NAME_START, 'config.json'),
    );
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(
        fs.readFileSync(configPath).toString(),
      ) as FixtureVersionConfig;
      if (!semver.satisfies(ts.version, config.typescript)) {
        return;
      }
    }

    const code = fs.readFileSync(path.join(FIXTURES_DIR, filename), 'utf8');
    const fileExtension = path.extname(filename);
    const config: parser.TSESTreeOptions = {
      loc: true,
      range: true,
      tokens: true,
      errorOnUnknownASTType: true,
      errorOnTypeScriptSyntacticAndSemanticIssues: true,
      jsx: isJSXFileType(fileExtension),
    };
    it(formatSnapshotName(filename, FIXTURES_DIR, fileExtension), () => {
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
