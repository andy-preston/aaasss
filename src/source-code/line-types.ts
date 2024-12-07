import type { Failures } from "../coupling/value-failure.ts";
import type {
    FileName, LineNumber, SourceCode
} from "./data-types.ts";
import { line, type Line } from "../coupling/line.ts";

type RawProperties = "fileName" | "lineNumber" | "rawSource" |
    "failures" | "addFailures" | "failed";

export type RawLine = Readonly<Pick<Line, RawProperties>>;

export const rawLine = (
    fileName: FileName,
    lineNumber: LineNumber,
    source: SourceCode,
    failures: Failures
) => {
    const result = line(fileName, lineNumber, source) as RawLine;
    result.addFailures(failures);
    return result;
};

export type AssemblyProperties = RawProperties | "assemblySource";

export type AssemblyLine = Readonly<Pick<Line, AssemblyProperties>>;

export const assemblyLine = (
    line: RawLine,
    source: SourceCode,
    failures: Failures
): AssemblyLine => {
    (line as Line).assemblySource = source;
    line.addFailures(failures);
    return line as AssemblyLine;
};
