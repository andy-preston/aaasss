import type { InstructionSet } from "../device/instruction-set.ts";
import { lineWithObjectCode, type LineWithPokedBytes } from "../object-code/line-types.ts";
import type { EncodedInstruction } from "../object-code/object-code.ts";
import { template } from "../object-code/template.ts";
import { validScaledOperands } from "../operands/valid-scaled.ts";

const mapping: Map<string, string> = new Map([
    ["BLD",  "00"],
    ["BST",  "01"],
    ["SBRC", "10"],
    ["SBRS", "11"]
]);

export const singleRegisterBit = (
    line: LineWithPokedBytes
): EncodedInstruction | undefined => {
    const codeGenerator = (_instructionSet: InstructionSet) => {
        const actualOperands = validScaledOperands(line, [
            ["register", "type_register", 0],
            ["number",   "type_bitIndex", 1]
        ]);
        const operationBits = mapping.get(line.mnemonic)!;
        // In the official documentation, some of these have
        // "#### ###r rrrr #bbb" as their template rather than "d dddd".
        // e.g. `BLD Rd, b` has "d dddd" but `SBRS Rd, b` has "r rrrr".
        const code = template(`1111_1${operationBits}d dddd_0bbb`, [
            ["d", actualOperands[0]!],
            ["b", actualOperands[1]!]
        ]);
        return lineWithObjectCode(line, code);
    };

    return mapping.has(line.mnemonic) ? codeGenerator : undefined;
};
