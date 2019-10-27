import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
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
