import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/destructuring/object-var-undefined.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
