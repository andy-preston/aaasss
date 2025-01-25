import type { Failure, Failures } from "../failure/failure-or-box.ts";
import type { MacroName } from "../macros/data-types.ts";
import type { Code } from "../object-code/data-types.ts";
import type {
    NumericOperands, OperandTypes, SymbolicOperands
} from "../operands/data-types.ts";
import type {
    FileName, Label, LineNumber, Mnemonic, SourceCode
} from "../source-code/data-types.ts";

export const line = (
    fileName: FileName, lineNumber: LineNumber, lastLine: boolean,
    source: SourceCode
) => {
    const failures: Failures = [];
    const withFailure = (failure: Failure) => {
        failures.push(failure);
        return theLine;
    };
    const failed = () => failures.length > 0;
    const failureMap = function*(): Generator<Failure, void, void> {
        yield* failures;
    };

    const hasAssembly = () => theLine.assemblySource.trim() != "";

    const theLine = {
        "failures": failureMap,
        "failed": failed,
        "withFailure": withFailure,
        "fileName": fileName as FileName,
        "lineNumber": lineNumber as LineNumber,
        "lastLine": lastLine,
        "rawSource": source as SourceCode,
        "assemblySource": "" as SourceCode,
        "hasAssembly": hasAssembly,
        "label": "" as Label,
        "mnemonic": "" as Mnemonic,
        "isRecordingMacro": false,
        "macroName": "" as MacroName,
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
