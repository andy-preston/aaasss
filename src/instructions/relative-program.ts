import type { InstructionSet } from "../device/instruction-set.ts";
import type { EncodedInstruction } from "../object-code/data-types.ts";
import type { LineWithPokedBytes } from "../object-code/line-types.ts";
import type { OperandRequirements } from "../operands/valid-scaled.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";

import { lineWithObjectCode } from "../object-code/line-types.ts";
import { template } from "../object-code/template.ts";
import { validScaledOperands } from "../operands/valid-scaled.ts";

const mapping: Map<string, string> = new Map([
    ["RCALL", "1"],
    ["RJMP",  "0"]
]);

export const relativeProgram = (
    line: LineWithPokedBytes
): EncodedInstruction | undefined => {
    const codeGenerator = (
        _instructionSet: InstructionSet, programMemory: ProgramMemory
    ) => {
        const operationBit = mapping.get(line.mnemonic)!;
        const operandRequirements: OperandRequirements = [
            ["number", "type_positive"]
        ];
        const actualOperands = validScaledOperands(line, operandRequirements);
        const address = programMemory.relativeAddress(actualOperands[0]!, 12);
        if (address.type == "failures") {
            line.withFailures(address.it);
        }
        const code = template(`110${operationBit}_aaaa aaaa_aaaa`, {
            "a": address.type == "failures" ? 0 : address.it
        });
        return lineWithObjectCode(line, code);
    };

    return mapping.has(line.mnemonic) ? codeGenerator : undefined;
};
