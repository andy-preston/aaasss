import type { ImmutableLine, MutableLine } from "../assembler/line.ts";
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
