import type { InstructionSet } from "../device/instruction-set.ts";
import type { BinaryDigit, EncodedInstruction } from "../object-code/data-types.ts";
import type { LineWithPokedBytes } from "../object-code/line-types.ts";
import type { NumericOperand } from "../operands/data-types.ts";
import type { OperandRequirement } from "../operands/valid-scaled.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";

import { lineWithObjectCode } from "../object-code/line-types.ts";
import { template } from "../object-code/template.ts";
import { validScaledOperands } from "../operands/valid-scaled.ts";

export const ioByte = (
    line: LineWithPokedBytes
): EncodedInstruction | undefined => {
    const codeGenerator = (
        _instructionSet: InstructionSet, _programMemory: ProgramMemory
    ) => {
        const templateValues = (input: boolean) => {
            const register: OperandRequirement = ["register", "type_register"];
            const address: OperandRequirement = ["number", "type_ioPort"];
            const values = validScaledOperands(
                line,
                input ? [register, address] : [address, register]
            );
            return {
                "register": values[input ? 0 : 1] as NumericOperand,
                "address": values[input ? 1 : 0] as NumericOperand,
                "operation": input ? "0": "1" as BinaryDigit
            };
        };
        const values = templateValues(line.mnemonic == "IN")
        const code = template(
            `1011_${values.operation}aar rrrr_aaaa`,
            {"r": values.register, "a": values.address}
        );
        return lineWithObjectCode(line, code);
    };

    return ["IN", "OUT"].includes(line.mnemonic) ? codeGenerator : undefined;
};
