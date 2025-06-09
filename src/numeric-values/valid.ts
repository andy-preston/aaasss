import type { NumberOrFailures } from "../failure/bags.ts";
import type { AllowedValues, Max, Min, NumericType } from "./types.ts";

import { numberBag } from "../assembler/bags.ts";
import { assertionFailure, bagOfFailures, numericTypeFailure } from "../failure/bags.ts";

const limits: Record<
    NumericType,              [      Min,       Max, AllowedValues           ]
> = {
    "type_anything":          [undefined, undefined, undefined               ],
    "type_positive":          [        0, undefined, undefined               ],
    "type_word":              [        0,    0xffff, undefined               ],
    "type_byte":              [        0,      0xff, undefined               ],
    "type_7Bit":              [        0,      0x7f, undefined               ],
    "type_6Bit":              [        0,  0b111111, undefined               ],
    "type_nybble":            [        0,      0x0f, undefined               ],
    "type_bitIndex":          [        0,         7, undefined               ],
    "type_ioPort":            [     0x20,      0x5f, undefined               ],
    "type_register":          [        0,        31, undefined               ],
    "type_registerImmediate": [       16,        31, undefined               ],
    "type_registerMultiply":  [       16,        23, undefined               ],
    "type_registerPair":      [undefined, undefined, [        24, 26, 28, 30]],
    "type_anyRegisterPair":   [undefined, undefined, [ 0,  2,  4,  6, 8,
                                                      10, 12, 14, 16, 18,
                                                      20, 22, 24, 26, 28, 30]]
};

export const validNumeric = (
    given: unknown, numericType: NumericType | undefined
): NumberOrFailures => {
    const typeOf = Array.isArray(given) ? "array" : typeof given;
    if (!["number", "string"].includes(typeOf)) {
        return bagOfFailures([assertionFailure(
            "type_failure", "number | string", typeOf
        )]);
    }

    const numeric = typeOf == "number" ? given as number : parseInt(`${given}`);
    if (`${numeric}` != `${given}`) {
        return bagOfFailures([assertionFailure(
            "type_failure", "numeric", `"${given}"`
        )]);
    }

    if (numericType == undefined) {
        return numberBag(numeric);
    }

    const [min, max, specificValues] = limits[numericType];
    const bigEnough = min == undefined || numeric >= min;
    const smallEnough = max == undefined || numeric <= max;
    const allowed = specificValues == undefined
        || specificValues.includes(numeric);
    if (!bigEnough || !smallEnough || !allowed) {
        return bagOfFailures([
            numericTypeFailure(numericType, numeric, min, max, specificValues)
        ]);
    }

    return numberBag(numeric);
};
