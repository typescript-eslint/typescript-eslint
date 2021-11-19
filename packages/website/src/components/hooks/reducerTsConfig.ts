import type { CompilerFlags } from '../types';

function reducerTsConfig(
  state: CompilerFlags,
  action:
    | { type: 'init'; config?: CompilerFlags }
    | { type: 'toggle'; checked: boolean; name: string },
): CompilerFlags {
  switch (action.type) {
    case 'toggle': {
      const newState = { ...state };
      if (action.checked) {
        newState[action.name] = action.checked;
      } else if (action.name in newState) {
        delete newState[action.name];
      }
      return newState;
    }
    case 'init':
      return {
        ...action.config,
      };
  }
  // @ts-expect-error: Safeguard
  throw new Error();
}

export default reducerTsConfig;
