import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/regexUFlag/regex-u-simple.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
