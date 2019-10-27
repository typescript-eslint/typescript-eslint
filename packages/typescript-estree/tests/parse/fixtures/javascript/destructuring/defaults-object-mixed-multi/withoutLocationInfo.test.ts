import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/destructuring/defaults-object-mixed-multi.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
