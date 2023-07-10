import type {
  ParserServices,
  ParserServicesWithTypeInformation,
} from '../../../src';

export function expectToHaveParserServices(
  services: ParserServices | null | undefined,
): asserts services is ParserServicesWithTypeInformation {
  expect(services?.program).toBeDefined();
  expect(services?.esTreeNodeToTSNodeMap).toBeDefined();
  expect(services?.tsNodeToESTreeNodeMap).toBeDefined();
}
