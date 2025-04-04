import { numericTypes, type NumericType } from "../numeric-values/types.ts";

export const failureKinds = {
    "boring": [
        "syntax_invalidLabel",
        "device_notSelected",
        "js_jsMode", "js_assemblerMode",
        "macro_end", "macro_noEnd",
        "operand_blank", "operand_offsetNotLdd", "operand_offsetNotStd",
        "operand_offsetX", "operand_z",
        "parameter_firstName",
        "programMemory_sizeUnknown",
        "ram_sizeUnknown", "ram_stackAllocated"
    ],
    "comparison": [
        "device_multiple"
    ],
    "type": [
        "type_failure"
    ],
    "numericType": [
        "type_bytesOrString"
    ],
    "clue": [
        "file_notFound",  "device_notFound",
        "macro_multiDefine", "macro_params",
        "mnemonic_unknown",
        "mnemonic_notSupported", "mnemonic_supportedUnknown",
        "operand_count",  "parameter_count",
        "symbol_notFound"
    ],
    "definition": [
        "symbol_alreadyExists"
    ],
    "exception": [
        "js_error"
    ],
    "memoryRange": [
        "programMemory_outOfRange", "ram_outOfRange"
    ]
} as const;

export type FailureKind = NumericType |
    typeof failureKinds[keyof typeof failureKinds][number];

export const allFailureKinds = () => (
    Object.entries(failureKinds).flatMap(
        ([_key, failures]) => failures
    ) as Array<string>).concat(numericTypes);
