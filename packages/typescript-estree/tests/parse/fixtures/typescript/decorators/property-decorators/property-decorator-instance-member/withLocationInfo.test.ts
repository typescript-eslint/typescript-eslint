import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/decorators/property-decorators/property-decorator-instance-member.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
