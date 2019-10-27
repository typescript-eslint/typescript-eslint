import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/octalLiterals/uppercase.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
