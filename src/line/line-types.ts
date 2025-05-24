import type { Pass } from "../assembler/data-types.ts";
import type { Failure } from "../failure/bags.ts";
import type { Code } from "../object-code/data-types.ts";
import type { NumericOperands, OperandTypes, SymbolicOperands } from "../operands/data-types.ts";
import type { FileName, LineNumber, SourceCode } from "../source-code/data-types.ts";
import type { Label, Mnemonic } from "../tokens/data-types.ts";

export const line = (
    fileName: FileName, lineNumber: LineNumber, source: SourceCode,
    macroName: string, macroCount: number, lastLine: boolean,
) => {
    const failures: Array<Failure> = [];
    let passNumber: Pass;

    const withFailures = (moreFailures: Array<Failure>) => {
        moreFailures.forEach(failure => failures.push(failure));
        return theLine;
    };
    const failed = () => failures.length > 0;

    const withPass = (pass: Pass) => {
        passNumber = pass;
        return theLine;
    };

    const isPass = (wanted: Pass) => passNumber == wanted;

    const theLine = {
        "failures": failures,
        "failed": failed,
        "withFailures": withFailures,
        "withPass": withPass,
        "isPass": isPass,
        "fileName": fileName as FileName,
        "lineNumber": lineNumber as LineNumber,
        "lastLine": lastLine,
        "rawSource": source as SourceCode,
        "assemblySource": "" as SourceCode,
        "label": "" as Label,
        "mnemonic": "" as Mnemonic,
        "isRecordingMacro": false,
        "macroName": macroName,
        "macroCount": macroCount,
        "symbolicOperands": [] as SymbolicOperands,
        "numericOperands": [] as NumericOperands,
        "operandTypes": [] as OperandTypes,
        "address": 0,
        "code": [] as Array<Code>
    };
    return theLine;
};

export type Line = ReturnType<typeof line>;

export const dummyLine = (last: boolean) => line("", 0, "", "", 0, last);
