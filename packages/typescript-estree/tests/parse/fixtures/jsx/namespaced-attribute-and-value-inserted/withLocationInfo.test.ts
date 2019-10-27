import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/namespaced-attribute-and-value-inserted.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
