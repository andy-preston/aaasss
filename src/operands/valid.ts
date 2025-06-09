import type { NumberOrFailures } from "../failure/bags.ts";
import type { NumericType } from "../numeric-values/types.ts";
import type { OperandType } from "./data-types.ts";

import { validNumeric } from "../numeric-values/valid.ts";

const numericTypes: Record<OperandType, NumericType | undefined> = {
    "register":            "type_register",
    "registerPair":        "type_registerPair",
    "anyRegisterPair":     "type_anyRegisterPair",
    "registerImmediate":   "type_registerImmediate",
    "registerMultiply":    "type_registerMultiply",
    "onlyZ":               undefined,
    "optionalZ+":          undefined,
    "ZorZ+":               undefined,
    "nybble":              "type_nybble",
    "6BitNumber":          "type_6Bit",
    "byte":                "type_byte",
    "invertedByte":        "type_byte",
    "bitIndex":            "type_bitIndex",
    "ioPort":              "type_ioPort",
    "16BitDataAddress":    "type_word",
    "7BitDataAddress":     "type_7Bit",
    "22BitProgramAddress": "type_positive",
    "7BitRelative":        "type_positive",
    "12BitRelative":       "type_positive"
};

export const valid = (
    value: number, operandType: OperandType
): NumberOrFailures => validNumeric(value, numericTypes[operandType]);
