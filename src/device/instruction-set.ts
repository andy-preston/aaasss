import { booleanBag } from "../assembler/bags.ts";
import { bagOfFailures, boringFailure, clueFailure, type BooleanOrFailures } from "../failure/bags.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { Mnemonic } from "../tokens/data-types.ts";

const instructionGroups: Map<string, Array<Mnemonic>> = new Map([
    ["multiply", ["MUL", "MULS", "MULSU", "FMUL", "FMULS", "FMULSU"]],
    ["readModifyWrite", ["LAC", "LAS", "LAT", "XCH"]],
    ["DES", ["DES"]],
    ["FlashMore128", ["EICALL", "EIJMP"]],
    ["FlashMore8", ["CALL", "JMP"]],
    // We need to understand this better to explain WHY some devices have
    // SPM but not SPM.Z
    ["SPM.Z", ["SPM.Z"]],
    // ELPM needs more study!
    ["ELPM", ["ELPM", "ELPM.Z"]],
]);

export const instructionSet = (symbolTable: SymbolTable) => {
    let reducedCore = false;
    let unsupportedInstructions: Array<Mnemonic> = [];

    const deviceIsDefined = () => {
        const deviceName = symbolTable.symbolValue("deviceName");
        return deviceName.type == "string" && deviceName.it != "";
    }

    const hasReducedCore = (): BooleanOrFailures =>
        deviceIsDefined()
            ? booleanBag(reducedCore)
            : bagOfFailures([boringFailure("device_notSelected")]);

    const unsupportedGroups = (groups: Array<string>) => {
        unsupportedInstructions = groups.flatMap((group) => {
            if (!instructionGroups.has(group)) {
                throw new Error(
                    `Unknown unsupported instruction group: ${group}`
                );
            }
            return instructionGroups.get(group)!;
        });
    };

    const isUnsupported = (mnemonic: Mnemonic): BooleanOrFailures =>
        !deviceIsDefined()
            ? bagOfFailures([
                boringFailure("device_notSelected"),
                clueFailure("mnemonic_supportedUnknown", mnemonic)
            ])
            : unsupportedInstructions.includes(mnemonic)
            ? bagOfFailures([clueFailure("mnemonic_notSupported", mnemonic)])
            : booleanBag(false);

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
