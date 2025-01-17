import { box, Box, failure, Failure } from "../failure/failure-or-box.ts";
import { NumericType } from "./types.ts";

const minMax: Record<NumericType, [number, number | undefined]> = {
    "type_positive": [0, undefined],
    "type_word": [0, 0xffff],
    "type_16BitDataAddress": [0, 0xffff],
    "type_7BitDataAddress": [0, 0x7f],
    "type_byte": [0, 0xff],
    "type_nybble": [0, 0x0f],
    "type_register": [0, 31],
    "type_registerImmediate": [16, 31],
};

export const validNumeric = (
    value: unknown, numericType: NumericType
): Box<number> | Failure => {
    const asString = `${value}`;
    const [min, max] = minMax[numericType];
    return typeof value == "number"
        && Number.parseInt(`${value}`) == value
        && value >= min
        && (max == undefined || value <= max)
        ? box(value as number)
        : failure(undefined, numericType, asString);
};

