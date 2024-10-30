type SymbolicOperands =
    readonly [] |
    readonly [string] |
    readonly [string, string] |
    readonly [string, string, string];

type Numeric = number | "symbolic";
type NumericOperands =
    readonly [] |
    readonly [Numeric] |
    readonly [Numeric, Numeric] |
    readonly [Numeric, Numeric, Numeric];

type Code =
    readonly [] |
    readonly [number, number] |
    readonly [number, number, number, number];

export const line = (
    fileName: string,
    lineNumber: number,
    source: string
) => ({
    "fileName": fileName,
    "lineNumber": lineNumber,
    "rawSource": source,
    "assemblySource": "",
    "mnemonic": "",
    "symbolicOperands": [] as SymbolicOperands,
    "numericOperands": [] as NumericOperands,
    "code": [] as Code,
    "errors": [] as Array<Error>
});

type Line = ReturnType<typeof line>;

type RawProperties = "fileName" | "lineNumber" | "rawSource" | "errors";
export type RawLine = Readonly<Pick<Line, RawProperties>>;

type AssemblyProperties = RawProperties | "assemblySource";
export type AssemblyLine = Readonly<Pick<Line, AssemblyProperties>>;

export const assemblyLine = (
    line: RawLine,
    source: string
): AssemblyLine => {
    (line as Line).assemblySource = source;
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

type OperandProperties = TokenisedProperties | "numericOperands";
export type OperandLine = Readonly<Pick<Line, OperandProperties>>;

export const operandLine = (
    line: TokenisedLine,
    numeric: NumericOperands
): OperandLine => {
    (line as Line).numericOperands = numeric;
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
