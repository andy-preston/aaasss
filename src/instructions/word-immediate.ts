import type { InstructionSet } from "../device/instruction-set.ts";
import type { Line } from "../line/line-types.ts";
import type { EncodedInstruction } from "../object-code/data-types.ts";
import type { OperandRequirements } from "../operands/valid-scaled.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";

import { validScaledOperands } from "../operands/valid-scaled.ts";
import { template } from "../object-code/template.ts";

const mapping: Map<string, string> = new Map([
    ["ADIW", "0"],
    ["SBIW", "1"]
]);

export const wordImmediate = (line: Line): EncodedInstruction | undefined => {
    const codeGenerator = (
        _instructionSet: InstructionSet, _programMemory: ProgramMemory
    ) => {
        const operandRequirements: OperandRequirements = [
            ["register", "type_registerPair"],
            ["number",   "type_6Bits"]
        ];
        const actualOperands = validScaledOperands(line, operandRequirements);
        const registerPair = actualOperands[0]!;
        const sixBits = actualOperands[1]!
        const operationBit = mapping.get(line.mnemonic)!;
        return template(
            `1001_011${operationBit} vvrr_vvvv`, {
                "r": registerPair, "v": sixBits
            }
        );
    };

    return mapping.has(line.mnemonic) ? codeGenerator : undefined;
};
