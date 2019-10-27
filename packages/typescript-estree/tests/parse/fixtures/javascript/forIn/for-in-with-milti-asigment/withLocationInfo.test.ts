import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/forIn/for-in-with-milti-asigment.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
