import type { LineWithFailures } from "../failure/line-types.ts";
import type { Line } from "../line/line-types.ts";
import type { FileName, LineNumber, SourceCode } from "./data-types.ts";

import { line } from "../line/line-types.ts";

export interface LineWithRawSource extends LineWithFailures {
    "fileName":   Line["fileName"];
    "lineNumber": Line["lineNumber"];
    "isPass":     Line["isPass"];
    "rawSource":  Line["rawSource"];
    "macroName":  Line["macroName"];
    "macroCount": Line["macroCount"];
    "lastLine":   Line["lastLine"];
};

export const lineWithRawSource = (
    name: FileName, number: LineNumber, source: SourceCode,
    macroName: string, macroCount: number, isLast: boolean
) => line(
    name, number, source, macroName, macroCount, isLast
);
