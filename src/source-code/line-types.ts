import type { Failures } from "../failure/failures.ts";
import { line, type Line } from "../pipeline/line.ts";
import type { FileName, LineNumber, SourceCode } from "./data-types.ts";

type PropertiesForRawSource = "fileName" | "lineNumber" | "lastLine" |
    "rawSource" | "failures" | "addFailures" | "failed";

export type LineWithRawSource = Readonly<Pick<Line, PropertiesForRawSource>>;

export const lineWithRawSource = (
    fileName: FileName, lineNumber: LineNumber, lastLine: boolean,
    source: SourceCode, failures: Failures
) => {
    const result = line(
        fileName, lineNumber, lastLine, source
    ) as LineWithRawSource;
    result.addFailures(failures);
    return result;
};

export type PropertiesForRenderedJavascript
    = PropertiesForRawSource | "assemblySource";

export type LineWithRenderedJavascript
    = Readonly<Pick<Line, PropertiesForRenderedJavascript>>;

export const lineWithRenderedJavascript = (
    line: LineWithRawSource, source: SourceCode, failures: Failures
) => {
    (line as Line).assemblySource = source;
    line.addFailures(failures);
    return line as LineWithRenderedJavascript;
};
