import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/objectLiteralComputedProperties/standalone-expression-with-addition.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
