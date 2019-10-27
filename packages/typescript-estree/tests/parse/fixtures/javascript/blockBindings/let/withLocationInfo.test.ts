import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/blockBindings/let.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
