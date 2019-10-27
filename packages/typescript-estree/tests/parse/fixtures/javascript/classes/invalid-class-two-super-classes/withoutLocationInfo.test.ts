import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
