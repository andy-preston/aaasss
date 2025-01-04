import { failure } from "../failure/failures.ts";
import type { Context } from "../context/context.ts";
import type { DevicePropertiesInterface } from "../device/properties.ts";
import type { LineWithPokedBytes } from "../program-memory/line-types.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";
import { addressingModeList } from "./addressing-mode-list.ts";
import {
    lineWithObjectCode, type LineWithObjectCode
} from "./line-types.ts";

export type AddressingModeGenerator = (context: Context) => LineWithObjectCode;

const addressingMode = (
    line: LineWithPokedBytes
): AddressingModeGenerator | undefined => {
    for (const addressingMode of addressingModeList) {
        const codeGenerator = addressingMode(line)
        if (codeGenerator != undefined) {
            return codeGenerator;
        }
    }
    return undefined;
};

const emptyLine = (line: LineWithPokedBytes) =>
    lineWithObjectCode(line, [], []);

export const codeGenerator = (
    context: Context,
    device: DevicePropertiesInterface,
    programMemory: ProgramMemory
) => (line: LineWithPokedBytes) => {
    if (line.mnemonic == "") {
        return emptyLine(line);
    }
    const isUnsupported = device.isUnsupported(line.mnemonic);
    if (isUnsupported.which == "failure") {
        return emptyLine(line).withFailure(isUnsupported);
    }
    const mode = addressingMode(line);
    if (mode == undefined) {
        return emptyLine(line).withFailure(
            failure(undefined, "mnemonic_unknown", undefined)
        );
    }
    const codeLine = mode(context);
    const stepResult = programMemory.step(codeLine);
    if (stepResult.which == "failure") {
        codeLine.withFailure(stepResult);
    }
    return codeLine;
};

export type CodeGenerator = ReturnType<typeof codeGenerator>;
