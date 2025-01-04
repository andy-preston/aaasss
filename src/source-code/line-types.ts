import { LineWithFailures } from "../failure/line-types.ts";
import { line, type Line } from "../pipeline/line.ts";
import type { FileName, LineNumber, SourceCode } from "./data-types.ts";

export type LineWithRawSource = Readonly<
    Pick<
        Line,
        keyof LineWithFailures | "fileName" | "lineNumber" | "lastLine" | "rawSource"
    >
>;

export const lineWithRawSource = (
    name: FileName, number: LineNumber, isLast: boolean, source: SourceCode
) => line(name, number, isLast, source) as LineWithRawSource;
