import type { NumberOrFailures } from "../failure/bags.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";
import type { OperandType } from "./data-types.ts";

import { numberBag } from "../assembler/bags.ts";

type Scaler = (value: number) => NumberOrFailures

export const scaler = (programMemory: ProgramMemory) => {
    const scalers: Record<OperandType, Scaler | undefined> = {
        "register":            undefined,
        "registerPair":        value => numberBag((value - 24) / 2),
        "registerImmediate":   value => numberBag(value - 16),
        "registerMultiply":    value => numberBag(value - 16),
        "onlyZ":               undefined,
        "optionalZ+":          undefined,
        "ZorZ+":               undefined,
        "nybble":              undefined,
        "6BitNumber":          undefined,
        "byte":                undefined,
        "invertedByte":        value => numberBag(0xff - value),
        "bitIndex":            undefined,
        "ioPort":              value => numberBag(value - 0x20),
        "16BitDataAddress":    undefined,
        "7BitDataAddress":     undefined,
        "22BitProgramAddress": value => programMemory.absoluteAddress(value, 22),
        "12BitRelative":       value => programMemory.relativeAddress(value, 12),
        "7BitRelative":        value => programMemory.relativeAddress(value, 7)
    };
    return (value: number, operandType: OperandType) => {
        const scaler = scalers[operandType];
        return scaler == undefined ? numberBag(value) : scaler(value);
    };
};
