import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/spread-operator-attribute-and-regular-attribute.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
