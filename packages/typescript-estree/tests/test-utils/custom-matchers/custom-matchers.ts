import * as ts from 'typescript';

import type {
  ParserServices,
  ParserServicesWithTypeInformation,
} from '../../../src/index.js';

chai.use((chai, utils) => {
  utils.addMethod(
    chai.assert,
    'toHaveParserServices',
    function toHaveParserServices(
      this: Chai.AssertStatic,
      services: ParserServices | null | undefined,
    ): asserts services is ParserServicesWithTypeInformation {
      this.exists(services?.program);
      expect(services.esTreeNodeToTSNodeMap).toBeDefined();
      expect(services.tsNodeToESTreeNodeMap).toBeDefined();
    },
  );

  utils.addMethod(
    chai.assert,
    'isTSNodeOfNumberArrayType',
    function isTSNodeOfNumberArrayType(
      this: Chai.AssertStatic,
      checker: ts.TypeChecker,
      tsNode: ts.Node,
    ): void {
      const nodeType = checker.getTypeAtLocation(tsNode);

      this.propertyVal(nodeType, 'flags', ts.TypeFlags.Object);

      this.propertyVal(nodeType, 'objectFlags', ts.ObjectFlags.Reference);

      const typeArguments = checker.getTypeArguments(
        nodeType as ts.TypeReference,
      );

      this.lengthOf(typeArguments, 1);

      this.propertyVal(typeArguments[0], 'flags', ts.TypeFlags.Number);
    },
  );
});
