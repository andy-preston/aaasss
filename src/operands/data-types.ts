export type Operand = string;
export type Operands = Array<Operand>;

export type OperandType =
    "register" | "anyRegisterPair" | "registerPair" |
    "registerImmediate" | "registerMultiply" |
    "onlyZ" | "optionalZ+" | "ZorZ+" |
    "nybble" | "6BitNumber" | "byte" | "invertedByte" | "bitIndex" |
    "ioPort" | "16BitDataAddress" | "7BitDataAddress" |
    "22BitProgramAddress" | "12BitRelative" | "7BitRelative";

export type InstructionOperands = Record<string, OperandType>;
