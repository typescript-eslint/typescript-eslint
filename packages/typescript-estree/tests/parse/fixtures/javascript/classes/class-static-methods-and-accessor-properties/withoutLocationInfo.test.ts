import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/classes/class-static-methods-and-accessor-properties.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
