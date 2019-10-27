import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
