import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
