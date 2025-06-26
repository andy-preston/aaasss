import type { Failure } from "../failure/bags.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";
import type { Conversion, OperandType } from "./data-types.ts";

type ScalerFunction = (value: number) => number | Failure;
export type Scaler = ScalerFunction | undefined;

export const scale = (programMemory: ProgramMemory) => {
    const scalers: Record<OperandType, Scaler> = {
        "register":            undefined,
        "registerPair":        value => (value - 24) / 2,
        "anyRegisterPair":     value => value / 2,
        "registerImmediate":   value => value - 16,
        "registerMultiply":    value => value - 16,
        "onlyZ":               undefined,
        "optionalZ+":          undefined,
        "ZorZ+":               undefined,
        "indexWithOffset":     undefined,
        "indexIndirect":       undefined,
        "nybble":              undefined,
        "6BitNumber":          undefined,
        "6BitOffset":          undefined,
        "byte":                undefined,
        "invertedByte":        value => 0xff - value,
        "bitIndex":            undefined,
        "ioPort":              value => value - 0x20,
        "16BitDataAddress":    undefined,
        "7BitDataAddress":     undefined,
        "22BitProgramAddress": value => programMemory.absoluteAddress(value, 22),
        "12BitRelative":       value => programMemory.relativeAddress(value, 12),
        "7BitRelative":        value => programMemory.relativeAddress(value, 7)
    };

    const conversion = (
        value: number, operandType: OperandType
    ) => {
        const scaler = scalers[operandType];
        return scaler == undefined ? value : scaler(value);
    };

    return conversion as Conversion;
};
