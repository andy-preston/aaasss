import { pass } from "../assembler/pass.ts";
import { anEmptyContext } from "../javascript/context.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { deviceChooser } from "./chooser.ts";
import { defaultDeviceFinder, defaultJsonLoader } from "./device-file.ts";
import { deviceProperties } from "./properties.ts";

export const testEnvironment = () => {
    const table = symbolTable(anEmptyContext(), pass());
    const device = deviceProperties(table);
    return {
        "device": device,
        "properties": device.public,
        "chooser": deviceChooser(
            device, table, [defaultDeviceFinder, defaultJsonLoader]
        )
    };
}

