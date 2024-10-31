export type SymbolicOperands =
    readonly [] |
    readonly [string] |
    readonly [string, string] |
    readonly [string, string, string];

type Numeric = number | "symbolic";
export type NumericOperands =
    readonly [] |
    readonly [Numeric] |
    readonly [Numeric, Numeric] |
    readonly [Numeric, Numeric, Numeric];

export type OperandIndex = 0 | 1 | 2;

export type FailureKind = "js" | "outOfRange" | "mockUp";

export const failure = (
    operand: OperandIndex | undefined,
    kind: FailureKind,
    exceptionMessage: string
) => ({
    "operand": operand,
    "kind": kind,
    "exceptionMessage": exceptionMessage
});

type Failure = Readonly<ReturnType<typeof failure>>;

export type Code =
    readonly [] |
    readonly [number, number] |
    readonly [number, number, number, number];

export type FileName = string;
export type LineNumber = number;
export type SourceCode = string;

const line = (
    fileName: FileName,
    lineNumber: LineNumber,
    source: SourceCode
) => {
    const failures: Array<Failure> = [];
    const addFailure = (failure: Failure) => {
        failures.push(failure);
    };
    const failed = () => failures.length > 0;
    return {
        "failures": failures,
        "failed": failed,
        "addFailure": addFailure,
        "fileName": fileName,
        "lineNumber": lineNumber,
        "rawSource": source,
        "assemblySource": "",
        "mnemonic": "",
        "symbolicOperands": [] as SymbolicOperands,
        "numericOperands": [] as NumericOperands,
        "code": [] as Code
    };
};

type Line = ReturnType<typeof line>;

type RawProperties = "fileName" | "lineNumber" | "rawSource" |
    "failures" | "addFailure" | "failed";
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

export const assemblyFailure = (
    line: RawLine,
    failure: Failure
): AssemblyLine => {
    line.addFailure(failure);
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

export const tokenisedFailure = (
    line: AssemblyLine,
    failure: Failure
): TokenisedLine => {
    line.addFailure(failure);
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

export const operandFailure = (
    line: TokenisedLine,
    failure: Failure
): OperandLine => {
    line.addFailure(failure);
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

export const codeFailure = (
    line: OperandLine,
    failure: Failure
): CodeLine => {
    line.addFailure(failure);
    return line as CodeLine;
};
