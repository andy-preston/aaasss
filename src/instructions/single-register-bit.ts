import type { InstructionSet } from "../device/instruction-set.ts";
import type { Line } from "../line/line-types.ts";
import type { EncodedInstruction } from "../object-code/data-types.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";

import { template } from "../object-code/template.ts";
import { validScaledOperands } from "../operands/valid-scaled.ts";

const mapping: Map<string, string> = new Map([
    ["BLD",  "00"],
    ["BST",  "01"],
    ["SBRC", "10"],
    ["SBRS", "11"]
]);

export const singleRegisterBit = (line: Line): EncodedInstruction | undefined => {
    const codeGenerator = (
        _instructionSet: InstructionSet, _programMemory: ProgramMemory
    ) => {
        const [register, bit] = validScaledOperands(line, [
            ["register", "type_register"],
            ["number",   "type_bitIndex"]
        ]);
        const operationBits = mapping.get(line.mnemonic)!;
        return template(
            `1111_1${operationBits}r rrrr_0vvv`, {"r": register, "v": bit}
        );
    };

    return mapping.has(line.mnemonic) ? codeGenerator : undefined;
};
