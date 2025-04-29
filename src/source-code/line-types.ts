import type { ImmutableLine } from "../assembler/line.ts";
import type { LineWithFailures } from "../failure/line-types.ts";
import type { FileName, LineNumber, SourceCode } from "./data-types.ts";

import { line } from "../assembler/line.ts";

export interface LineWithRawSource extends LineWithFailures {
    "fileName": ImmutableLine["fileName"];
    "lineNumber": ImmutableLine["lineNumber"];
    "isPass": ImmutableLine["isPass"];
    "rawSource": ImmutableLine["rawSource"];
    "macroName": ImmutableLine["macroName"];
    "macroCount": ImmutableLine["macroCount"];
    "lastLine": ImmutableLine["lastLine"];
};

export const lineWithRawSource = (
    name: FileName, number: LineNumber, source: SourceCode,
    macroName: string, macroCount: number, isLast: boolean
) => line(
    name, number, source, macroName, macroCount, isLast
) as ImmutableLine;
