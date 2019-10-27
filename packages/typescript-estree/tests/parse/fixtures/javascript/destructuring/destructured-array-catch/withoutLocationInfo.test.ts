import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/destructuring/destructured-array-catch.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
