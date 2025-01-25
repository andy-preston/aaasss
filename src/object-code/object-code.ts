import { failure } from "../failure/failure-or-box.ts";
import type { DevicePropertiesInterface } from "../device/properties.ts";
import { addressingModeList } from "./addressing-mode-list.ts";
import { lineWithObjectCode, type LineWithPokedBytes, type LineWithObjectCode, lineWithPokedBytes } from "./line-types.ts";
import { PokeBuffer } from "./poke.ts";
import { LineWithOperands } from "../operands/line-types.ts";

export type EncodedInstruction =
    (device: DevicePropertiesInterface) => LineWithObjectCode;

const addressingMode = (
    line: LineWithPokedBytes
): EncodedInstruction | undefined => {
    for (const addressingMode of addressingModeList) {
        const codeGenerator = addressingMode(line)
        if (codeGenerator != undefined) {
            return codeGenerator;
        }
    }
    return undefined;
};

const emptyLine = (line: LineWithPokedBytes) => lineWithObjectCode(line, []);

export const objectCode = (
    device: DevicePropertiesInterface,
    pokeBuffer: PokeBuffer
) => (line: LineWithOperands) => {
    if (line.isRecordingMacro) {
        return emptyLine(lineWithPokedBytes(line, []));
    }

    const intermediate = lineWithPokedBytes(line, pokeBuffer.contents());
    if (line.mnemonic == "") {
        return emptyLine(intermediate);
    }

    const isUnsupported = device.isUnsupported(line.mnemonic);
    if (isUnsupported.which == "failure") {
        return emptyLine(intermediate).withFailure(isUnsupported);
    }

    const generatedCode = addressingMode(intermediate);
    if (generatedCode == undefined) {
        return emptyLine(intermediate).withFailure(
            failure(undefined, "mnemonic_unknown", undefined)
        );
    }

    return generatedCode(device);
};

export type ObjectCode = ReturnType<typeof objectCode>;
