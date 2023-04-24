import type { WebLinterModule } from '../linter/types';

export function loadWebLinterModule(): Promise<WebLinterModule> {
  return new Promise(resolve => {
    window.require<[WebLinterModule]>(
      [document.location.origin + '/sandbox/index.js'],
      webLinterModules => {
        resolve(webLinterModules);
      },
    );
  });
}
