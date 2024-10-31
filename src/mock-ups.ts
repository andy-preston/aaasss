import {
    type RawLine, rawLine,
    type AssemblyLine, assemblyLine, assemblyFailure,
    type SymbolicOperands, type TokenisedLine, tokenisedLine, tokenisedFailure,
    type NumericOperands, type OperandLine, operandLine, operandFailure,
    type Code, type CodeLine, codeLine, codeFailure,
    failure
} from "./line.ts";

export const nextLine = function* () {
    const fileName = "1";
    const lineNumber = 2;
    const source = "3";
    yield rawLine(fileName, lineNumber, source);
};

export const splitJavascript = (line: RawLine): AssemblyLine => {
    var splitted: string = "";
    try {
        splitted = "I've been splitted!";
    }
    catch (error) {
        if (error instanceof Error) {
            return assemblyFailure(
                line,
                failure(undefined, "js", error.message)
            );
        }
    }
    return assemblyLine(line, splitted);
};

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
