import type { InstructionSet } from "../device/instruction-set.ts";
import type { EncodedInstruction } from "../object-code/data-types.ts";
import type { LineWithOperands } from "../operands/line-types.ts";
import type { OperandRequirements } from "../operands/valid-scaled.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";

import { template } from "../object-code/template.ts";
import { validScaledOperands } from "../operands/valid-scaled.ts";

const mapping: Map<string, [string, number?]> = new Map([
    ["BRBC", ["1", undefined]],
    ["BRSH", ["1", 0]],
    ["BRCC", ["1", 0]],
    ["BRNE", ["1", 1]],
    ["BRPL", ["1", 2]],
    ["BRVC", ["1", 3]],
    ["BRGE", ["1", 4]],
    ["BRHC", ["1", 5]],
    ["BRTC", ["1", 6]],
    ["BRID", ["1", 7]],
    ["BRBS", ["0", undefined]],
    ["BRCS", ["0", 0]],
    ["BRLO", ["0", 0]],
    ["BREQ", ["0", 1]],
    ["BRMI", ["0", 2]],
    ["BRVS", ["0", 3]],
    ["BRLT", ["0", 4]],
    ["BRHS", ["0", 5]],
    ["BRTS", ["0", 6]],
    ["BRIE", ["0", 7]]
]);

export const branchOnStatus = (
    line: LineWithOperands
): EncodedInstruction | undefined => {
    const codeGenerator = (
        _instructionSet: InstructionSet, programMemory: ProgramMemory
    ) => {
        const [operationBit, impliedBit] = mapping.get(line.mnemonic)!;
        const operandRequirements: OperandRequirements =
            impliedBit == undefined ? [["number", "type_bitIndex"]] : [];
        operandRequirements.push(["number", "type_positive"]);
        const actualOperands = validScaledOperands(line, operandRequirements);
        const relativeAddress = programMemory.relativeAddress(
            actualOperands[impliedBit == undefined ? 1 : 0]!, 7
        );
        if (relativeAddress.type == "failures") {
            line.withFailures(relativeAddress.it);
        }
        return template(`1111_0${operationBit}aa aaaa_abbb`, {
            "a": relativeAddress.type == "failures" ? 0 : relativeAddress.it,
            "b": impliedBit == undefined ? actualOperands[0] : impliedBit
        });
    };

    return mapping.has(line.mnemonic) ? codeGenerator : undefined;
};
