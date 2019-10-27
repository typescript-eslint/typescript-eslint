import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/destructuring/param-defaults-array.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
