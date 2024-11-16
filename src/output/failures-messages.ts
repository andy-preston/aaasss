import { CodeLine } from "../coupling/line.ts";

export type FailureMessage = (line: CodeLine) => [string];

export const failures = {
    "context.redefined": (_line: CodeLine) => [""],
    "device.notFound": (_line: CodeLine) => [""],
    "device.notSelected": (_line: CodeLine) => [""],
    "device.multiple": (_line: CodeLine) => [""],
    "file.notFound": (_line: CodeLine) => [""],
    "js.error": (_line: CodeLine) => [""],
    "js.jsMode": (_line: CodeLine) => [""],
    "js.assemblerMode": (_line: CodeLine) => [""],
    "operand.outOfRange": (_line: CodeLine) => [""],
    "operand.tooMany": (_line: CodeLine) => [""],
    "operand.tooManyIndexOffset": (_line: CodeLine) => {
        return ["An instruction can only have 1 index offset (Z+qq) operand"];
    },
    "syntax.spaceInLabel": (_line: CodeLine) => [""],
} as const satisfies Record<string, FailureMessage>;
