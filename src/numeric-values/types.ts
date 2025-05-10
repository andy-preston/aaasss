// Each numeric type is also a Failure so we can report validation errors
// and request types with the same identifier

export const numericTypes = [
    "type_anything",
    "type_positive", "type_word", "type_byte", "type_nybble",
    "type_bitIndex", "type_ioPort",
    "type_7BitDataAddress", "type_16BitDataAddress",
    "type_register", "type_registerImmediate"
] as const;

export type NumericType = typeof numericTypes[number];
