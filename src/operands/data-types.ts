import { Failure } from "../failure/bags.ts";

export type Operand = string;
export type Operands = Array<Operand>;

export type StringConversion = (
    operand: string, operandType: OperandType
) => number | Failure;

export type NumberConversion = (
    operand: number, operandType: OperandType
) => number | Failure;

export type Conversion = (
    operand: number | string, operandType: OperandType
) => number | Failure;

export type OperandType =
    "directiveDummy" |
    "register" | "anyRegisterPair" | "registerPair" |
    "registerImmediate" | "registerMultiply" |
    "onlyZ" | "optionalZ+" | "ZorZ+" | "indexIndirect" |
    "indexWithOffset" | "6BitOffset" |
    "nybble" | "6BitNumber" | "byte" | "invertedByte" | "bitIndex" |
    "ioPort" | "16BitDataAddress" | "7BitDataAddress" |
    "22BitProgramAddress" | "12BitRelative" | "7BitRelative";

export type InstructionOperands = Record<string, OperandType>;
