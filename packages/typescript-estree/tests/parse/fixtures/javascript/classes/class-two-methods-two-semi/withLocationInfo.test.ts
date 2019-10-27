import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/classes/class-two-methods-two-semi.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
