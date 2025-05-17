import type { InstructionSet } from "../device/instruction-set.ts";
import type { EncodedInstruction } from "../object-code/data-types.ts";
import type { LineWithOperands } from "../operands/line-types.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";

import { codeAsWords } from "../object-code/as-words.ts";
import { lineWithObjectCode } from "../object-code/line-types.ts";

export const nop = (
    line: LineWithOperands
): EncodedInstruction | undefined => {
    const codeGenerator = (
        _instructionSet: InstructionSet, _programMemory: ProgramMemory
    ) => lineWithObjectCode(line, codeAsWords([0, 0].values()));

    return line.mnemonic == "NOP" ? codeGenerator : undefined;
};
