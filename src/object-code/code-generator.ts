import { failure } from "../coupling/value-failure.ts";
import type { Context } from "../context/context.ts";
import type { DevicePropertiesInterface } from "../device/properties.ts";
import type { PokedLine } from "../program-memory/line-types.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";
import { addressingModeList } from "./addressing-mode-list.ts";
import { codeLine, type CodeLine } from "./code-line.ts";

export type AddressingModeGenerator = (context: Context) => CodeLine;

const addressingMode = (
    line: PokedLine
): AddressingModeGenerator | undefined => {
    for (const addressingMode of addressingModeList) {
        const codeGenerator = addressingMode(line)
        if (codeGenerator != undefined) {
            return codeGenerator;
        }
    }
    return undefined;
};

export const codeGenerator = (
    context: Context,
    device: DevicePropertiesInterface,
    programMemory: ProgramMemory
) => (line: PokedLine): CodeLine => {
    if (line.mnemonic == "") {
        return codeLine(line, [], [], []);
    }
    const isUnsupported = device.isUnsupported(line.mnemonic);
    if (isUnsupported.which == "failure") {
        return codeLine(line, [], [], [isUnsupported]);
    }
    const mode = addressingMode(line);
    if (mode == undefined) {
        return codeLine(line, [], [], [
            failure(undefined, "mnemonic.unknown", undefined)
        ]);
    }
    const theCodeLine = mode(context);
    const stepResult = programMemory.step(theCodeLine);
    if (stepResult.which == "failure") {
        theCodeLine.addFailures([stepResult]);
    }
    return theCodeLine;
};

export type CodeGenerator = ReturnType<typeof codeGenerator>;
