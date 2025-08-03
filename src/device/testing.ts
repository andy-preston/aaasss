import { currentLine, emptyLine } from "../assembler/line.ts";
import { instructionSet } from "../instruction-set/instruction-set.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { deviceChooser } from "./chooser.ts";
import { defaultDeviceFinder, defaultTomlLoader } from "./file.ts";
import { deviceSettings } from "./settings.ts";

export const testSystem = () => {
    const $currentLine = currentLine();
    $currentLine(emptyLine("plop.asm"));
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $instructionSet = instructionSet($currentLine, $symbolTable);
    const $deviceSettings = deviceSettings(
        $instructionSet, $cpuRegisters, $symbolTable
    );
    const $deviceChooser = deviceChooser(
        $currentLine, $deviceSettings,
        [defaultDeviceFinder, defaultTomlLoader]
    );
    return {
        "currentLine": $currentLine,
        "instructionSet": $instructionSet,
        "symbolTable": $symbolTable,
        "deviceChooser": $deviceChooser
    };
}

