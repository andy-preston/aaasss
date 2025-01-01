import type { FailureKind } from "../failure/failures.ts";
import type { LineWithObjectCode } from "../object-code/line-types.ts";
import type { FailureMessage } from "./messages.ts";

export const messages: Record<FailureKind, FailureMessage> = {
    "context_redefined": (_line: LineWithObjectCode) => [""],
    "device_notFound": (_line: LineWithObjectCode) => [""],
    "device_notSelected": (_line: LineWithObjectCode) => [""],
    "device_multiple": (_line: LineWithObjectCode) => [""],
    "file_notFound": (_line: LineWithObjectCode) => [""],
    "js_error": (_line: LineWithObjectCode) => [""],
    "js_jsMode": (_line: LineWithObjectCode) => [
        "\"{{\" when already in js mode"
    ],
    "js_assemblerMode": (_line: LineWithObjectCode) => [
        "\"}}\" when already in assembly mode"
    ],
    "macro_define": (_line: LineWithObjectCode) => [
        "Previous macro definition was not closed"
    ],
    "macro_end": (_line: LineWithObjectCode) => [
        "Can't end macro definition when a macro is not being defined"
    ],
    "macro_params": (_line: LineWithObjectCode) => [
        "Parameter count mismatch"
    ],
    "macro_empty": (_line: LineWithObjectCode) => [
        "Macro hasn't got any lines!"
    ],
    "macro_name": (_line: LineWithObjectCode) => [
        "Macro already exists"
    ],
    "macro_notExist": (_line: LineWithObjectCode) => [
        "Macro does not exist"
    ],
    "mnemonic_supportedUnknown": (_line: LineWithObjectCode) => [""],
    "mnemonic_notSupported": (_line: LineWithObjectCode) => [""],
    "mnemonic_unknown": (_line: LineWithObjectCode) => [""],
    "operand_outOfRange": (_line: LineWithObjectCode) => [""],
    "operand_wrongCount": (_line: LineWithObjectCode) => [""],
    "operand_blank": (_line: LineWithObjectCode) => [""],
    "operand_offsetX": (_line: LineWithObjectCode) => [
        "Index offset instructions only operate on the Y or Z registers"
    ],
    "operand_offsetNotLdd": (_line: LineWithObjectCode) => [
        "An Index offset in the second parameter can only be used on the LDD instruction"
    ],
    "operand_offsetNotStd": (_line: LineWithObjectCode) => [
        "An Index offset in the first parameter can only be used on the STD instruction"
    ],
    "syntax_invalidLabel": (_line: LineWithObjectCode) => [
        "A label must only contain alphanumeric characters and underscore"
    ],
    "type_string": (_line: LineWithObjectCode) => [""],
    "type_positive": (_line: LineWithObjectCode) => [""],
    "type_bytes": (_line: LineWithObjectCode) => [
        "Should be a string or an array of byte values"
    ],
    "type_strings": (_line: LineWithObjectCode) => [
        "Should be an array of strings"
    ],
    "type_params": (_line: LineWithObjectCode) => [
        "Should be an array of numbers &/or strings"
    ],
    "programMemory_outOfRange": (_line: LineWithObjectCode) => [""],
    "programMemory_sizeUnknown": (_line: LineWithObjectCode) => [""],
    "ram_outOfRange": (_line: LineWithObjectCode) => [""],
    "ram_sizeUnknown": (_line: LineWithObjectCode) => [""],
    "ram_stackAllocated": (_line: LineWithObjectCode) => [
        "Stack Already Allocated"
    ],
} as const;
