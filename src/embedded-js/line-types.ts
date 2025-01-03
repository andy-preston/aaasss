import type { Line } from "../pipeline/line.ts";
import type { SourceCode } from "../source-code/data-types.ts";
import type {
    LineWithRawSource, PropertiesForRawSource
} from "../source-code/line-types.ts";

export type PropertiesForRenderedJavascript
    = PropertiesForRawSource | "assemblySource";

export type LineWithRenderedJavascript
    = Readonly<Pick<Line, PropertiesForRenderedJavascript>>;

export const lineWithRenderedJavascript = (
    line: LineWithRawSource, source: SourceCode
) => {
    (line as Line).assemblySource = source;
    return line as LineWithRenderedJavascript;
};
