import { line, type ImmutableLine } from "../assembler/line.ts";
import { LineWithFailures } from "../failure/line-types.ts";
import type { FileName, LineNumber, SourceCode } from "./data-types.ts";

export type LineWithRawSource = Readonly<Pick<
    ImmutableLine,
    keyof LineWithFailures | "fileName" | "lineNumber" | "rawSource"
        | "macroName" | "macroCount" | "lastLine"
>>;

export const lineWithRawSource = (
    name: FileName, number: LineNumber, source: SourceCode,
    macroName: string, macroCount: number, isLast: boolean
) => line(
    name, number, source, macroName, macroCount, isLast
) as LineWithRawSource;
