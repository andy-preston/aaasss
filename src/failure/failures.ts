import type { NumericType } from "../numeric-values/types.ts";

////////////////////////////////////////////////////////////////////////////////
//
// we need a test that goes through all of the failures, and looks for them
// in the source, apart from where they're defined (here?) or "translated"
// and if it can't find them - fails.
//
////////////////////////////////////////////////////////////////////////////////

export type TypeFailure = NumericType
    | "type_number" | "type_string" | "type_strings" | "type_bytes";

export type OldFailureKind = TypeFailure
    | "device_internalFormat"
    | "macro_multiDefine" | "macro_noEnd" | "macro_end" | "macro_params"
        | "macro_name" | "macro_notExist"
    | "operand_wrongCount" | "operand_blank" | "operand_wrongType"
        | "operand_offsetX" | "operand_offsetNotLdd" | "operand_offsetNotStd"
    | "parameter_firstName" | "parameter_count" | "parameter_type"
    | "symbol_alreadyExists" | "symbol_nameIsDirective" | "symbol_nameIsRegister"
        | "symbol_notFound"
