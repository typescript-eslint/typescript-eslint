import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/bigIntLiterals/binary.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
