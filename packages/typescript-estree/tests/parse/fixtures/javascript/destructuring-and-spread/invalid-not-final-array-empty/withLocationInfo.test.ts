import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/destructuring-and-spread/invalid-not-final-array-empty.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
