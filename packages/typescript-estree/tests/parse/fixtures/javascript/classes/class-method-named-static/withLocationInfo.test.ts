import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/classes/class-method-named-static.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
