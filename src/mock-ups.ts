import {
    type AssemblyLine,
    type SymbolicOperands, type TokenisedLine, tokenisedLine, tokenisedFailure,
    type NumericOperands, type OperandLine, operandLine, operandFailure,
    type Code, type CodeLine, codeLine, codeFailure,
    failure
} from "./source-files/line.ts";

export const tokenise = (line: AssemblyLine): TokenisedLine => {
    if (line.failed()) {
        return tokenisedFailure(line, failure(undefined, "mockUp", ""));
    }
    const mnemonic = "";
    const symbolicOperands: SymbolicOperands = ["1", "2", "3"];
    return tokenisedLine(line, mnemonic, symbolicOperands);
};

export const getOperands = (line: TokenisedLine): OperandLine => {
    if (line.failed()) {
        return operandFailure(line, failure(2, "outOfRange", ""));
    }
    const numericOperands: NumericOperands = [1, "symbolic", 3];
    return operandLine(line, numericOperands);
};

export const generateCode = (line: OperandLine): CodeLine => {
    if (line.failed()) {
        return codeFailure(line, failure(3, "outOfRange", ""));
    }
    const code: Code = [1, 2];
    return codeLine(line, code);
};
