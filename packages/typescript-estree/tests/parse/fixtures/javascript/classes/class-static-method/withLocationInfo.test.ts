import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/classes/class-static-method.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
