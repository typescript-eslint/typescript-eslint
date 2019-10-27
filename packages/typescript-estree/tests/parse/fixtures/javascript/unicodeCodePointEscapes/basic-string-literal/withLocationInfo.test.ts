import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/unicodeCodePointEscapes/basic-string-literal.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
