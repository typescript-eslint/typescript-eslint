import { addSerializer } from 'jest-specific-snapshot';
import * as DefinitionBase from './DefinitionBase';
import * as Reference from './Reference';
import * as ScopeBase from './ScopeBase';
import * as ScopeManager from './ScopeManager';
import * as TSESTreeNode from './TSESTreeNode';
import * as Variable from './Variable';
import { resetIds } from '../../../src/ID';

const serializers = [
  DefinitionBase.serializer,
  Reference.serializer,
  ScopeBase.serializer,
  ScopeManager.serializer,
  TSESTreeNode.serializer,
  Variable.serializer,
];

for (const serializer of serializers) {
  // the jest types are wrong here
  expect.addSnapshotSerializer(serializer);
  addSerializer(serializer);
}

// make sure the snapshots are isolated from one another
beforeEach(() => {
  resetIds();
});
