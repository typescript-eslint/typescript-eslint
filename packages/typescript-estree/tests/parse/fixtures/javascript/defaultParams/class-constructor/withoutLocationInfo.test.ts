import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/defaultParams/class-constructor.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
