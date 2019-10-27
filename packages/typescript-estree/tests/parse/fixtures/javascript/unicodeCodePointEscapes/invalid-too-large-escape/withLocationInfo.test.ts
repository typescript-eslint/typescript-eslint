import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/unicodeCodePointEscapes/invalid-too-large-escape.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
