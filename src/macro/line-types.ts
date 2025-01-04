import { lineWithRenderedJavascript } from "../embedded-js/line-types.ts";
import { lineWithObjectCode } from "../object-code/line-types.ts";
import type { SymbolicOperands } from "../operands/data-types.ts";
import type { Line } from "../pipeline/line.ts";
import {
    lineWithAddress, lineWithPokedBytes
} from "../program-memory/line-types.ts";
import type { Label } from "../source-code/data-types.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { lineWithTokens, type LineWithTokens } from "../tokens/line-types.ts";

export type LineWithProcessedMacro = Readonly<
    Pick<Line, keyof LineWithTokens | "macroName">
>;

export const lineWithProcessedMacro = (
    line: LineWithTokens, macroName: string
) => {
    (line as Line).macroName = macroName;
    return line as LineWithProcessedMacro;
};

export const lineWithExpandedMacro = (
    callingLine: LineWithTokens,
    line: LineWithTokens, label: Label, symbolicOperands: SymbolicOperands
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
    return lineWithProcessedMacro(tokenised, "");
};

export const lineWithNoObjectCode = (line: LineWithProcessedMacro) => {
    const addressed = lineWithAddress(line, 0);
    const poked = lineWithPokedBytes(addressed, []);
    return lineWithObjectCode(poked, [], []);
};
