import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/function/function-with-return.js',
  ),
  {
    useJSXTextNode: false,
  },
);
