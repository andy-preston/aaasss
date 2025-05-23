import type { InstructionSet } from "../device/instruction-set.ts";
import type { EncodedInstruction } from "../object-code/data-types.ts";
import type { LineWithOperands } from "../operands/line-types.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";

import { lineWithObjectCode } from "../object-code/line-types.ts";
import { template } from "../object-code/template.ts";
import { validScaledOperands } from "../operands/valid-scaled.ts";

const mapping: Map<string, string> = new Map([
    ["BLD",  "00"],
    ["BST",  "01"],
    ["SBRC", "10"],
    ["SBRS", "11"]
]);

export const singleRegisterBit = (
    line: LineWithOperands
): EncodedInstruction | undefined => {
    const codeGenerator = (
        _instructionSet: InstructionSet, _programMemory: ProgramMemory
    ) => {
        const [register, bit] = validScaledOperands(line, [
            ["register", "type_register"],
            ["number",   "type_bitIndex"]
        ]);
        const operationBits = mapping.get(line.mnemonic)!;
        const codeGenerator = template(
            `1111_1${operationBits}r rrrr_0vvv`, {"r": register, "v": bit}
        );
        return lineWithObjectCode(line, codeGenerator);
    };

    return mapping.has(line.mnemonic) ? codeGenerator : undefined;
};
