import type { ImmutableLine, MutableLine } from "../assembler/line.ts";
import type { SymbolicOperands } from "../operands/data-types.ts";
import { operands } from "../operands/data-types.ts";
import type { Label } from "../tokens/data-types.ts";
import type { LineWithTokens } from "../tokens/line-types.ts";

export type LineWithProcessedMacro = Readonly<Pick<
    ImmutableLine, keyof LineWithTokens | "isRecordingMacro"
>>;

export const lineWithProcessedMacro = (
    line: LineWithTokens, isRecordingMacro: boolean
) => {
    (line as MutableLine).isRecordingMacro = isRecordingMacro;
    return line as LineWithProcessedMacro;
};

export const lineWithRemappedMacro = (
    line: LineWithProcessedMacro,
    label: Label, symbolicOperands: Array<string>
) => {
    (line as MutableLine).label = label;
    (line as MutableLine).symbolicOperands =
        operands<SymbolicOperands>(symbolicOperands);
    return line as LineWithProcessedMacro;
};
