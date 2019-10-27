import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/classes/class-with-constructor-parameters.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
