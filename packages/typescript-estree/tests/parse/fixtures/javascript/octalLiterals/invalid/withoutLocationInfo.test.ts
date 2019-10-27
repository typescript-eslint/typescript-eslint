import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/octalLiterals/invalid.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
