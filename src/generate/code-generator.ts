import { failure } from "../value-or-failure.ts";
import { codeLine, type TokenisedLine, type CodeLine } from "../coupling/line.ts";
import type { ProgramMemory } from "../state/program-memory.ts";
import type { Context } from "../context/context.ts";
import type { DevicePropertiesInterface } from "../device/properties.ts";
import { addressingModeList } from "./addressing-mode-list.ts";

export type AddressingModeGenerator = (context: Context) => CodeLine;

const addressingMode = (
    line: TokenisedLine
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
) => (line: TokenisedLine): CodeLine => {
    if (line.label != "") {
        context.property(line.label, programMemory.address());
    }
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
    const generationResult = mode(context);
    const stepResult = programMemory.step(generationResult.code);
    if (stepResult.which == "failure") {
        generationResult.addFailures([stepResult]);
    }
    return generationResult;
};
