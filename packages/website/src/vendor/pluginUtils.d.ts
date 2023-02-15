import type React from 'react';

import type DesignSystem from './ds/createDesignSystem';

/** Creates a set of util functions which is exposed to Plugins to make it easier to build consistent UIs */
export declare const createUtils: (
  sb: unknown,
  react: typeof React,
) => {
  /** Use this to make a few dumb element generation funcs */
  el: (str: string, elementType: string, container: Element) => HTMLElement;
  /** Get a relative URL for something in your dist folder depending on if you're in dev mode or not */
  requireURL: (path: string) => string;
  /** The Gatsby copy of React */
  react: typeof React;
  /**
   * The playground plugin design system. Calling any of the functions will append the
   * element to the container you pass into the first param, and return the HTMLElement
   */
  createDesignSystem: ReturnType<typeof DesignSystem.createDesignSystem>;
  /** Flashes a HTML Element */
  flashHTMLElement: (element: HTMLElement) => void;
  /** Add a little red button in the top corner of a plugin tab with a number */
  setNotifications: (pluginID: string, amount: number) => void;
};
export declare type PluginUtils = ReturnType<typeof createUtils>;
