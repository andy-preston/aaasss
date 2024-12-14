import { LineWithObjectCode } from "../object-code/line-types.ts";

export type FailureMessage = (line: LineWithObjectCode) => [string];

export const failures = {
    "context.redefined": (_line: LineWithObjectCode) => [""],
    "device.notFound": (_line: LineWithObjectCode) => [""],
    "device.notSelected": (_line: LineWithObjectCode) => [""],
    "device.multiple": (_line: LineWithObjectCode) => [""],
    "file.notFound": (_line: LineWithObjectCode) => [""],
    "js.error": (_line: LineWithObjectCode) => [""],
    "js.jsMode": (_line: LineWithObjectCode) => [
        "\"{{\" when already in js mode"
    ],
    "js.assemblerMode": (_line: LineWithObjectCode) => [
        "\"}}\" when already in assembly mode"
    ],
    "macro.define": (_line: LineWithObjectCode) => [
        "Previous macro definition was not closed"
    ],
    "macro.end": (_line: LineWithObjectCode) => [
        "Can't end macro definition when a macro is not being defined"
    ],
    "macro.params": (_line: LineWithObjectCode) => [
        "Parameter count mismatch"
    ],
    "macro.empty": (_line: LineWithObjectCode) => [
        "Macro hasn't got any lines!"
    ],
    "macro.name": (_line: LineWithObjectCode) => [
        "Macro already exists"
    ],
    "macro.notExist": (_line: LineWithObjectCode) => [
        "Macro does not exist"
    ],
    "mnemonic.supportedUnknown": (_line: LineWithObjectCode) => [""],
    "mnemonic.notSupported": (_line: LineWithObjectCode) => [""],
    "mnemonic.unknown": (_line: LineWithObjectCode) => [""],
    "operand.outOfRange": (_line: LineWithObjectCode) => [""],
    "operand.wrongCount": (_line: LineWithObjectCode) => [""],
    "operand.tooManyIndexOffset": (_line: LineWithObjectCode) => [
        "An instruction can only have 1 index offset (Z+qq) operand"
    ],
    "syntax.invalidLabel": (_line: LineWithObjectCode) => [
        "A label must only contain alphanumeric characters and underscore"
    ],
    "type.string": (_line: LineWithObjectCode) => [""],
    "type.positive": (_line: LineWithObjectCode) => [""],
    "type.bytes": (_line: LineWithObjectCode) => [
        "Should be a string or an array of byte values"
    ],
    "type.strings": (_line: LineWithObjectCode) => [
        "Should be an array of strings"
    ],
    "type.params": (_line: LineWithObjectCode) => [
        "Should be an array of numbers &/or strings"
    ],
    "programMemory.outOfRange": (_line: LineWithObjectCode) => [""],
    "programMemory.sizeUnknown": (_line: LineWithObjectCode) => [""],
    "ram.outOfRange": (_line: LineWithObjectCode) => [""],
    "ram.sizeUnknown": (_line: LineWithObjectCode) => [""],
    "ram.stackAllocated": (_line: LineWithObjectCode) => [
        "Stack Already Allocated"
    ],
} as const satisfies Record<string, FailureMessage>;
