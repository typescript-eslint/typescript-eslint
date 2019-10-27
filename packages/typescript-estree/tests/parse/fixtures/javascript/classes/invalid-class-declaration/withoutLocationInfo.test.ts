import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/classes/invalid-class-declaration.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
