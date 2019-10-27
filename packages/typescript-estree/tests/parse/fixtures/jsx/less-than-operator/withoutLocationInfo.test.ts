import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/less-than-operator.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
