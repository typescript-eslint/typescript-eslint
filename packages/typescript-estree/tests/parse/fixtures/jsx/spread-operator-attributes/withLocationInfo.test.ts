import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/spread-operator-attributes.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
