import type { NumericType } from "../numeric-values/types.ts";

import { numericTypes } from "../numeric-values/types.ts";

export const failureKinds = {
    "boring": [
        "syntax_invalidLabel", "syntax_invalidMnemonic",
        "device_notSelected",
        "js_jsMode", "js_assemblerMode",
        "macro_end", "macro_noEnd",
        "mnemonic_implicitElpmNotLpm",
        "operand_blank", "operand_offsetNotLdd", "operand_offsetNotStd",
        "operand_offsetX",
        "parameter_firstName",
        "programMemory_sizeUnknown",
        "ram_sizeUnknown", "ram_stackAllocated"
    ],
    "assertion": [
        "macro_params",
        "operand_count", "operand_symbolic",
        "parameter_count",
        "programMemory_outOfRange",
        "ram_outOfRange",
        "type_failure"
    ],
    "numericType": [
        "type_bytesOrString", "type_relativeAddress"
    ],
    "clue": [
        "file_notFound",  "device_notFound",
        "macro_multiDefine",
        "mnemonic_unknown", "mnemonic_supportedUnknown"
    ],
    "notSupported": [
        "notSupported_mnemonic", "notSupported_ioRange"
    ],
    "definition": [
        "symbol_alreadyExists"
    ],
    "exception": [
        "js_error"
    ]
} as const;

export type FailureKind = NumericType |
    typeof failureKinds[keyof typeof failureKinds][number];

export const allFailureKinds = () => (
    Object.entries(failureKinds).flatMap(
        ([_key, failures]) => failures
    ) as Array<string>).concat(numericTypes);
