import type { InstructionSet } from "../device/instruction-set.ts";
import type { EncodedInstruction } from "../object-code/data-types.ts";
import type { LineWithOperands } from "../operands/line-types.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";

import { lineWithObjectCode } from "../object-code/line-types.ts";
import { template } from "../object-code/template.ts";
import { validScaledOperands } from "../operands/valid-scaled.ts";

export const des = (
    line: LineWithOperands
): EncodedInstruction | undefined => {
    const codeGenerator = (
        _instructionSet: InstructionSet, _programMemory: ProgramMemory
    ) => {
        const [value] = validScaledOperands(line, [["number", "type_nybble"]]);
        const codeGenerator = template("1001_0100 vvvv_1011", {"v": value!});
        return lineWithObjectCode(line, codeGenerator);
    };

    return line.mnemonic == "DES" ? codeGenerator : undefined;
};
