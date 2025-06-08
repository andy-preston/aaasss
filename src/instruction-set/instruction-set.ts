import type { Line } from "../line/line-types.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";

import { clueFailure } from "../failure/bags.ts";
import { instructions, lpmImplied, nonReducedCore, withReducedCore } from "./instructions.ts";
import { unsupportedInstructions } from "./unsupported-instructions.ts";

export const instructionSet = (symbolTable: SymbolTable) => {
    const unsupported = unsupportedInstructions(symbolTable);
    let variations = nonReducedCore;

    const reducedCore = (value: boolean) => {
        if (value) {
            variations = withReducedCore;
        }
    };

    const instruction = (line: Line) => {
        if (unsupported.isIt(line)) {
            return undefined;
        }

        const templateAndOperands =
            ["LPM", "ELPM"].includes(line.mnemonic)
            && line.symbolicOperands.length == 0
            ? lpmImplied[line.mnemonic]
            : line.mnemonic in variations
            ? variations[line.mnemonic]
            : instructions[line.mnemonic];

        if (templateAndOperands == undefined) {
            line.failures.push(clueFailure("mnemonic_unknown", line.mnemonic));
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
