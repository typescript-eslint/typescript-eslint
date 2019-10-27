import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/classes/invalid-class-two-super-classes.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
