/* eslint-disable @typescript-eslint/no-namespace */

import type { Linter } from './Linter';

export namespace Processor {
  export interface ProcessorMeta {
    /**
     * The unique name of the processor.
     */
    name: string;
    /**
     * The a string identifying the version of the processor.
     */
    version?: string;
  }

  export type PreProcess = (
    text: string,
    filename: string,
  ) => (string | { text: string; filename: string })[];

  export type PostProcess = (
    messagesList: Linter.LintMessage[][],
    filename: string,
  ) => Linter.LintMessage[];

  export interface ProcessorModule {
    /**
     * Information about the processor to uniquely identify it when serializing.
     */
    meta?: ProcessorMeta;

    /**
     * The function to extract code blocks.
     */
    preprocess?: PreProcess;

    /**
     * The function to merge messages.
     */
    postprocess?: PostProcess;

    /**
     * If `true` then it means the processor supports autofix.
     */
    supportsAutofix?: boolean;
  }

  /**
   * A loose definition of the ParserModule type for use with configs
   * This type intended to relax validation of configs so that parsers that have
   * different AST types or scope managers can still be passed to configs
   *
   * @see {@link LooseRuleDefinition}, {@link LooseParserModule}
   */
  export interface LooseProcessorModule {
    /**
     * Information about the processor to uniquely identify it when serializing.
     */
    meta?: { [K in keyof ProcessorMeta]?: ProcessorMeta[K] | undefined };

    /**
     * The function to extract code blocks.
     */
    /*
    eslint-disable-next-line @typescript-eslint/no-explicit-any --
    intentionally using `any` to allow bi-directional assignment (unknown and
    never only allow unidirectional)
    */
    preprocess?: (text: string, filename: string) => any;

    /**
     * The function to merge messages.
     */
    /*
    eslint-disable-next-line @typescript-eslint/no-explicit-any --
    intentionally using `any` to allow bi-directional assignment (unknown and
    never only allow unidirectional)
    */
    postprocess?: (messagesList: any, filename: string) => any;

    /**
     * If `true` then it means the processor supports autofix.
     */
    supportsAutofix?: boolean | undefined;
  }
}
