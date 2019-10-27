import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/experimentalOptionalCatchBinding/optional-catch-binding-finally.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
