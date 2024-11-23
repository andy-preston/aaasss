import { failure } from "../value-or-failure.ts";
import { codeLine, type TokenisedLine, type CodeLine } from "../coupling/line.ts";
import { Pass } from "../state/pass.ts";
import { Context } from "../context/context.ts";
import { DevicePropertiesInterface } from "../device/properties.ts";
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
    _pass: Pass
) => (line: TokenisedLine): CodeLine => {
    if (line.failed() || line.mnemonic == "") {
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
    return mode(context);
};
