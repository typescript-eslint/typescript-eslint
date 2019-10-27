import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/destructuring/call-expression-destruction-object.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
