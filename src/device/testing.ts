import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { deviceDirective } from "./device-directive.ts";
import { defaultDeviceFinder, defaultTomlLoader } from "./device-file.ts";
import { deviceSettings } from "./device-settings.ts";
import { instructionSet } from "./instruction-set.ts";

export const systemUnderTest = () => {
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($cpuRegisters);
    const $instructionSet = instructionSet($symbolTable);
    const $deviceSettings = deviceSettings(
        $instructionSet, $cpuRegisters, $symbolTable
    );
    const $deviceDirective = deviceDirective(
        $deviceSettings, [defaultDeviceFinder, defaultTomlLoader]
    );
    return {
        "symbolTable": $symbolTable,
        "instructionSet": $instructionSet,
        "deviceSettings": $deviceSettings,
        "deviceDirective": $deviceDirective.deviceDirective
    };
}

