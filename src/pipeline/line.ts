import type { Failure, Failures } from "../failure/failures.ts";
import { Code } from "../object-code/data-types.ts";
import type {
    NumericOperands, SymbolicOperands
} from "../operands/data-types.ts";
import type {
    FileName, Label, LineNumber, Mnemonic, SourceCode
} from "../source-code/data-types.ts";

type FailureMapper = (failure: Failure, index: number) => void;

export const line = (
    fileName: FileName, lineNumber: LineNumber, lastLine: boolean,
    source: SourceCode
) => {
    const failures: Failures = [];
    const addFailures = (additional: Failures) => {
        failures.push(...additional);
    };
    const failed = () => failures.length > 0;
    const mapFailures = function*(): Generator<Failure, void, void> {
        yield* failures;
    };
    return {
        "failures": mapFailures,
        "failed": failed,
        "addFailures": addFailures,
        "fileName": fileName as FileName,
        "lineNumber": lineNumber as LineNumber,
        "lastLine": lastLine,
        "rawSource": source as SourceCode,
        "assemblySource": "" as SourceCode,
        "label": "" as Label,
        "mnemonic": "" as Mnemonic,
        "symbolicOperands": [] as SymbolicOperands,
        "macroName": "" as string,
        "numericOperands": [] as NumericOperands,
        "address": 0,
        "code": [] as Array<Code>,
    };
};

export type Line = ReturnType<typeof line>;
