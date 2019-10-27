import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/classes/class-two-computed-static-methods.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
