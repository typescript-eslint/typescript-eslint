import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
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
