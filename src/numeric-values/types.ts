export type Min = number | undefined;
export type Max = number | undefined;
export type AllowedValues = Array<number> | undefined;

export const numericTypes = [
    "type_anything",
    "type_positive", "type_word", "type_byte", "type_7Bit", "type_6Bit",
    "type_nybble", "type_bitIndex",
    "type_ioPort",
    "type_register", "type_registerImmediate",
    "type_registerPair", "type_anyRegisterPair", "type_registerMultiply"
] as const;

export type NumericType = typeof numericTypes[number];
