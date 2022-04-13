import type { Sandbox } from '../sandbox';
import type { DiagnosticRelatedInformation, Node } from 'typescript';

export declare interface LocalStorageOption {
  blurb: string;
  flag: string;
  display: string;
  emptyImpliesEnabled?: true;
  oneline?: true;
  requireRestart?: true;
  onchange?: (newValue: boolean) => void;
}
export declare interface OptionsListConfig {
  style: 'separated' | 'rows';
  requireRestart?: true;
}
export declare type DesignSystem = ReturnType<
  ReturnType<typeof createDesignSystem>
>;
export declare const createDesignSystem: (sandbox: Sandbox) => (
  container: Element,
) => {
  /** The element of the design system */
  container: Element;
  /** Clear the sidebar */
  clear: () => void;
  /** Present code in a pre > code  */
  code: (code: string) => HTMLElement;
  /** Ideally only use this once, and maybe even prefer using subtitles everywhere */
  title: (title: string) => HTMLElement;
  /** Used to denote sections, give info etc */
  subtitle: (subtitle: string) => HTMLElement;
  /** Used to show a paragraph */
  p: (subtitle: string) => HTMLElement;
  /** When you can't do something, or have nothing to show */
  showEmptyScreen: (message: string) => HTMLDivElement;
  /**
   * Shows a list of hoverable, and selectable items (errors, highlights etc) which have code representation.
   * The type is quite small, so it should be very feasible for you to massage other data to fit into this function
   */
  listDiags: (
    model: import('monaco-editor').editor.ITextModel,
    diags: DiagnosticRelatedInformation[],
  ) => HTMLUListElement;
  /** Lets you remove the hovers from listDiags etc */
  clearDeltaDecorators: (force?: true | undefined) => void;
  /** Shows a single option in local storage (adds an li to the container BTW) */
  localStorageOption: (setting: LocalStorageOption) => HTMLLIElement;
  /** Uses localStorageOption to create a list of options */
  showOptionList: (
    options: LocalStorageOption[],
    style: OptionsListConfig,
  ) => void;
  /** Shows a full-width text input */
  createTextInput: (config: {
    id: string;
    placeholder: string;
    onChanged?: ((text: string, input: HTMLInputElement) => void) | undefined;
    onEnter: (text: string, input: HTMLInputElement) => void;
    value?: string | undefined;
    keepValueAcrossReloads?: true | undefined;
    isEnabled?: ((input: HTMLInputElement) => boolean) | undefined;
  }) => HTMLFormElement;
  /** Renders an AST tree */
  createASTTree: (
    node: Node,
    settings?:
      | {
          closedByDefault?: true | undefined;
        }
      | undefined,
  ) => HTMLDivElement;
  /** Creates an input button */
  button: (settings: {
    label: string;
    onclick?: ((ev: MouseEvent) => void) | undefined;
  }) => HTMLInputElement;
  /** Used to re-create a UI like the tab bar at the top of the plugins section */
  createTabBar: () => HTMLDivElement;
  /** Used with createTabBar to add buttons */
  createTabButton: (text: string) => HTMLButtonElement;
  /** A general "restart your browser" message  */
  declareRestartRequired: (i?: ((key: string) => string) | undefined) => void;
  /** Create a new Design System instance and add it to the container. You'll need to cast
   * this after usage, because otherwise the type-system circularly references itself
   */
  createSubDesignSystem: () => any;
};
