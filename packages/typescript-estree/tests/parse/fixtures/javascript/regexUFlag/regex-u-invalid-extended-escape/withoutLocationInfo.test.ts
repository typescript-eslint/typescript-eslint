import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/regexUFlag/regex-u-invalid-extended-escape.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
