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

    const withFailures = (moreFailures: Array<Failure>) => {
        moreFailures.forEach(failure => failures.push(failure));
        return theLine;
    };
    const failed = () => failures.length > 0;

    const theLine = {
        "failures": failures,
        "failed": failed,
        "withFailures": withFailures,
        "pass": 0 as Pass,
        "fileName": fileName as FileName,
        "lineNumber": lineNumber as LineNumber,
        "lastLine": lastLine,
        "rawSource": source as SourceCode,
        "assemblySource": "" as SourceCode,
        "label": "" as Label,
        "mnemonic": "" as Mnemonic,
        "isDefiningMacro": false,
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

export const dummyLine = (last: boolean, pass: Pass) => {
    const $line = line("", 0, "", "", 0, last);
    $line.pass = pass;
    return $line;
};
