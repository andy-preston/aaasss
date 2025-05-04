import type { ImmutableLine, MutableLine } from "../assembler/line-types.ts";
import type { SymbolicOperands } from "../operands/data-types.ts";
import type { Label } from "../tokens/data-types.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";

import { operands } from "../operands/data-types.ts";

export interface LineWithProcessedMacro extends LineWithTokens {
    "isRecordingMacro": ImmutableLine["isRecordingMacro"];
};

export const lineWithProcessedMacro = (
    line: LineWithTokens, isRecordingMacro: boolean
) => {
    (line as MutableLine).isRecordingMacro = isRecordingMacro;
    return line as ImmutableLine;
};

export const lineWithRemappedMacro = (
    line: LineWithTokens, label: Label, symbolicOperands: Array<string>
) => {
    (line as MutableLine).label = label;
    (line as MutableLine).symbolicOperands =
        operands<SymbolicOperands>(symbolicOperands);
    return lineWithProcessedMacro(line, false);
};
