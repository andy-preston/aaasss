import { numberBag } from "../assembler/bags.ts";
import { bagOfFailures, numericTypeFailure, typeFailure, type NumberOrFailures } from "../failure/bags.ts";
import type { NumericType } from "./types.ts";

const minMax: Record<NumericType, [number, number | undefined]> = {
    "type_positive": [0, undefined],
    "type_word": [0, 0xffff],
    "type_16BitDataAddress": [0, 0xffff],
    "type_7BitDataAddress": [0, 0x7f],
    "type_bitIndex": [0, 7],
    "type_byte": [0, 0xff],
    "type_nybble": [0, 0x0f],
    "type_register": [0, 31],
    "type_registerImmediate": [16, 31],
};

export const validNumeric = (
    given: unknown, numericType: NumericType | undefined
): NumberOrFailures => {
    const typeOf = Array.isArray(given) ? "array" : typeof given;
    if (!["number", "string"].includes(typeOf)) {
        return bagOfFailures([typeFailure(
            "type_failure", "number | string", typeOf
        )]);
    }

    const numeric = typeOf == "number" ? given as number : parseInt(`${given}`);
    if (`${numeric}` != `${given}`) {
        return bagOfFailures([typeFailure(
            "type_failure", "numeric", `"${given}"`
        )]);
    }

    if (numericType == undefined) {
        return numberBag(numeric);
    }

    const [min, max] = minMax[numericType];
    if (numeric < min || (max != undefined && numeric > max)) {
        return bagOfFailures([numericTypeFailure(
            numericType, numeric, min, max
        )]);
    }

    return numberBag(numeric);
};
