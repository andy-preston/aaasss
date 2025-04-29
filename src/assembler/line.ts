import type { Failure } from "../failure/bags.ts";
import type { Code } from "../object-code/data-types.ts";
import type { NumericOperands, OperandTypes, SymbolicOperands } from "../operands/data-types.ts";
import type { FileName, LineNumber, SourceCode } from "../source-code/data-types.ts";
import type { Label, Mnemonic } from "../tokens/data-types.ts";
import type { Pass } from "./data-types.ts";

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
    const failureMap = function*(): Generator<Failure, void, void> {
        yield* failures;
    };

    const withPass = (pass: Pass) => {
        passNumber = pass;
        console.log(pass, lineNumber);
        return theLine;
    };

    const isPass = (wanted: Pass) => passNumber == wanted;

    const theLine = {
        "failures": failureMap,
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

export type MutableLine = ReturnType<typeof line>;
export type ImmutableLine = Readonly<MutableLine>;
