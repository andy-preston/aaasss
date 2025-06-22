export const failureKinds = {
    "boring": [
        "syntax_invalidLabel", "syntax_invalidMnemonic",
        "device_notSelected",
        "js_jsMode", "js_assemblerMode",
        "macro_end", "macro_noEnd",
        "operand_offsetNotLdd", "operand_offsetNotStd",
        "operand_offsetX",
        "parameter_firstName",
        "programMemory_cantOrg", "programMemory_sizeUnknown",
        "ram_sizeUnknown", "ram_stackAllocated"
    ],
    "assertion": [
        "macro_params", "operand_count", "parameter_count", "value_type",
        "programMemory_outOfRange", "ram_outOfRange"
    ],
    "numericType": [
        "type_bytesOrString", "type_relativeAddress", "type_positive"
    ],
    "clue": [
        "file_notFound",  "device_notFound", "register_notFound",
        "macro_multiDefine", "mnemonic_unknown", "mnemonic_supportedUnknown"
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

export type FailureKind = /*NumericType |*/
    typeof failureKinds[keyof typeof failureKinds][number];
