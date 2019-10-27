import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/objectLiteralComputedProperties/invalid-computed-variable-property.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
