import type { CompilerFlags } from '../types';

function reducerTsConfig(
  state: CompilerFlags,
  action:
    | { type: 'init'; config?: CompilerFlags }
    | { type: 'toggle'; checked: boolean; name: string },
): CompilerFlags {
  switch (action.type) {
    case 'toggle':
      return {
        ...state,
        [action.name]: action.checked,
      };
    case 'init':
      return {
        ...action.config,
      };
  }
  // @ts-expect-error: Safeguard
  throw new Error();
}

export default reducerTsConfig;
