import type { NumericType } from "../numeric-values/types.ts";

export type TypeFailure = NumericType
    | "type_number" | "type_string" | "type_strings"
    | "type_bytes" | "type_macroParams" | "type_bitmask";

export type FailureKind = TypeFailure
    | "symbol_alreadyExists" | "symbol_nameIsDirective" | "symbol_notFound"
    | "device_notFound" | "device_notSelected" | "device_multiple"
    | "file_notFound"
    | "js_error" | "js_jsMode" | "js_assemblerMode"
    | "macro_multiDefine" | "macro_noEnd" | "macro_end" | "macro_params"
        | "macro_name" | "macro_notExist"
    | "mnemonic_supportedUnknown" | "mnemonic_notSupported" | "mnemonic_unknown"
    | "operand_wrongCount" | "operand_blank" | "operand_wrongType"
        | "operand_offsetX" | "operand_offsetNotLdd" | "operand_offsetNotStd"
    | "syntax_invalidLabel"
    | "programMemory_outOfRange" | "programMemory_sizeUnknown"
    | "ram_outOfRange" | "ram_sizeUnknown" | "ram_stackAllocated";

