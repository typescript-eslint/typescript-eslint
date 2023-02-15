import type * as Monaco from 'monaco-editor';
import type React from 'react';

import type DesignSystem from './ds/createDesignSystem';
import type { PluginUtils } from './pluginUtils';
import type { Sandbox } from './sandbox';

export { PluginUtils } from './pluginUtils';
export declare interface PluginFactory {
  (
    i: (key: string, components?: unknown) => string,
    utils: PluginUtils,
  ): PlaygroundPlugin;
}

/** The interface of all sidebar plugins */
export interface PlaygroundPlugin {
  /** Not public facing, but used by the playground to uniquely identify plugins */
  id: string;
  /** To show in the tabs */
  displayName: string;
  /** Should this plugin be selected when the plugin is first loaded? Lets you check for query vars etc to load a particular plugin */
  shouldBeSelected?: () => boolean;
  /** Before we show the tab, use this to set up your HTML - it will all be removed by the playground when someone navigates off the tab */
  willMount?: (sandbox: Sandbox, container: HTMLDivElement) => void;
  /** After we show the tab */
  didMount?: (sandbox: Sandbox, container: HTMLDivElement) => void;
  /** Model changes while this plugin is actively selected  */
  modelChanged?: (
    sandbox: Sandbox,
    model: Monaco.editor.ITextModel,
    container: HTMLDivElement,
  ) => void;
  /** Delayed model changes while this plugin is actively selected, useful when you are working with the TS API because it won't run on every keypress */
  modelChangedDebounce?: (
    sandbox: Sandbox,
    model: Monaco.editor.ITextModel,
    container: HTMLDivElement,
  ) => void;
  /** Before we remove the tab */
  willUnmount?: (sandbox: Sandbox, container: HTMLDivElement) => void;
  /** After we remove the tab */
  didUnmount?: (sandbox: Sandbox, container: HTMLDivElement) => void;
  /** An object you can use to keep data around in the scope of your plugin object */
  data?: unknown;
}
interface PlaygroundConfig {
  /** Language like "en" / "ja" etc */
  lang: string;
  /** Site prefix, like "v2" during the pre-release */
  prefix: string;
  /** Optional plugins so that we can re-use the playground with different sidebars */
  plugins?: PluginFactory[];
  /** Should this playground load up custom plugins from localStorage? */
  supportCustomPlugins: boolean;
}
export declare const setupPlayground: (
  sandbox: Sandbox,
  monaco: typeof Monaco,
  config: PlaygroundConfig,
  i: (key: string) => string,
  react: typeof React,
) => {
  exporter: {
    openProjectInStackBlitz: () => void;
    openProjectInCodeSandbox: () => void;
    copyAsMarkdownIssue: (
      e: React.MouseEvent<Element, MouseEvent>,
    ) => Promise<boolean>;
    copyForChat: (e: React.MouseEvent<Element, MouseEvent>) => boolean;
    copyForChatWithPreview: (
      e: React.MouseEvent<Element, MouseEvent>,
    ) => boolean;
    openInTSAST: () => void;
    openInBugWorkbench: () => void;
    openInVSCodeDev: () => void;
    exportAsTweet: () => void;
  };
  // ui: import("./createUI").UI;
  registerPlugin: (plugin: PlaygroundPlugin) => void;
  plugins: PlaygroundPlugin[];
  getCurrentPlugin: () => PlaygroundPlugin;
  tabs: HTMLButtonElement[];
  setDidUpdateTab: (
    func: (
      newPlugin: PlaygroundPlugin,
      previousPlugin: PlaygroundPlugin,
    ) => void,
  ) => void;
  createUtils: (
    sb: unknown,
    react: typeof React,
  ) => {
    el: (str: string, elementType: string, container: Element) => HTMLElement;
    requireURL: (path: string) => string;
    react: typeof React;
    createDesignSystem: ReturnType<typeof DesignSystem.createDesignSystem>;
  };
};
export declare type Playground = ReturnType<typeof setupPlayground>;
