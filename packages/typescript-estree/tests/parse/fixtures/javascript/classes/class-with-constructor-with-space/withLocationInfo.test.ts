import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/classes/class-with-constructor-with-space.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
