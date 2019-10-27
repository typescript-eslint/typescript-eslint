import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/for/for-with-const.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
