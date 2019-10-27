import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/binaryLiterals/uppercase.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
