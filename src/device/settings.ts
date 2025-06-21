import type { InstructionSet } from "../instruction-set/instruction-set.ts";
import type { CpuRegisters } from "../registers/cpu-registers.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { SpecItems } from "./data-types.ts";


export const deviceSettings = (
    instructionSet: InstructionSet, cpuRegisters: CpuRegisters,
    symbolTable: SymbolTable,
) => (
    deviceName: string, fullSpec: SpecItems
): void => {
    if (!symbolTable.deviceSymbol("deviceName", deviceName)) {
        return;
    }
    for (const [key, value] of Object.entries(fullSpec)) {
        switch (key) {
            case "unsupportedInstructions":
                instructionSet.unsupportedGroups(value as Array<string>);
                break;
            case "reducedCore":
                instructionSet.reducedCore(value as boolean);
                cpuRegisters.initialise(value as boolean);
                break;
            default:
                symbolTable.deviceSymbol(key, value as number);
                break;
        }
    }
};

export type DeviceSettings = ReturnType<typeof deviceSettings>;
