import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
