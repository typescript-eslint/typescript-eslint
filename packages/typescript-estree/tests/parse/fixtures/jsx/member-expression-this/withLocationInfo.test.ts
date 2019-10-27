import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
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
