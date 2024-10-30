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

export type Code =
    readonly [] |
    readonly [number, number] |
    readonly [number, number, number, number];

const line = (
    fileName: string,
    lineNumber: number,
    source: string
) => {
    const errorCodes = [] as Array<string>;
    return {
        "errorCodes": errorCodes,
        "hasErrors": () => errorCodes.length > 0,
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
    "errorCodes" | "hasErrors";
export type RawLine = Readonly<Pick<Line, RawProperties>>;

export const rawLine = (
    fileName: string,
    lineNumber: number,
    source: string
) => line(fileName, lineNumber, source) as RawLine;

type AssemblyProperties = RawProperties | "assemblySource";
export type AssemblyLine = Readonly<Pick<Line, AssemblyProperties>>;

export const assemblyLine = (
    line: RawLine,
    source: string
): AssemblyLine => {
    (line as Line).assemblySource = source;
    return line as AssemblyLine;
};

export const assemblyError = (
    line: RawLine,
    errorCodes: Array<string>
): AssemblyLine => {
    line.errorCodes.concat(errorCodes);
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

export const tokenisedError = (
    line: AssemblyLine,
    errorCodes: Array<string>
): TokenisedLine => {
    line.errorCodes.concat(errorCodes);
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

export const operandError = (
    line: TokenisedLine,
    errorCodes: Array<string>
): OperandLine => {
    line.errorCodes.concat(errorCodes);
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

export const codeError = (
    line: OperandLine,
    errorCodes: Array<string>
): CodeLine => {
    line.errorCodes.concat(errorCodes);
    return line as CodeLine;
};

export const pipeline = (
    assembly: (line: RawLine) => AssemblyLine,
    tokenised: (line: AssemblyLine) => TokenisedLine,
    operand: (line: TokenisedLine) => OperandLine,
    code: (line: OperandLine) => CodeLine
) => (
    raw: RawLine
) => code(operand(tokenised(assembly(raw))));
