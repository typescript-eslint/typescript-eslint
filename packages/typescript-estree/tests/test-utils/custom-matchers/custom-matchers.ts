import * as ts from 'typescript';

import type {
  ParseAndGenerateServicesResult,
  ParserServices,
  ParserServicesWithTypeInformation,
  TSESTree,
  TSESTreeOptions,
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

  utils.addMethod(
    chai.assert,
    'testIsolatedFile',
    function testIsolatedFile(
      this: Chai.AssertStatic,
      parseResult: ParseAndGenerateServicesResult<TSESTreeOptions>,
    ): void {
      // get type checker
      this.toHaveParserServices(parseResult.services);

      const checker = parseResult.services.program.getTypeChecker();

      expect(checker).toBeDefined();

      // get number node (ast shape validated by snapshot)
      const declaration = (
        parseResult.ast.body[0] as TSESTree.VariableDeclaration
      ).declarations[0];

      this.isNotNull(declaration.init);

      const arrayMember = (declaration.init as TSESTree.ArrayExpression)
        .elements[0];

      this.isNotNull(arrayMember);

      // get corresponding TS node
      const tsArrayMember =
        parseResult.services.esTreeNodeToTSNodeMap.get(arrayMember);

      expect(tsArrayMember).toBeDefined();

      this.propertyVal(tsArrayMember, 'kind', ts.SyntaxKind.NumericLiteral);

      this.propertyVal(tsArrayMember as ts.NumericLiteral, 'text', '3');

      // get type of TS node
      const arrayMemberType = checker.getTypeAtLocation(tsArrayMember);

      this.propertyVal(arrayMemberType, 'flags', ts.TypeFlags.NumberLiteral);

      this.propertyVal(arrayMemberType, 'value', 3);

      // make sure it maps back to original ESTree node
      this.strictEqual(
        parseResult.services.tsNodeToESTreeNodeMap.get(tsArrayMember),
        arrayMember,
      );

      // get bound name
      const boundName = declaration.id as TSESTree.Identifier;

      this.propertyVal(boundName, 'name', 'x');

      const tsBoundName =
        parseResult.services.esTreeNodeToTSNodeMap.get(boundName);

      expect(tsBoundName).toBeDefined();

      this.isTSNodeOfNumberArrayType(checker, tsBoundName);

      expect(parseResult.services.tsNodeToESTreeNodeMap.get(tsBoundName)).toBe(
        boundName,
      );
    },
  );
});
