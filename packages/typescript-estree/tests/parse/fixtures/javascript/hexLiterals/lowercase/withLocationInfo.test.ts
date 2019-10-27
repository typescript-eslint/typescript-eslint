import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/hexLiterals/lowercase.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
