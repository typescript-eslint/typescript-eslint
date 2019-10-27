import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
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
