import type { InstructionSet } from "../device/instruction-set.ts";
import type { Code } from "../object-code/data-types.ts";
import type { LineWithPokedBytes } from "../object-code/line-types.ts";
import type { EncodedInstruction } from "../object-code/object-code.ts";

import { lineWithObjectCode } from "../object-code/line-types.ts";
import { template } from "../object-code/template.ts";
import { validScaledOperands } from "../operands/valid-scaled.ts";

export const des = (
    line: LineWithPokedBytes
): EncodedInstruction | undefined => {
    const codeGenerator = (_instructionSet: InstructionSet) => {
        const [value] = validScaledOperands(line, [["number", "type_nybble"]]);
        const code: Code = template("1001_0100 vvvv_1011", {"v": value!});
        return lineWithObjectCode(line, code);
    };

    return line.mnemonic == "DES" ? codeGenerator : undefined;
};
