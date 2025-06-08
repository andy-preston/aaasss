import type { StringOrFailures } from "../failure/bags.ts";
import type { InstructionSet } from "../instruction-set/instruction-set.ts";
import type { CpuRegisters } from "../registers/cpu-registers.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { SpecItems } from "./data-types.ts";

import { emptyBag, numberBag, stringBag } from "../assembler/bags.ts";
import { bagOfFailures } from "../failure/bags.ts";

export const deviceSettings = (
    instructionSet: InstructionSet, cpuRegisters: CpuRegisters,
    symbolTable: SymbolTable,
) => (
    deviceName: string, fullSpec: SpecItems
): StringOrFailures => {
    const setDevice = symbolTable.deviceSymbol(
        "deviceName", stringBag(deviceName)
    );
    if (setDevice.type == "failures") {
        return bagOfFailures(setDevice.it);
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
                symbolTable.deviceSymbol(key, numberBag(value as number));
                break;
        }
    }
    return emptyBag();
};

export type DeviceSettings = ReturnType<typeof deviceSettings>;
