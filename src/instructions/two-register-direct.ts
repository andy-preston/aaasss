import type { InstructionSet } from "../device/instruction-set.ts";
import { lineWithObjectCode, type LineWithPokedBytes } from "../object-code/line-types.ts";
import type { EncodedInstruction } from "../object-code/object-code.ts";
import { template } from "../object-code/template.ts";
import { validScaledOperands, type Requirements } from "../operands/valid-scaled.ts";

const mapping: Map<string, [string, number]> = new Map([
    ["CPC",  ["0000_01", 1]],
    ["SBC",  ["0000_10", 1]],
    ["ADD",  ["0000_11", 1]], // LSL and
    ["LSL",  ["0000_11", 0]], // ADD are almost the same
    ["CPSE", ["0001_00", 1]],
    ["CP",   ["0001_01", 1]],
    ["SUB",  ["0001_10", 1]],
    ["ADC",  ["0001_11", 1]], // ROL and
    ["ROL",  ["0001_11", 0]], // ADC are almost the same
    ["AND",  ["0010_00", 1]], // TST and
    ["TST",  ["0010_00", 0]], // AND are almost the same
    ["EOR",  ["0010_01", 1]], // CLR and
    ["CLR",  ["0010_01", 0]], // EOR are almost the same
    ["OR",   ["0010_10", 1]],
    ["MOV",  ["0010_11", 1]],
    ["MUL",  ["1001_11", 1]]
]);

export const twoRegisterDirect = (
    line: LineWithPokedBytes
): EncodedInstruction | undefined => {
    const codeGenerator = (_instructionSet: InstructionSet) => {
        const [prefix, secondOperandIndex] = mapping.get(line.mnemonic)!;

        const operandsRequired: Requirements = [
            ["register", "type_register", 0]
        ];
        if (secondOperandIndex == 1) {
            operandsRequired.push(["register", "type_register", 1]);
        }
        const actualOperands = validScaledOperands(line, operandsRequired);

        const code = template(`${prefix}rd dddd_rrrr`, [
            ["d", actualOperands[0]!],
            ["r", actualOperands[secondOperandIndex]!]
        ]);
        return lineWithObjectCode(line, code);
    };

    return mapping.has(line.mnemonic) ? codeGenerator : undefined;
};
