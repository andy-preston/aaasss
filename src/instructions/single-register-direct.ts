import type { InstructionSet } from "../device/instruction-set.ts";
import { lineWithObjectCode, type LineWithPokedBytes } from "../object-code/line-types.ts";
import type { EncodedInstruction } from "../object-code/object-code.ts";
import { template } from "../object-code/template.ts";
import { validScaledOperands, type OperandRequirements } from "../operands/valid-scaled.ts";
import { validSymbolic } from "../operands/valid-symbolic.ts";

const mapping: Map<string, [string, string]> = new Map([
    ["POP",  ["00", "1111"]],
    ["LAC",  ["01", "0110"]],
    ["XCH",  ["01", "0100"]],
    ["LAS",  ["01", "0101"]],
    ["LAT",  ["01", "0111"]],
    ["COM",  ["10", "0000"]],
    ["NEG",  ["10", "0001"]],
    ["SWAP", ["10", "0010"]],
    ["INC",  ["10", "0011"]],
    ["ASR",  ["10", "0101"]],
    ["LSR",  ["10", "0110"]],
    ["ROR",  ["10", "0111"]],
    ["DEC",  ["10", "1010"]],
    ["PUSH", ["01", "1111"]]
]);

export const singleRegisterDirect = (
    line: LineWithPokedBytes
): EncodedInstruction | undefined => {

    const codeGenerator = (_instructionSet: InstructionSet) => {
        const usesZ = ["LAC", "LAS", "LAT", "XCH"].includes(line.mnemonic);
        const registerPosition = usesZ ? 1 : 0;
        const operandRequirements: OperandRequirements =
            usesZ ? [["index", "type_nothing", 0]] : [];
        operandRequirements.push(
            ["register", "type_register", registerPosition]
        );
        const actualOperands = validScaledOperands(line, operandRequirements);
        if (usesZ) {
            validSymbolic(line, [ ["Z"], [] ]);
        }
        const [operationBits, suffix] = mapping.get(line.mnemonic)!;
        // In the official documentation, some of these have
        // "#### ###r rrrr ####" as their template rather than "d dddd".
        // e.g. `SWAP Rd` has "d dddd" but `LAC Rd` has "r rrrr".
        const code = template(`1001_0${operationBits}d dddd_${suffix}`, [
            ["d", actualOperands[registerPosition]!]
        ]);
        return lineWithObjectCode(line, code);
    };

    return mapping.has(line.mnemonic) ? codeGenerator : undefined;
};
