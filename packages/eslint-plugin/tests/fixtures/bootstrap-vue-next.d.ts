declare module 'bootstrap-vue-next' {
  export type ControllerKey = symbol | string;

  export interface PromiseWithComponent<T, P>
    extends Promise<void>, PromiseWithComponentInternal<T, P> {}

  export interface PromiseWithComponentInternal<T, P> {
    id: ControllerKey;
    ref: T | null;
    show: () => PromiseWithComponent<T, P>;
    hide: (trigger?: string) => PromiseWithComponent<T, P>;
    toggle: () => PromiseWithComponent<T, P>;
    set: (value: Partial<P>) => PromiseWithComponent<T, P>;
    get: () => P | undefined;
    destroy: () => void;
  }

  export interface OrchestratorCreateOptions {
    keep?: boolean;
    resolveOnHide?: boolean;
  }

  export interface ComponentLike {
    render(): unknown;
  }

  export declare const BModal: ComponentLike;

  export type ModalOrchestratorParam<ComponentProps = Record<string, unknown>> =
    ComponentProps & {
      title?: string;
      body?: string;
      options?: OrchestratorCreateOptions;
      props?: Record<string, unknown>;
      slots?: {
        default?: ComponentProps | Readonly<ComponentLike>;
      };
    };

  export type ModalOrchestratorCreateParam<
    ComponentProps = Record<string, unknown>,
  > =
    | ModalOrchestratorParam<ComponentProps>
    | {
        value: ModalOrchestratorParam<ComponentProps>;
      };

  export declare const useModal: () => {
    show: (id?: ControllerKey) => void;
    hide: (trigger?: string, id?: ControllerKey) => void;
    hideAll: (trigger?: string) => void;
    current: () => {
      show(): void;
      hide(trigger?: string): void;
      modal: ComponentLike | null | undefined;
    } | null;
    create: <ComponentProps = Record<string, unknown>>(
      obj?: ModalOrchestratorCreateParam<ComponentProps>,
      options?: OrchestratorCreateOptions,
    ) => PromiseWithComponent<
      typeof BModal,
      ModalOrchestratorParam<ComponentProps>
    >;
    _isOrchestratorInstalled: {
      value: boolean;
    };
    store: {
      value: unknown[];
    };
  };
}
