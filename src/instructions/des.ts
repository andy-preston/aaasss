import type { InstructionSet } from "../device/instruction-set.ts";
import type { Line } from "../line/line-types.ts";
import type { EncodedInstruction } from "../object-code/data-types.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";

import { template } from "../object-code/template.ts";
import { validScaledOperands } from "../operands/valid-scaled.ts";

export const des = (line: Line): EncodedInstruction | undefined => {
    const codeGenerator = (
        _instructionSet: InstructionSet, _programMemory: ProgramMemory
    ) => {
        const [value] = validScaledOperands(line, [["number", "type_nybble"]]);
        return template("1001_0100 vvvv_1011", {"v": value!});
    };

    return line.mnemonic == "DES" ? codeGenerator : undefined;
};
