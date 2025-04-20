import type { InstructionSet } from "../device/instruction-set.ts";
import { lineWithObjectCode, type LineWithPokedBytes } from "../object-code/line-types.ts";
import type { EncodedInstruction } from "../object-code/object-code.ts";
import { template } from "../object-code/template.ts";
import { validScaledOperands, type OperandRequirements } from "../operands/valid-scaled.ts";

const mapping: Map<string, string> = new Map([
    ["CPI",  "0011"],
    ["SBCI", "0100"],
    ["SUBI", "0101"],
    ["ORI",  "0110"], // SBR and
    ["SBR",  "0110"], //   ORI are the same instruction
    ["ANDI", "0111"], // CBR and
    ["CBR",  "0111"], //   ANDI are ALMOST the same instruction
    ["LDI",  "1110"], // SER and
    ["SER",  "1110"]  //   LDI are ALMOST the same instruction
]);

export const byteImmediate = (
    line: LineWithPokedBytes
): EncodedInstruction | undefined => {
    const codeGenerator = (_instructionSet: InstructionSet) => {
        const operandRequirements: OperandRequirements = [
            ["register", "type_registerImmediate", 0]
        ];
        if (line.mnemonic != "SER") {
            operandRequirements.push(["number", "type_byte", 1]);
        }
        const actualOperands = validScaledOperands(line, operandRequirements);
        const register = actualOperands[0]!;

        const byte =
            // Set all bits is basically an LDI with FF
            line.mnemonic == "SER" ? 0xff
            // Clear bits is an AND with the inverse of the operand
            : line.mnemonic == "CBR" ? 0xff - actualOperands[1]!
            // All the other instructions just have "sensible" operands
            : actualOperands[1]!;

        const prefix = mapping.get(line.mnemonic)!;
        const code = template(`${prefix}_KKKK dddd_KKKK`, [
            ["d", register], ["K", byte]
        ]);
        return lineWithObjectCode(line, code);
    };

    return mapping.has(line.mnemonic) ? codeGenerator : undefined;
};
