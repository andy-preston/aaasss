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
    | "macro_multiDefine" | "macro_noEnd" | "macro_end" | "macro_params"
    | "macro_name" | "macro_notExist"
    | "parameter_firstName" | "parameter_count" | "parameter_type"
