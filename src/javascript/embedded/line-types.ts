import type { ImmutableLine, MutableLine } from "../../assembler/line.ts";
import type { SourceCode } from "../../source-code/data-types.ts";
import type { LineWithRawSource } from "../../source-code/line-types.ts";

export type LineWithRenderedJavascript = Readonly<Pick<
    ImmutableLine, keyof LineWithRawSource | "assemblySource" | "hasAssembly"
>>;

export const lineWithRenderedJavascript = (
    line: LineWithRawSource, source: SourceCode
) => {
    (line as MutableLine).assemblySource = source;
    return line as LineWithRenderedJavascript;
};
