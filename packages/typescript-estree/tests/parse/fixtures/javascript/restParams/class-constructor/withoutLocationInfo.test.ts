import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/restParams/class-constructor.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
