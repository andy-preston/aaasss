import type { InstructionSet } from "../device/instruction-set.ts";
import { lineWithObjectCode, type LineWithPokedBytes } from "../object-code/line-types.ts";
import type { EncodedInstruction } from "../object-code/object-code.ts";
import { template } from "../object-code/template.ts";
import { validScaledOperands, type Requirements } from "../operands/valid-scaled.ts";

const mapping: Map<string, [string, number?]> = new Map([
    ["BCLR", ["1", undefined]],
    ["CLC", ["1", 0]],
    ["CLZ", ["1", 1]],
    ["CLN", ["1", 2]],
    ["CLV", ["1", 3]],
    ["CLS", ["1", 4]],
    ["CLH", ["1", 5]],
    ["CLT", ["1", 6]],
    ["CLI", ["1", 7]],
    ["BSET", ["0", undefined]],
    ["SEC", ["0", 0]],
    ["SEZ", ["0", 1]],
    ["SEN", ["0", 2]],
    ["SEV", ["0", 3]],
    ["SES", ["0", 4]],
    ["SEH", ["0", 5]],
    ["SET", ["0", 6]],
    ["SEI", ["0", 7]]
]);

export const statusManipulation = (
    line: LineWithPokedBytes
): EncodedInstruction | undefined => {
    const codeGenerator = (_instructionSet: InstructionSet) => {
        const [operationBit, impliedOperand] = mapping.get(line.mnemonic)!;

        const operandsRequired: Requirements = impliedOperand == undefined
            ? [["number", "type_bitIndex", 0]]
            : [];
        const actualOperands = validScaledOperands(line, operandsRequired);
        const operand = impliedOperand == undefined
            ? actualOperands[0]
            : impliedOperand;

        const code = template(`1001_0100 ${operationBit}sss_1000`, [
            ["s", operand!]
        ]);
        return lineWithObjectCode(line, code);
    };

    return mapping.has(line.mnemonic) ? codeGenerator : undefined;
};
