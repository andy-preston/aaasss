import type { FailureKind } from "../failure/bags.ts";
import type { LineWithAddress } from "../program-memory/line-types.ts";
import type { FailureMessage } from "./messages.ts";

export const messages: Record<FailureKind, FailureMessage> = {
    "device_multiple": (_line: LineWithAddress) => [""],
    "device_notFound": (_line: LineWithAddress) => [""],
    "device_notSelected": (_line: LineWithAddress) => [""],
    "file_notFound": (_line: LineWithAddress) => [""],
    "js_assemblerMode": (_line: LineWithAddress) => [
        "\"}}\" when already in assembly mode"
    ],
    "js_error": (_line: LineWithAddress) => [""],
    "js_jsMode": (_line: LineWithAddress) => [
        "\"{{\" when already in js mode"
    ],
    "macro_noEnd": (_line: LineWithAddress) => [
        "Macro definition was not closed"
    ],
    "macro_multiDefine": (_line: LineWithAddress) => [
        "You can't define a macro whilst you're still defining the previous one"
    ],
    "macro_end": (_line: LineWithAddress) => [
        "Can't end macro definition when a macro is not being defined"
    ],
    "macro_params": (_line: LineWithAddress) => [
        "Parameter count mismatch"
    ],
    "mnemonic_notSupported": (_line: LineWithAddress) => [""],
    "mnemonic_supportedUnknown": (_line: LineWithAddress) => [""],
    "mnemonic_unknown": (_line: LineWithAddress) => [""],
    "operand_blank": (_line: LineWithAddress) => [""],
    "operand_offsetNotLdd": (_line: LineWithAddress) => [
        "An Index offset in the second parameter can only be used on the LDD instruction"
    ],
    "operand_offsetNotStd": (_line: LineWithAddress) => [
        "An Index offset in the first parameter can only be used on the STD instruction"
    ],
    "operand_offsetX": (_line: LineWithAddress) => [
        "Index offset instructions only operate on the Y or Z registers"
    ],
    "operand_count": (_line: LineWithAddress) => [""],
    "parameter_firstName": (_line: LineWithAddress) => [
        "The first parameter should be a name"
    ],
    "parameter_count": (_line: LineWithAddress) => [],
    "programMemory_outOfRange": (_line: LineWithAddress) => [""],
    "programMemory_sizeUnknown": (_line: LineWithAddress) => [""],
    "ram_outOfRange": (_line: LineWithAddress) => [""],
    "ram_sizeUnknown": (_line: LineWithAddress) => [""],
    "ram_stackAllocated": (_line: LineWithAddress) => [
        "Stack Already Allocated"
    ],
    "symbol_alreadyExists": (_line: LineWithAddress) => [""],
    "symbol_notFound": (_line: LineWithAddress) => [""],
    "syntax_invalidLabel": (_line: LineWithAddress) => [
        "A label must only contain alphanumeric characters and underscore"
    ],
    "type_16BitDataAddress": (_line: LineWithAddress) => [""],
    "type_7BitDataAddress": (_line: LineWithAddress) => [""],
    "type_bitIndex": (_line: LineWithAddress) => [""],
    "type_byte":  (_line: LineWithAddress) => [""],
    "type_bytesOrString": (_line: LineWithAddress) => [
        "Should be a string or an array of byte values"
    ],
    "type_failure": (_line: LineWithAddress) => [
        "The type of the operands / parameters don't match the requirements"
    ],
    "type_ioPort": (_line: LineWithAddress) => [""],
    "type_nybble": (_line: LineWithAddress) => [""],
    "type_positive": (_line: LineWithAddress) => [""],
    "type_register": (_line: LineWithAddress) => [""],
    "type_registerImmediate": (_line: LineWithAddress) => [""],
    "type_word":  (_line: LineWithAddress) => [""],
} as const;
