import { line, type Line } from "../pipeline/line.ts";
import type { FileName, LineNumber, SourceCode } from "./data-types.ts";

export type PropertiesForRawSource = "fileName" | "lineNumber" | "lastLine" |
    "rawSource" | "failures" | "addFailures" | "failed";

export type LineWithRawSource = Readonly<Pick<Line, PropertiesForRawSource>>;

export const lineWithRawSource = (
    name: FileName, number: LineNumber, isLast: boolean, source: SourceCode
) => line(name, number, isLast, source) as LineWithRawSource;
