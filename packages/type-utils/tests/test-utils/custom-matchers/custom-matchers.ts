import type {
  ParserServices,
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/typescript-estree';
import type * as ts from 'typescript';

import { parseForESLint } from '@typescript-eslint/parser';
import * as path from 'node:path';

import { isUnsafeAssignment } from '../../../src/isUnsafeAssignment.js';

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

function getTypes(
  code: string,
  declarationIndex = 0,
): {
  checker: ts.TypeChecker;
  receiver: ts.Type;
  sender: ts.Type;
  senderNode: TSESTree.Node;
} {
  const rootDir = path.join(__dirname, '..', '..', 'fixtures');
  const { ast, services } = parseForESLint(code, {
    disallowAutomaticSingleRunInference: true,
    filePath: path.join(rootDir, 'file.ts'),
    project: './tsconfig.json',
    tsconfigRootDir: rootDir,
  });
  assert.toHaveParserServices(services);
  const checker = services.program.getTypeChecker();

  const declaration = ast.body[
    declarationIndex
  ] as TSESTree.VariableDeclaration;
  const declarator = declaration.declarations[0];
  return {
    checker,
    receiver: services.getTypeAtLocation(declarator.id),
    sender: services.getTypeAtLocation(declarator.init!),
    senderNode: declarator.init!,
  };
}

expect.extend({
  toBeSafeAssignment(
    code: string,
    additionalOptions: {
      declarationIndex?: number;
      passSenderNode?: boolean;
    } = {},
  ) {
    const { isNot } = this;

    const { declarationIndex = 0, passSenderNode = false } = additionalOptions;

    const { checker, receiver, sender, senderNode } = getTypes(
      code,
      declarationIndex,
    );

    const actual = isUnsafeAssignment(
      sender,
      receiver,
      checker,
      passSenderNode ? senderNode : null,
    );

    const pass = actual === false;

    return {
      actual,
      expected: isNot
        ? expect.objectContaining({
            receiver: expect.anything(),
            sender: expect.anything(),
          })
        : false,
      message: () => `Expected Assignment${isNot ? ' not' : ''} to be safe.`,
      pass,
    };
  },

  toHaveTypes(
    code: string,
    additionalOptions: {
      senderStr: string;
      receiverStr: string;
      declarationIndex?: number;
      passSenderNode?: boolean;
    },
  ) {
    const { isNot } = this;

    const {
      declarationIndex = 0,
      passSenderNode = false,
      receiverStr,
      senderStr,
    } = additionalOptions;

    const { checker, receiver, sender, senderNode } = getTypes(
      code,
      declarationIndex,
    );

    const result = isUnsafeAssignment(
      sender,
      receiver,
      checker,
      passSenderNode ? senderNode : null,
    );

    assert.isNotFalse(result);

    const senderType = checker.typeToString(result.sender);
    const receiverType = checker.typeToString(result.receiver);

    const actual = { receiver: receiverType, sender: senderType };
    const expected = { receiver: receiverStr, sender: senderStr };

    const pass = receiverType === receiverStr && senderType === senderStr;

    return {
      actual,
      expected,
      message: () =>
        `Expected types of sender and receiver to${isNot ? ' not' : ''} match.`,
      pass,
    };
  },
});
