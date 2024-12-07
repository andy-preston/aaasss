import type { Failures } from "../coupling/value-failure.ts";
import type {
    FileName, LineNumber, SourceCode
} from "./data-types.ts";
import { line, type Line } from "../line-types/0-line.ts";

export type RawProperties = "fileName" | "lineNumber" | "rawSource" |
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
