import type { CurrentLine } from "../line/current-line.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";

import { addFailure } from "../failure/add-failure.ts";
import { clueFailure } from "../failure/bags.ts";
import { instructions, lpmImplied, nonReducedCore, withReducedCore } from "./instructions.ts";
import { unsupportedInstructions } from "./unsupported-instructions.ts";

export const instructionSet = (
    currentLine: CurrentLine, symbolTable: SymbolTable
) => {
    const unsupported = unsupportedInstructions(symbolTable);
    let variations = nonReducedCore;

    const reducedCore = (value: boolean) => {
        if (value) {
            variations = withReducedCore;
        }
    };

    const instruction = () => {
        if (unsupported.isIt(currentLine())) {
            return undefined;
        }

        const templateAndOperands =
            ["LPM", "ELPM"].includes(currentLine().mnemonic)
            && currentLine().operands.length == 0
            ? lpmImplied[currentLine().mnemonic]
            : currentLine().mnemonic in variations
            ? variations[currentLine().mnemonic]
            : instructions[currentLine().mnemonic];

        if (templateAndOperands == undefined) {
            addFailure(currentLine().failures, clueFailure(
                "mnemonic_unknown", currentLine().mnemonic
            ));
        }

        return templateAndOperands;
    };

    return {
        "reducedCore": reducedCore,
        "unsupportedGroups": unsupported.groups,
        "instruction": instruction,
    };
};

export type InstructionSet = ReturnType<typeof instructionSet>;
