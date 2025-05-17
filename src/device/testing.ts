import { currentLine } from "../line/current-line.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { deviceDirective } from "./directive.ts";
import { defaultDeviceFinder, defaultTomlLoader } from "./file.ts";
import { instructionSet } from "./instruction-set.ts";
import { deviceSettings } from "./settings.ts";

export const systemUnderTest = () => {
    const $currentLine = currentLine();
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $instructionSet = instructionSet($symbolTable);
    const $deviceSettings = deviceSettings(
        $instructionSet, $cpuRegisters, $symbolTable
    );
    const $deviceDirective = deviceDirective(
        $deviceSettings, [defaultDeviceFinder, defaultTomlLoader]
    );
    return {
        "currentLine": $currentLine,
        "symbolTable": $symbolTable,
        "instructionSet": $instructionSet,
        "deviceDirective": $deviceDirective.deviceDirective
    };
}

