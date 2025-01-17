// Each numeric type is also a Failure so we can report validation errors
// and request types with the same identifier

export type NumericType =
    "type_positive" |
    "type_word" | "type_byte"  | "type_nybble" |
    "type_7BitDataAddress" | "type_16BitDataAddress" |
    "type_register" | "type_registerImmediate";
