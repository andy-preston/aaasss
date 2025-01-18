import type { Line } from "../../assembler/line.ts";
import type { SourceCode } from "../../source-code/data-types.ts";
import type { LineWithRawSource } from "../../source-code/line-types.ts";

export type LineWithRenderedJavascript = Readonly<Pick<
    Line, keyof LineWithRawSource | "assemblySource" | "hasAssembly"
>>;

export const lineWithRenderedJavascript = (
    line: LineWithRawSource, source: SourceCode
) => {
    (line as Line).assemblySource = source;
    return line as LineWithRenderedJavascript;
};
