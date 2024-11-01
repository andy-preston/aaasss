import type { Failures } from "../failure.ts";

export type Mnemonic = string;

export type SymbolicOperand = string;

export type SymbolicOperands =
    readonly [] |
    readonly [SymbolicOperand] |
    readonly [SymbolicOperand, SymbolicOperand] |
    readonly [SymbolicOperand, SymbolicOperand, SymbolicOperand];

type NumericOperand = number | "symbolic";
export type NumericOperands =
    readonly [] |
    readonly [NumericOperand] |
    readonly [NumericOperand, NumericOperand] |
    readonly [NumericOperand, NumericOperand, NumericOperand];

type OperandLength = SymbolicOperands['length'] & NumericOperands['length'];

export type OperandIndex = 0 | 1 | 2;

export type Code =
    readonly [] |
    readonly [number, number] |
    readonly [number, number, number, number];

type CodeLength = Code['length'];

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
        failures.concat(additional);
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
        "mnemonic": "" as Mnemonic,
        "symbolicOperands": [] as SymbolicOperands,
        "numericOperands": [] as NumericOperands,
        "code": [] as Code
    };
};

type Line = ReturnType<typeof line>;

type RawProperties = "fileName" | "lineNumber" | "rawSource" |
    "failures" | "addFailures" | "failed";
export type RawLine = Readonly<Pick<Line, RawProperties>>;

export const rawLine = (
    fileName: FileName,
    lineNumber: LineNumber,
    source: SourceCode
) => line(fileName, lineNumber, source) as RawLine;

type AssemblyProperties = RawProperties | "assemblySource";
export type AssemblyLine = Readonly<Pick<Line, AssemblyProperties>>;

export const assemblyLine = (
    line: RawLine,
    source: SourceCode
): AssemblyLine => {
    (line as Line).assemblySource = source;
    return line as AssemblyLine;
};

export const assemblyFailures = (
    line: RawLine,
    failures: Failures
): AssemblyLine => {
    line.addFailures(failures);
    return line as AssemblyLine;
};

type TokenisedProperties = AssemblyProperties | "mnemonic" | "symbolicOperands";
export type TokenisedLine = Readonly<Pick<Line, TokenisedProperties>>;

export const tokenisedLine = (
    line: AssemblyLine,
    mnemonic: string,
    symbolicOperands: SymbolicOperands
): TokenisedLine => {
    (line as Line).mnemonic = mnemonic;
    (line as Line).symbolicOperands = symbolicOperands;
    return line as TokenisedLine;
};

export const tokenisedFailures = (
    line: AssemblyLine,
    failures: Failures
): TokenisedLine => {
    line.addFailures(failures);
    return line as TokenisedLine;
};

type OperandProperties = TokenisedProperties | "numericOperands";
export type OperandLine = Readonly<Pick<Line, OperandProperties>>;

export const operandLine = (
    line: TokenisedLine,
    numeric: NumericOperands
): OperandLine => {
    (line as Line).numericOperands = numeric;
    return line as OperandLine;
};

export const operandFailures = (
    line: TokenisedLine,
    failures: Failures
): OperandLine => {
    line.addFailures(failures);
    return line as OperandLine;
};

type CodeProperties = OperandProperties | "code";
export type CodeLine = Readonly<Pick<Line, CodeProperties>>;

export const codeLine = (
    line: OperandLine,
    code: Code
): CodeLine => {
    (line as Line).code = code;
    return line as CodeLine;
};

export const codeFailures = (
    line: OperandLine,
    failures: Failures
): CodeLine => {
    line.addFailures(failures);
    return line as CodeLine;
};
