import type {
  ParserServices,
  ParserServicesWithTypeInformation,
} from '@typescript-eslint/typescript-estree';

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
});
