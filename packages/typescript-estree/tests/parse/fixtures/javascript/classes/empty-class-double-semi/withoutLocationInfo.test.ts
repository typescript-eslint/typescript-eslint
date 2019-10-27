import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/classes/empty-class-double-semi.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
