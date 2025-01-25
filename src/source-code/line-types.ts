import { line, type ImmutableLine } from "../assembler/line.ts";
import { LineWithFailures } from "../failure/line-types.ts";
import type { FileName, LineNumber, SourceCode } from "./data-types.ts";

export type LineWithRawSource = Readonly<Pick<
    ImmutableLine,
    keyof LineWithFailures | "fileName" | "lineNumber" | "lastLine" | "rawSource"
>>;

export const lineWithRawSource = (
    name: FileName, number: LineNumber, isLast: boolean, source: SourceCode
) => line(name, number, isLast, source) as LineWithRawSource;
