import { anEmptyContext } from "../javascript/context.ts";
import { symbolTable } from "../listing/symbol-table.ts";
import { deviceChooser } from "./chooser.ts";
import { defaultDeviceFinder, defaultJsonLoader } from "./device-file.ts";
import { deviceProperties } from "./properties.ts";

export const testEnvironment = () => {
    const context = anEmptyContext(symbolTable());
    const device = deviceProperties(context);
    return {
        "context": context,
        "device": device,
        "properties": device.public,
        "chooser": deviceChooser(
            device, context, [defaultDeviceFinder, defaultJsonLoader]
        )
    };
}

