import type { InstructionSet } from "../device/instruction-set.ts";
import type { NumericType } from "../numeric-values/types.ts";
import type { BinaryDigit, EncodedInstruction } from "../object-code/data-types.ts";
import type { LineWithPokedBytes } from "../object-code/line-types.ts";
import type { NumericOperand } from "../operands/data-types.ts";
import type { OperandRequirement } from "../operands/valid-scaled.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";

import { lineWithObjectCode } from "../object-code/line-types.ts";
import { template } from "../object-code/template.ts";
import { validScaledOperands } from "../operands/valid-scaled.ts";

const variations = (hasReducedCore: boolean) => hasReducedCore ? {
    "registerType": "type_registerImmediate" as NumericType,
    "addressType": "type_7BitDataAddress" as NumericType,
    "prefix": "1010_",
    "suffix": "aaa rrrr_aaaa"
} : {
    "registerType": "type_register" as NumericType,
    "addressType": "type_16BitDataAddress" as NumericType,
    "prefix": "1001_00",
    "suffix": "r rrrr_0000 aaaa_aaaa aaaa_aaaa"
};

export const dataDirect = (
    line: LineWithPokedBytes
): EncodedInstruction | undefined => {
    const codeGenerator = (
        instructionSet: InstructionSet, _programMemory: ProgramMemory
    ) => {

        const hasReducedCore = (): boolean => {
            const reducedCore = instructionSet.hasReducedCore();
            if (reducedCore.type == "failures") {
                line.withFailures(reducedCore.it);
                return false;
            }
            return reducedCore.it;
        };

        const templateValues = (load: boolean) => {
            const register: OperandRequirement = ["register", variation.registerType];
            const address: OperandRequirement = ["number", variation.addressType];
            const values = validScaledOperands(
                line,
                load ? [register, address] : [address, register]
            );
            return {
                "register": values[load ? 0 : 1] as NumericOperand,
                "address": values[load ? 1 : 0] as NumericOperand,
                "operation": load ? "0": "1" as BinaryDigit
            };
        };

        const variation = variations(hasReducedCore());
        const values = templateValues(line.mnemonic == "LDS");

        const code = template(
            `${variation.prefix}${values.operation}${variation.suffix}`,
            {"r": values.register, "a": values.address}
        );
        return lineWithObjectCode(line, code);
    };

    return ["LDS", "STS"].includes(line.mnemonic) ? codeGenerator : undefined;
};
