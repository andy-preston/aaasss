import {
    type RawLine, rawLine,
    type AssemblyLine, assemblyLine, assemblyError,
    type SymbolicOperands, type TokenisedLine, tokenisedLine, tokenisedError,
    type NumericOperands, type OperandLine, operandLine, operandError,
    type Code, type CodeLine, codeLine, codeError
} from "./line";

export const nextLine = function* () {
    const fileName = "1";
    const lineNumber = 2;
    const source = "3";
    yield rawLine(fileName, lineNumber, source);
};

export const splitJavascript = (line: RawLine): AssemblyLine => {
    const splitted: string = "";
    if (splitted == "broken") {
        return assemblyError(line, ["broken"]);
    }
    return assemblyLine(line, splitted);
};

export const tokenise = (line: AssemblyLine): TokenisedLine => {
    if (line.hasErrors()) {
        return tokenisedError(line, ["yuk"]);
    }
    const mnemonic = "";
    const symbolicOperands: SymbolicOperands = ["1", "2", "3"];
    return tokenisedLine(line, mnemonic, symbolicOperands);
};

export const getOperands = (line: TokenisedLine): OperandLine => {
    if (line.hasErrors()) {
        return operandError(line, ["nasty"]);
    }
    const numericOperands: NumericOperands = [1, "symbolic", 3];
    return operandLine(line, numericOperands);
};

export const generateCode = (line: OperandLine): CodeLine => {
    if (line.hasErrors()) {
        return codeError(line, ["horrible"]);
    }
    const code: Code = [1, 2];
    return codeLine(line, code);
};
