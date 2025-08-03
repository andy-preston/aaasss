import type { AllowedValues, Min, Max } from "../assembler/data-types.ts";
import type { Failure } from "../failure/failures.ts";
import type { OperandType } from "./data-types.ts";

import { assertionFailure } from "../failure/failures.ts";

const limits: Record<
    OperandType,           [      Min,       Max, AllowedValues           ]
> = {
    "directiveDummy":      [undefined, undefined, undefined               ],
    "register":            [        0,        31, undefined               ],
    "registerPair":        [undefined, undefined, [        24, 26, 28, 30]],
    "anyRegisterPair":     [undefined, undefined, [ 0,  2,  4,  6, 8,
                                                   10, 12, 14, 16, 18,
                                                   20, 22, 24, 26, 28, 30]],
    "registerImmediate":   [       16,        31, undefined               ],
    "registerMultiply":    [       16,        23, undefined               ],
    "onlyZ":               [undefined, undefined, undefined               ],
    "optionalZ+":          [undefined, undefined, undefined               ],
    "ZorZ+":               [undefined, undefined, undefined               ],
    "indexWithOffset":     [undefined, undefined, undefined               ],
    "indexIndirect":       [undefined, undefined, undefined               ],
    "nybble":              [        0,      0x0f, undefined               ],
    "6BitNumber":          [        0,  0b111111, undefined               ],
    "6BitOffset":          [        0,  0b111111, undefined               ],
    "byte":                [        0,      0xff, undefined               ],
    "invertedByte":        [        0,      0xff, undefined               ],
    "bitIndex":            [        0,         7, undefined               ],
    "ioPort":              [     0x20,      0x5f, undefined               ],
    "16BitDataAddress":    [        0,    0xffff, undefined               ],
    "7BitDataAddress":     [        0, 0b1111111, undefined               ],
    "22BitProgramAddress": [        0, undefined, undefined               ],
    "7BitRelative":        [        0, undefined, undefined               ],
    "12BitRelative":       [        0, undefined, undefined               ],
};

export const range = (
    given: number, operandType: OperandType
): Failure | number => {
    const [min, max, specificValues] = limits[operandType];
    const reasons: Array<string> = [];
    if (max != undefined && given > max) {
        reasons.push(`${given} > ${max}`);
    }
    if (min != undefined && given < min) {
        reasons.push(`${given} < ${min}`);
    }
    if (specificValues != undefined && !specificValues.includes(given)) {
        reasons.push(`${given} != (${specificValues.join(",")})`);
    }
    return reasons.length == 0
        ? given
        : assertionFailure("value_type", operandType, reasons.join(", "));
};
