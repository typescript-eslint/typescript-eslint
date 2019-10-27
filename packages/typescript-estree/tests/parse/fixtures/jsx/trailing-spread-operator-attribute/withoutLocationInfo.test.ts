import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/trailing-spread-operator-attribute.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
