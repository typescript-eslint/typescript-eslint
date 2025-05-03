import * as ts from 'typescript';

import type { ParserServices } from '../../../src/index.js';

chai.use((chai, utils) => {
  function parserServices(this: Chai.AssertionStatic, errorMessage?: string) {
    if (errorMessage) {
      utils.flag(this, 'message', errorMessage);
    }

    const services: ParserServices | null | undefined = utils.flag(
      this,
      'object',
    );

    const negate: boolean = utils.flag(this, 'negate') ?? false;

    const ssfi: (...args: unknown[]) => unknown = utils.flag(this, 'ssfi');

    const assertion = new chai.Assertion(services, errorMessage, ssfi, true);

    (negate ? assertion.not : assertion).to.have
      .property('program')
      .that.does.not.equal(null);
  }

  chai.Assertion.addMethod(parserServices.name, parserServices);

  chai.assert.isParserServices = (services, errorMessage) => {
    new chai.Assertion(
      services,
      errorMessage,
      chai.assert.isParserServices,
      true,
    ).to.be.parserServices();
  };

  chai.assert.isNotParserServices = (services, errorMessage) => {
    new chai.Assertion(
      services,
      errorMessage,
      chai.assert.isNotParserServices,
      true,
    ).not.to.be.parserServices();
  };

  function TSNodeOfNumberArrayType(
    this: Chai.AssertionStatic,
    errorMessage?: string,
  ) {
    if (errorMessage) {
      utils.flag(this, 'message', errorMessage);
    }

    const { checker, tsNode }: { checker: ts.TypeChecker; tsNode: ts.Node } =
      utils.flag(this, 'object');

    const ssfi: (...args: unknown[]) => unknown = utils.flag(this, 'ssfi');

    const negate: boolean = utils.flag(this, 'negate') ?? false;

    const nodeType = checker.getTypeAtLocation(tsNode);

    const nodeTypeAssertion = new chai.Assertion(
      nodeType,
      errorMessage,
      ssfi,
      true,
    );

    (negate ? nodeTypeAssertion.not : nodeTypeAssertion).to.have
      .property('flags')
      .that.equals(ts.TypeFlags.Object);

    (negate ? nodeTypeAssertion.not : nodeTypeAssertion).to.have
      .property('objectFlags')
      .that.equals(ts.ObjectFlags.Reference);

    const typeArguments = checker.getTypeArguments(
      nodeType as ts.TypeReference,
    );

    (negate
      ? new chai.Assertion(typeArguments, errorMessage, ssfi, true).not
      : new chai.Assertion(typeArguments, errorMessage, ssfi, true)
    ).lengthOf(1);

    (negate
      ? new chai.Assertion(typeArguments[0], errorMessage, ssfi, true).not
      : new chai.Assertion(typeArguments[0], errorMessage, ssfi, true)
    ).to.have
      .property('flags')
      .that.equals(ts.TypeFlags.Number);
  }

  chai.Assertion.addMethod(
    TSNodeOfNumberArrayType.name,
    TSNodeOfNumberArrayType,
  );

  chai.assert.isTSNodeOfNumberArrayType = (expected, errorMessage) => {
    new chai.Assertion(
      expected,
      errorMessage,
      chai.assert.isTSNodeOfNumberArrayType,
      true,
    ).to.be.TSNodeOfNumberArrayType();
  };

  chai.assert.isNotTSNodeOfNumberArrayType = (expected, errorMessage) => {
    new chai.Assertion(
      expected,
      errorMessage,
      chai.assert.isNotTSNodeOfNumberArrayType,
      true,
    ).not.to.be.TSNodeOfNumberArrayType();
  };
});
