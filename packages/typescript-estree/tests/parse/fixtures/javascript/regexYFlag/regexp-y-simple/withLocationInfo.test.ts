import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/regexYFlag/regexp-y-simple.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
