export type TypeFailures =
    "type_string" | "type_positive" | "type_bytes" | "type_strings" |
    "type_params" | "type_word" | "type_byte" | "type_bitmask";

export type FailureKind = TypeFailures
    | "context_redefined"
    | "device_notFound" | "device_notSelected" | "device_multiple"
    | "file_notFound"
    | "js_error" | "js_jsMode" | "js_assemblerMode"
    | "macro_define" | "macro_end" | "macro_params" | "macro_empty"
        | "macro_name" | "macro_notExist"
    | "mnemonic_supportedUnknown" | "mnemonic_notSupported" | "mnemonic_unknown"
    | "operand_outOfRange" | "operand_wrongCount" | "operand_blank"
        | "operand_wrongType"
        | "operand_offsetX" | "operand_offsetNotLdd" | "operand_offsetNotStd"
    | "syntax_invalidLabel"
    | "programMemory_outOfRange" | "programMemory_sizeUnknown"
    | "ram_outOfRange" | "ram_sizeUnknown" | "ram_stackAllocated";
