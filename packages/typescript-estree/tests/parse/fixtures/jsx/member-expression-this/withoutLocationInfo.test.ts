import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/member-expression-this.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
