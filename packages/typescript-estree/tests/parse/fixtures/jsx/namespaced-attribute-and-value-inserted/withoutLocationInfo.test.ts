import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
