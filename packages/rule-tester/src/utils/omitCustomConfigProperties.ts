import type { RuleTesterConfig } from '../types/RuleTesterConfig';

export function omitCustomConfigProperties(
  config: Partial<RuleTesterConfig>,
): Omit<typeof config, 'defaultFilenames'> {
  const copy = { ...config };

  delete copy.defaultFilenames;

  return copy;
}
