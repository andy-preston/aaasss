import type { FailureKind } from "../failure/failures.ts";
import type { LineWithAddress } from "../program-memory/line-types.ts";
import type { FailureMessage } from "./messages.ts";

export const messages: Record<FailureKind, FailureMessage> = {
    "context_redefined": (_line: LineWithAddress) => [""],
    "device_notFound": (_line: LineWithAddress) => [""],
    "device_notSelected": (_line: LineWithAddress) => [""],
    "device_multiple": (_line: LineWithAddress) => [""],
    "file_notFound": (_line: LineWithAddress) => [""],
    "js_error": (_line: LineWithAddress) => [""],
    "js_jsMode": (_line: LineWithAddress) => [
        "\"{{\" when already in js mode"
    ],
    "js_assemblerMode": (_line: LineWithAddress) => [
        "\"}}\" when already in assembly mode"
    ],
    "macro_define": (_line: LineWithAddress) => [
        "Previous macro definition was not closed"
    ],
    "macro_end": (_line: LineWithAddress) => [
        "Can't end macro definition when a macro is not being defined"
    ],
    "macro_params": (_line: LineWithAddress) => [
        "Parameter count mismatch"
    ],
    "macro_empty": (_line: LineWithAddress) => [
        "Macro hasn't got any lines!"
    ],
    "macro_name": (_line: LineWithAddress) => [
        "Macro already exists"
    ],
    "macro_notExist": (_line: LineWithAddress) => [
        "Macro does not exist"
    ],
    "mnemonic_supportedUnknown": (_line: LineWithAddress) => [""],
    "mnemonic_notSupported": (_line: LineWithAddress) => [""],
    "mnemonic_unknown": (_line: LineWithAddress) => [""],
    "operand_outOfRange": (_line: LineWithAddress) => [""],
    "operand_wrongCount": (_line: LineWithAddress) => [""],
    "operand_blank": (_line: LineWithAddress) => [""],
    "operand_wrongType": (_line: LineWithAddress) => [""],
    "operand_offsetX": (_line: LineWithAddress) => [
        "Index offset instructions only operate on the Y or Z registers"
    ],
    "operand_offsetNotLdd": (_line: LineWithAddress) => [
        "An Index offset in the second parameter can only be used on the LDD instruction"
    ],
    "operand_offsetNotStd": (_line: LineWithAddress) => [
        "An Index offset in the first parameter can only be used on the STD instruction"
    ],
    "syntax_invalidLabel": (_line: LineWithAddress) => [
        "A label must only contain alphanumeric characters and underscore"
    ],
    "type_string": (_line: LineWithAddress) => [""],
    "type_positive": (_line: LineWithAddress) => [""],
    "type_word":  (_line: LineWithAddress) => [""],
    "type_byte":  (_line: LineWithAddress) => [""],
    "type_bitmask": (_line: LineWithAddress) => [""],
    "type_bytes": (_line: LineWithAddress) => [
        "Should be a string or an array of byte values"
    ],
    "type_strings": (_line: LineWithAddress) => [
        "Should be an array of strings"
    ],
    "type_params": (_line: LineWithAddress) => [
        "Should be an array of numbers &/or strings"
    ],
    "programMemory_outOfRange": (_line: LineWithAddress) => [""],
    "programMemory_sizeUnknown": (_line: LineWithAddress) => [""],
    "ram_outOfRange": (_line: LineWithAddress) => [""],
    "ram_sizeUnknown": (_line: LineWithAddress) => [""],
    "ram_stackAllocated": (_line: LineWithAddress) => [
        "Stack Already Allocated"
    ],
} as const;
