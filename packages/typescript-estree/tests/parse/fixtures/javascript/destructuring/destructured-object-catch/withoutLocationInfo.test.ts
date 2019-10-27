import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/destructuring/destructured-object-catch.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
