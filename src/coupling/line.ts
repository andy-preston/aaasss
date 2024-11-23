import type { Failures } from "../value-or-failure.ts";

export type Label = string;

export type Mnemonic = string;

export type SymbolicOperand = string;

export type SymbolicOperands =
    readonly [] |
    readonly [SymbolicOperand] |
    readonly [SymbolicOperand, SymbolicOperand] |
    readonly [SymbolicOperand, SymbolicOperand, SymbolicOperand];

export type NumericOperand = number | undefined;

export type NumericOperands =
    readonly [] |
    readonly [NumericOperand] |
    readonly [NumericOperand, NumericOperand] |
    readonly [NumericOperand, NumericOperand, NumericOperand];

//type OperandLength = SymbolicOperands["length"] & NumericOperands["length"];

export type OperandIndex = 0 | 1 | 2;

export const operands = <Goal extends SymbolicOperands | NumericOperands>(
    operands: Array<
        Goal extends SymbolicOperands ? SymbolicOperand : NumericOperand
    >
) => {
    if (operands.length > 3) {
        throw Error("More than 3 operands isn't possible");
    }
    return operands as unknown as Goal;
}

export type Code =
    readonly [] |
    readonly [number, number] |
    readonly [number, number, number, number];

// type CodeLength = Code["length"];

export type FileName = string;
export type LineNumber = number;
export type SourceCode = string;

const line = (
    fileName: FileName,
    lineNumber: LineNumber,
    source: SourceCode
) => {
    const failures: Failures = [];
    const addFailures = (additional: Failures) => {
        failures.push(...additional);
    };
    const failed = () => failures.length > 0;
    return {
        "failures": failures,
        "failed": failed,
        "addFailures": addFailures,
        "fileName": fileName as FileName,
        "lineNumber": lineNumber as LineNumber,
        "rawSource": source as SourceCode,
        "assemblySource": "" as SourceCode,
        "label": "" as Label,
        "mnemonic": "" as Mnemonic,
        "symbolicOperands": [] as SymbolicOperands,
        "numericOperands": [] as NumericOperands,
        "code": [] as Code,
    };
};

type Line = ReturnType<typeof line>;

type RawProperties = "fileName" | "lineNumber" | "rawSource" |
    "failures" | "addFailures" | "failed";

export type RawLine = Readonly<Pick<Line, RawProperties>>;

export const rawLine = (
    fileName: FileName,
    lineNumber: LineNumber,
    source: SourceCode,
    failures: Failures
) => {
    const result = line(fileName, lineNumber, source) as RawLine;
    result.addFailures(failures);
    return result;
};

type AssemblyProperties = RawProperties | "assemblySource";

export type AssemblyLine = Readonly<Pick<Line, AssemblyProperties>>;

export const assemblyLine = (
    line: RawLine,
    source: SourceCode,
    failures: Failures
): AssemblyLine => {
    (line as Line).assemblySource = source;
    line.addFailures(failures);
    return line as AssemblyLine;
};

type TokenisedProperties = AssemblyProperties |
    "label" | "mnemonic" | "symbolicOperands";

export type TokenisedLine = Readonly<Pick<Line, TokenisedProperties>>;

export const tokenisedLine = (
    line: AssemblyLine,
    label: Label,
    mnemonic: Mnemonic,
    symbolicOperands: SymbolicOperands,
    failures: Failures
): TokenisedLine => {
    (line as Line).label = label;
    (line as Line).mnemonic = mnemonic;
    (line as Line).symbolicOperands = symbolicOperands;
    line.addFailures(failures);
    return line as TokenisedLine;
};

type CodeProperties = TokenisedProperties | "numericOperands" | "code";

export type CodeLine = Readonly<Pick<Line, CodeProperties>>;

export const codeLine = (
    line: TokenisedLine,
    numeric: NumericOperands,
    code: Code,
    failures: Failures
): CodeLine => {
    (line as Line).numericOperands = numeric;
    (line as Line).code = code;
    line.addFailures(failures);
    return line as CodeLine;
};
