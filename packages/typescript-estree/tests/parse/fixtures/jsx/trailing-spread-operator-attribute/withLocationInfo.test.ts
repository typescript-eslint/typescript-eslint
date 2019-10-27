import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
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
