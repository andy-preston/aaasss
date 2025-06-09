export type SymbolicOperand = string;
export type SymbolicOperands = Array<SymbolicOperand>;

export type OperandType =
    "register" | "anyRegisterPair" | "registerPair" |
    "registerImmediate" | "registerMultiply" |
    "onlyZ" | "optionalZ+" | "ZorZ+" |
    "nybble" | "6BitNumber" | "byte" | "invertedByte" | "bitIndex" |
    "ioPort" | "16BitDataAddress" | "7BitDataAddress" |
    "22BitProgramAddress" | "12BitRelative" | "7BitRelative";

export type InstructionOperands = Record<string, OperandType>;
