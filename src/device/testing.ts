import { cpuRegisters } from "../registers/cpu-registers.ts";
import { deviceChooser } from "./chooser.ts";
import { defaultDeviceFinder, defaultJsonLoader } from "./device-file.ts";
import { deviceProperties } from "./properties.ts";

export const testEnvironment = () => {
    const device = deviceProperties();
    return {
        "deviceProperties": device,
        "chooser": deviceChooser(
            device, cpuRegisters(), [defaultDeviceFinder, defaultJsonLoader]
        )
    };
}

