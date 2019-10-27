import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
