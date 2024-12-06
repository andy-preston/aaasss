import { CodeLine } from "../coupling/line.ts";

export type FailureMessage = (line: CodeLine) => [string];

export const failures = {
    "context.redefined": (_line: CodeLine) => [""],
    "device.notFound": (_line: CodeLine) => [""],
    "device.notSelected": (_line: CodeLine) => [""],
    "device.multiple": (_line: CodeLine) => [""],
    "file.notFound": (_line: CodeLine) => [""],
    "js.error": (_line: CodeLine) => [""],
    "js.jsMode": (_line: CodeLine) => [
        "\"{{\" when already in js mode"
    ],
    "js.assemblerMode": (_line: CodeLine) => [
        "\"}}\" when already in assembly mode"
    ],
    "macro.define": (_line: CodeLine) => [
        "Previous macro definition was not closed"
    ],
    "macro.end": (_line: CodeLine) => [
        "Can't end macro definition when a macro is not being defined"
    ],
    "mnemonic.supportedUnknown": (_line: CodeLine) => [""],
    "mnemonic.notSupported": (_line: CodeLine) => [""],
    "mnemonic.unknown": (_line: CodeLine) => [""],
    "byte.outOfRange": (_line: CodeLine) => [""],
    "operand.outOfRange": (_line: CodeLine) => [""],
    "operand.wrongCount": (_line: CodeLine) => [""],
    "operand.tooManyIndexOffset": (_line: CodeLine) => [
        "An instruction can only have 1 index offset (Z+qq) operand"
    ],
    "syntax.invalidLabel": (_line: CodeLine) => [
        "A label must only contain alphanumeric characters and underscore"
    ],
    "address.negative": (_line: CodeLine) => [""],
    "programMemory.outOfRange": (_line: CodeLine) => [""],
    "programMemory.sizeUnknown": (_line: CodeLine) => [""],
} as const satisfies Record<string, FailureMessage>;
