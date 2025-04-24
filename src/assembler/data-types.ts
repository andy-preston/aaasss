import type { LineWithRawSource } from "../source-code/line-types.ts";

export type AssemblyPipelineSource = () =>
    Generator<LineWithRawSource, void, never>;

