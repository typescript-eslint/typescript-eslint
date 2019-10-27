import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/simple-literals/literal-string.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
