import type { ParserResponse } from '../parsers/parser-types.js';

import { ParserResponseType } from '../parsers/parser-types.js';

chai.use((chai, utils) => {
  function successResponse(this: Chai.AssertionStatic, errorMessage?: string) {
    if (errorMessage) {
      utils.flag(this, 'message', errorMessage);
    }

    const thing: ParserResponse = utils.flag(this, 'object');

    const negate: boolean = utils.flag(this, 'negate') ?? false;

    const ssfi: (...args: unknown[]) => unknown = utils.flag(this, 'ssfi');

    const assertion = new chai.Assertion(thing, errorMessage, ssfi, true);

    if (negate) {
      (utils.hasProperty(thing, 'type') ? assertion : assertion.not).to.have
        .property('type')
        .that.does.not.equals(ParserResponseType.NoError);
    } else {
      assertion.to.have
        .property('type')
        .that.equals(ParserResponseType.NoError);
    }
  }

  chai.Assertion.addMethod(successResponse.name, successResponse);

  chai.assert.isSuccessResponse = (thing, errorMessage) => {
    new chai.Assertion(
      thing,
      errorMessage,
      chai.assert.isSuccessResponse,
      true,
    ).to.be.successResponse();
  };

  chai.assert.isNotSuccessResponse = (thing, errorMessage) => {
    new chai.Assertion(
      thing,
      errorMessage,
      chai.assert.isNotSuccessResponse,
      true,
    ).not.to.be.successResponse();
  };

  function errorResponse(this: Chai.AssertionStatic, errorMessage?: string) {
    if (errorMessage) {
      utils.flag(this, 'message', errorMessage);
    }

    const thing: ParserResponse = utils.flag(this, 'object');

    const negate: boolean = utils.flag(this, 'negate') ?? false;

    const ssfi: (...args: unknown[]) => unknown = utils.flag(this, 'ssfi');

    const assertion = new chai.Assertion(thing, errorMessage, ssfi, true);

    if (negate) {
      (utils.hasProperty(thing, 'type') ? assertion : assertion.not).to.have
        .property('type')
        .that.does.not.equals(ParserResponseType.Error);
    } else {
      assertion.to.have.property('type').that.equals(ParserResponseType.Error);
    }
  }

  chai.Assertion.addMethod(errorResponse.name, errorResponse);

  chai.assert.isErrorResponse = (thing, errorMessage) => {
    new chai.Assertion(
      thing,
      errorMessage,
      chai.assert.isErrorResponse,
      true,
    ).to.be.errorResponse();
  };

  chai.assert.isNotErrorResponse = (thing, errorMessage) => {
    new chai.Assertion(
      thing,
      errorMessage,
      chai.assert.isErrorResponse,
      true,
    ).not.to.be.errorResponse();
  };
});
