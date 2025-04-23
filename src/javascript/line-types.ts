import type { ImmutableLine, MutableLine } from "../assembler/line.ts";
import type { SourceCode } from "../source-code/data-types.ts";
import type { LineWithRawSource } from "../source-code/line-types.ts";

export interface LineWithRenderedJavascript extends LineWithRawSource {
    "assemblySource": ImmutableLine["assemblySource"];
    "hasAssembly":  ImmutableLine["hasAssembly"];
};

export const lineWithRenderedJavascript = (
    line: LineWithRawSource, source: SourceCode
) => {
    (line as MutableLine).assemblySource = source;
    return line as LineWithRenderedJavascript;
};
