import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
