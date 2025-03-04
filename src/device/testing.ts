import { cpuRegisters } from "../registers/cpu-registers.ts";
import { deviceChooser } from "./chooser.ts";
import { defaultDeviceFinder, defaultJsonLoader } from "./device-file.ts";
import { deviceProperties } from "./properties.ts";

export const systemUnderTest = () => {
    const device = deviceProperties();
    return {
        "deviceProperties": device,
        "deviceChooser": deviceChooser(
            device, cpuRegisters(), [defaultDeviceFinder, defaultJsonLoader]
        )
    };
}

