import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/classes/class-two-static-methods-named-constructor.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
