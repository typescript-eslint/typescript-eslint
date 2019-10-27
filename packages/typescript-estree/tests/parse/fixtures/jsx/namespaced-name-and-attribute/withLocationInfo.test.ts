import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/namespaced-name-and-attribute.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
