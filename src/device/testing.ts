import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { deviceChooser } from "./chooser.ts";
import { defaultDeviceFinder, defaultJsonLoader } from "./device-file.ts";
import { deviceProperties } from "./properties.ts";

export const systemUnderTest = () => {
    const registers = cpuRegisters();
    const symbols = symbolTable(registers);
    const device = deviceProperties(symbols);
    return {
        "symbolTable": symbols,
        "deviceProperties": device,
        "deviceChooser": deviceChooser(device, registers, symbols, [
            defaultDeviceFinder, defaultJsonLoader
        ])
    };
}

