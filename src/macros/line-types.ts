import type { ImmutableLine, MutableLine } from "../assembler/line.ts";
import { lineWithRenderedJavascript } from "../javascript/embedded/line-types.ts";
import type { SymbolicOperands } from "../operands/data-types.ts";
import type { Label } from "../source-code/data-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { lineWithTokens, type LineWithTokens } from "../tokens/line-types.ts";

export type LineWithProcessedMacro = Readonly<Pick<
    ImmutableLine, keyof LineWithTokens | "isRecordingMacro"
>>;

export const lineWithProcessedMacro = (
    line: LineWithTokens, isRecordingMacro: boolean
) => {
    (line as MutableLine).isRecordingMacro = isRecordingMacro;
    return line as LineWithProcessedMacro;
};

export const lineWithExpandedMacro = (
    callingLine: LineWithTokens, line: LineWithTokens,
    label: Label, symbolicOperands: SymbolicOperands
) => {
    const raw = lineWithRawSource(
        callingLine.fileName, callingLine.lineNumber, false, line.rawSource
    );
    const rendered = lineWithRenderedJavascript(
        raw, line.assemblySource
    );
    const tokenised = lineWithTokens(
        rendered, label, line.mnemonic, symbolicOperands
    );
    line.failures().forEach(tokenised.withFailure);
    return lineWithProcessedMacro(tokenised, false);
};
