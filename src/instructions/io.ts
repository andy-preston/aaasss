import type { InstructionSet } from "../device/instruction-set.ts";
import type { SupportFailure } from "../failure/bags.ts";
import type { BinaryDigit, EncodedInstruction } from "../object-code/data-types.ts";
import type { LineWithPokedBytes } from "../object-code/line-types.ts";
import type { NumericOperand } from "../operands/data-types.ts";
import type { OperandRequirement } from "../operands/valid-scaled.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";

import { supportFailure } from "../failure/bags.ts";
import { lineWithObjectCode } from "../object-code/line-types.ts";
import { template } from "../object-code/template.ts";
import { validScaledOperands } from "../operands/valid-scaled.ts";

const alternatives = new Map([
    ["SBI", "SBR & STS"],
    ["SBIC", "LDS & SBRC"],
    ["SBIS", "LDS & SBRS"],
    ["CBI", "CBR & STS"],
    ["IN", "LDS"],
    ["OUT", "STS"]
]);

const bitMapping: Map<string, string> = new Map([
    ["SBI", "10"],
    ["CBI", "00"],
    ["SBIC", "01"],
    ["SBIS", "11"]
]);

const hints = (
    line: LineWithPokedBytes
): Array<SupportFailure> | undefined => line.failures().reduce(
    (
        result: Array<SupportFailure> | undefined, failure, _index
    ) => failure.kind != "type_ioPort" ? result : [supportFailure(
        "notSupported_ioRange", line.mnemonic, alternatives.get(line.mnemonic)
    )], undefined
);

export const ioBit = (
    line: LineWithPokedBytes
): EncodedInstruction | undefined => {
    const codeGenerator = (
        _instructionSet: InstructionSet, _programMemory: ProgramMemory
    ) => {
        const operationBits = bitMapping.get(line.mnemonic)!;
        const [address, bitIndex] = validScaledOperands(line, [
            ["number", "type_ioPort"],
            ["number", "type_bitIndex"]
        ]);

        const additionalHints = hints(line);
        if (additionalHints != undefined) {
            line.withFailures(additionalHints);
        }

        const code = template(
            `1001_10${operationBits} aaaa_abbb`,
            {"a": address, "b": bitIndex}
        );
        return lineWithObjectCode(line, code);
    };

    return bitMapping.has(line.mnemonic) ? codeGenerator : undefined;
};

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

        const additionalHints = hints(line);
        if (additionalHints != undefined) {
            line.withFailures(additionalHints);
        }

        const code = template(
            `1011_${values.operation}aar rrrr_aaaa`,
            {"r": values.register, "a": values.address}
        );
        return lineWithObjectCode(line, code);
    };

    return ["IN", "OUT"].includes(line.mnemonic) ? codeGenerator : undefined;
};
