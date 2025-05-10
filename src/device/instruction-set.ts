import type { BooleanOrFailures } from "../failure/bags.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { Mnemonic } from "../tokens/data-types.ts";

import { booleanBag } from "../assembler/bags.ts";
import { bagOfFailures, boringFailure, clueFailure, supportFailure } from "../failure/bags.ts";

// It looks like we're assuming that everything is at least AVRe
const instructionGroups: Map<string, Array<Mnemonic>> = new Map([
    ["FlashMore8",      ["CALL", "JMP"]],
    // AVRe+
    ["multiply",        ["MUL", "MULS", "MULSU", "FMUL", "FMULS", "FMULSU"]],
    ["FlashMore128",    ["EICALL", "EIJMP", "ELPM"]],
    // AVRxm
    ["readModifyWrite", ["LAC", "LAS", "LAT", "XCH"]],
    ["DES",             ["DES"]],
    ["SPM.Z+",          ["SPM.Z+"]],
]);

export const instructionSet = (symbolTable: SymbolTable) => {
    let reducedCore = false;
    let unsupportedInstructions: Array<Mnemonic> = [];

    const deviceNotDefined = () => {
        const deviceName = symbolTable.symbolValue("deviceName");
        return deviceName.type != "string" || deviceName.it == "";
    }

    const hasReducedCore = (): BooleanOrFailures =>
        deviceNotDefined()
            ? bagOfFailures([boringFailure("device_notSelected")])
            : booleanBag(reducedCore);

    const alternatives = (mnemonic: Mnemonic): Mnemonic | undefined => {
        switch (mnemonic) {
            case "CALL":
                return "RCALL";
            case "EICALL":
                return unsupportedInstructions.includes("CALL") ? "RCALL" : "CALL";
            case "JMP":
                return "RJMP";
            case "EIJMP":
                return unsupportedInstructions.includes("JMP") ? "RJMP" : "JMP";
            case "ELPM":
                return "LPM";
        }
        return undefined;
    }

    const isUnsupported = (mnemonic: Mnemonic): BooleanOrFailures =>
        deviceNotDefined()
        ? bagOfFailures([
            boringFailure("device_notSelected"),
            clueFailure("mnemonic_supportedUnknown", mnemonic)
        ])
        : unsupportedInstructions.includes(mnemonic)
        ? bagOfFailures([supportFailure(
            "notSupported_mnemonic", mnemonic, alternatives(mnemonic)
        )])
        : booleanBag(false);

    const unsupportedGroups = (groups: Array<string>) => {
        unsupportedInstructions = groups.flatMap(group => {
            if (!instructionGroups.has(group)) {
                throw new Error(
                    `Unknown unsupported instruction group: ${group}`
                );
            }
            return instructionGroups.get(group)!;
        });
    };

    const setReducedCore = (value: boolean) => {
        reducedCore = value;
    };

    return {
        "reducedCore": setReducedCore,
        "unsupportedGroups": unsupportedGroups,
        "hasReducedCore": hasReducedCore,
        "isUnsupported": isUnsupported,
    };
};

export type InstructionSet = ReturnType<typeof instructionSet>;
