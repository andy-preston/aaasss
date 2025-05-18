import type { InstructionSet } from "../device/instruction-set.ts";
import type { EncodedInstruction } from "../object-code/data-types.ts";
import type { LineWithOperands } from "../operands/line-types.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";

export const nop = (
    line: LineWithOperands
): EncodedInstruction | undefined => {
    const codeGenerator = (
        _instructionSet: InstructionSet, _programMemory: ProgramMemory
    ) => [0];

    return line.mnemonic == "NOP" ? codeGenerator : undefined;
};
