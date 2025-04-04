import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { deviceChooser } from "./chooser.ts";
import { defaultDeviceFinder, defaultJsonLoader } from "./device-file.ts";
import { instructionSet } from "./instruction-set.ts";

export const systemUnderTest = () => {
    const registers = cpuRegisters();
    const symbols = symbolTable(registers);
    const instructions = instructionSet(symbols);
    return {
        "symbolTable": symbols,
        "instructionSet": instructions,
        "deviceChooser": deviceChooser(instructions, registers, symbols, [
            defaultDeviceFinder, defaultJsonLoader
        ])
    };
}

