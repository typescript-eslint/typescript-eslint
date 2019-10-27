import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/decorators/property-decorators/property-decorator-factory-instance-member.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
