import type { DevicePropertiesInterface } from "../device/properties.ts";
import type { LineWithOperands } from "../operands/line-types.ts";
import { instructionEncoderList } from "./instruction-encoder-list.ts";
import {
    lineWithObjectCode, type LineWithObjectCode,
    lineWithPokedBytes, type LineWithPokedBytes
} from "./line-types.ts";
import type { PokeBuffer } from "./poke.ts";

export type EncodedInstruction =
    (device: DevicePropertiesInterface) => LineWithObjectCode;

const addressingMode = (
    line: LineWithPokedBytes
): EncodedInstruction | undefined => {
    for (const addressingMode of instructionEncoderList) {
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
    if (isUnsupported.type == "failures") {
        return emptyLine(intermediate).withFailures(isUnsupported.it);
    }

    const generatedCode = addressingMode(intermediate);
    if (generatedCode == undefined) {
        return emptyLine(intermediate).withFailure(
            { "kind": "mnemonic_unknown", "clue": line.mnemonic }
        );
    }

    return generatedCode(device);
};

export type ObjectCode = ReturnType<typeof objectCode>;
