import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
