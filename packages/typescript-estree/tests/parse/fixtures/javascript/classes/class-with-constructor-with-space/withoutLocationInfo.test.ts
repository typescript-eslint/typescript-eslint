import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
