import type { Line } from "../assembler/line.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { Mnemonic } from "../tokens/data-types.ts";

import { addFailure } from "../failure/add-failure.ts";
import { boringFailure, clueFailure, supportFailure } from "../failure/bags.ts";
import { simpleAlternatives } from "./alternatives.ts";

// It looks like we're assuming that everything is at least AVRe
export const instructionGroups: Map<string, Array<Mnemonic>> = new Map([
    ["flashMore8",      ["CALL", "JMP"]],
    // AVRe+
    ["multiply",        ["MUL", "MULS", "MULSU", "FMUL", "FMULS", "FMULSU"]],
    ["flashMore128",    ["EICALL", "EIJMP", "ELPM"]],
    // AVRxm
    ["readModifyWrite", ["LAC", "LAS", "LAT", "XCH"]],
    ["DES",             ["DES"]],
    ["SPM.Z+",          ["SPM.Z+"]],
]);

export const unsupportedInstructions = (symbolTable: SymbolTable) => {
    let unsupportedInstructions: Array<Mnemonic> = [];

    const groups = (groups: Array<string>) => {
        unsupportedInstructions = groups.flatMap(group => {
            if (!instructionGroups.has(group)) {
                throw new Error(
                    `Unknown unsupported instruction group: ${group}`
                );
            }
            return instructionGroups.get(group)!;
        });
    };

    const isIt = (line: Line): boolean => {

        const deviceDefined = (): boolean => {
            const deviceName = symbolTable.internalValue("deviceName");
            if (typeof deviceName == "string" && deviceName != "") {
                return true;
            }

            addFailure(line.failures, boringFailure(
                "device_notSelected"
            ));
            addFailure(line.failures, clueFailure(
                "mnemonic_supportedUnknown", line.mnemonic
            ));
            return false;
        }

        const whatIsUnsupported = (): string => {
            if (unsupportedInstructions.includes(line.mnemonic)) {
                return line.mnemonic;
            }

            // I think this is just to test for "SPM.Z+"
            // But others might come later????
            const withOperands = [
                line.mnemonic, line.operands
            ].flat().join(".");
            return unsupportedInstructions.includes(withOperands)
                ? withOperands : "";
        }

        if (!deviceDefined()) {
            return false;
        }

        const unsupported = whatIsUnsupported();
        if (unsupported == "") {
            return false;
        }

        addFailure(line.failures, supportFailure(
            "notSupported_mnemonic",
            unsupported, simpleAlternatives[unsupported]
        ));
        return true;
    };

    return {"groups": groups, "isIt": isIt};
};
