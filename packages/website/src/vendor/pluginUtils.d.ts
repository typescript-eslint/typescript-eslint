/**********************************************
 *      DO NOT MODIFY THIS FILE MANUALLY      *
 *                                            *
 *     THIS FILE HAS BEEN FETCHED FROM THE    *
 *      TYPESCRIPT PLAYGROUND SOURCE CODE.    *
 *                                            *
 *    YOU CAN REGENERATE THESE FILES USING    *
 *          yarn generate-website-dts         *
 **********************************************/

import type React from 'react';
/** Creates a set of util functions which is exposed to Plugins to make it easier to build consistent UIs */
export declare const createUtils: (
  sb: any,
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
  createDesignSystem: (container: Element) => {
    container: Element;
    clear: () => void;
    code: (code: string) => HTMLElement;
    title: (title: string) => HTMLElement;
    subtitle: (subtitle: string) => HTMLElement;
    p: (subtitle: string) => HTMLElement;
    showEmptyScreen: (message: string) => HTMLDivElement;
    listDiags: (
      model: import('monaco-editor').editor.ITextModel,
      diags: import('typescript').DiagnosticRelatedInformation[],
    ) => HTMLUListElement;
    clearDeltaDecorators: (force?: true | undefined) => void;
    localStorageOption: (
      setting: import('./ds/createDesignSystem').LocalStorageOption,
    ) => HTMLLIElement;
    showOptionList: (
      options: import('./ds/createDesignSystem').LocalStorageOption[],
      style: import('./ds/createDesignSystem').OptionsListConfig,
    ) => void;
    createTextInput: (config: {
      id: string;
      placeholder: string;
      onChanged?: ((text: string, input: HTMLInputElement) => void) | undefined;
      onEnter: (text: string, input: HTMLInputElement) => void;
      value?: string | undefined;
      keepValueAcrossReloads?: true | undefined;
      isEnabled?: ((input: HTMLInputElement) => boolean) | undefined;
    }) => HTMLFormElement;
    createASTTree: (
      node: import('typescript').Node,
      settings?:
        | {
            closedByDefault?: true | undefined;
          }
        | undefined,
    ) => HTMLDivElement;
    button: (settings: {
      label: string;
      onclick?: ((ev: MouseEvent) => void) | undefined;
    }) => HTMLInputElement;
    createTabBar: () => HTMLDivElement;
    createTabButton: (text: string) => HTMLButtonElement;
    declareRestartRequired: (i?: ((key: string) => string) | undefined) => void;
    createSubDesignSystem: () => any;
  };
  /** Flashes a HTML Element */
  flashHTMLElement: (element: HTMLElement) => void;
  /** Add a little red button in the top corner of a plugin tab with a number */
  setNotifications: (pluginID: string, amount: number) => void;
};
export declare type PluginUtils = ReturnType<typeof createUtils>;
