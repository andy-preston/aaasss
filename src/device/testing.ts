import { instructionSet } from "../instruction-set/instruction-set.ts";
import { currentLine } from "../line/current-line.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { deviceChooser } from "./chooser.ts";
import { defaultDeviceFinder, defaultTomlLoader } from "./file.ts";
import { deviceSettings } from "./settings.ts";

export const testSystem = () => {
    const $currentLine = currentLine();
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $instructionSet = instructionSet($symbolTable);
    const $deviceSettings = deviceSettings(
        $instructionSet, $cpuRegisters, $symbolTable
    );
    const $deviceChooser = deviceChooser(
        $deviceSettings, [defaultDeviceFinder, defaultTomlLoader]
    );
    return {
        "currentLine": $currentLine,
        "instructionSet": $instructionSet,
        "symbolTable": $symbolTable,
        "deviceChooser": $deviceChooser
    };
}

