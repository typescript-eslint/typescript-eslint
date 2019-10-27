import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/destructuring/defaults-object-nested-multi.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
