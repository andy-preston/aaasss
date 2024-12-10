import type { Line } from "../coupling/line.ts";
import type { Failures } from "../coupling/value-failure.ts";
import { lineWithObjectCode } from "../object-code/line-types.ts";
import type { SymbolicOperands } from "../operands/data-types.ts";
import {
    lineWithAddress, lineWithPokedBytes
} from "../program-memory/line-types.ts";
import type { Label } from "../source-code/data-types.ts";
import {
    lineWithRawSource, lineWithRenderedJavascript
} from "../source-code/line-types.ts";
import {
    lineWithTokens, type LineWithTokens, type PropertiesForTokens
} from "../tokenise/line-types.ts";

export type PropertiesForMacroProcessing = PropertiesForTokens | "macroName";

export type LineWithProcessedMacro
    = Readonly<Pick<Line, PropertiesForMacroProcessing>>;

export const lineWithProcessedMacro = (
    line: LineWithTokens, macroName: string, failures: Failures
) => {
    (line as Line).macroName = macroName;
    line.addFailures(failures);
    return line as LineWithProcessedMacro;
};

export const lineWithExpandedMacro = (
    callingLine: LineWithTokens,
    line: LineWithTokens, label: Label, symbolicOperands: SymbolicOperands,
    failures: Failures
) => {
    const raw = lineWithRawSource(
        callingLine.fileName, callingLine.lineNumber,
        line.rawSource, Array.from(line.failures)
    );
    const rendered = lineWithRenderedJavascript(
        raw, line.assemblySource, []
    );
    const tokenised = lineWithTokens(
        rendered, label, line.mnemonic, symbolicOperands, failures
    );
    return lineWithProcessedMacro(tokenised, "", []);
};

export const lineWithNoObjectCode = (line: LineWithProcessedMacro) => {
    const addressed = lineWithAddress(line, 0, []);
    const poked = lineWithPokedBytes(addressed, [], []);
    return lineWithObjectCode(poked, [], [], []);
};
