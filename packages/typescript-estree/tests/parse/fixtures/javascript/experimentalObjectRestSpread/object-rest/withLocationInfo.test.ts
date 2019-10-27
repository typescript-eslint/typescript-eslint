import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/experimentalObjectRestSpread/object-rest.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
