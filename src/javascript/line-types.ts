import type { ImmutableLine, MutableLine } from "../line/line-types.ts";
import type { SourceCode } from "../source-code/data-types.ts";
import type { LineWithRawSource } from "../source-code/line-types.ts";

export interface LineWithRenderedJavascript extends LineWithRawSource {
    "assemblySource": ImmutableLine["assemblySource"];
};

export const lineWithRenderedJavascript = (
    line: LineWithRawSource, source: SourceCode
) => {
    (line as MutableLine).assemblySource = source;
    return line as ImmutableLine;
};
