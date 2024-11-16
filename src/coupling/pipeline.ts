import type {
    RawLine, AssemblyLine, TokenisedLine, OperandLine, CodeLine
} from "./line.ts";

export const pipeline = (
    assembly: (line: RawLine) => AssemblyLine,
    tokenised: (line: AssemblyLine) => TokenisedLine,
    operand: (line: TokenisedLine) => OperandLine,
    code: (line: OperandLine) => CodeLine,
    output: (line: CodeLine) => void
) => (
    raw: RawLine
) => output(code(operand(tokenised(assembly(raw)))));
