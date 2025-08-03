import type { CurrentLine } from "../assembler/line.ts";
import type { InstructionOperands } from "../operands/data-types.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";

import { clueFailure } from "../failure/failures.ts";
import { instructions, lpmImplied, nonReducedCore, withReducedCore } from "./instructions.ts";
import { unsupportedInstructions } from "./unsupported-instructions.ts";

export const instructionSet = (
    currentLine: CurrentLine, symbolTable: SymbolTable
) => {
    const unsupported = unsupportedInstructions(symbolTable);
    let reducedCoreVariations = nonReducedCore;

    const reducedCore = (isIt: boolean) => {
        reducedCoreVariations = isIt ? withReducedCore : nonReducedCore;
    };

    const instruction = (): [string, InstructionOperands?] | undefined => {
        if (unsupported.isIt(currentLine())) {
            return undefined;
        }

        const templateAndOperands =
            currentLine().mnemonic in lpmImplied
                && currentLine().operands.length == 0
            ? lpmImplied[currentLine().mnemonic]
            : currentLine().mnemonic in reducedCoreVariations
            ? reducedCoreVariations[currentLine().mnemonic]
            : instructions[currentLine().mnemonic];

        if (templateAndOperands == undefined) {
            currentLine().failures(clueFailure(
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
