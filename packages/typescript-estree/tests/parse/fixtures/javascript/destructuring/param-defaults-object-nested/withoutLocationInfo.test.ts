import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/destructuring/param-defaults-object-nested.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
