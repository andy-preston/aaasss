import type { InstructionSet } from "../device/instruction-set.ts";
import type { Line } from "../line/line-types.ts";
import type { EncodedInstruction } from "../object-code/data-types.ts";
import type { OperandRequirements } from "../operands/valid-scaled.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";

import { template } from "../object-code/template.ts";
import { validScaledOperands } from "../operands/valid-scaled.ts";
import { validSymbolic } from "../operands/valid-symbolic.ts";

const mapping: Map<string, [string, string, boolean]> = new Map([
    ["ASR",  ["10", "0101", false]],
    ["COM",  ["10", "0000", false]],
    ["DEC",  ["10", "1010", false]],
    ["INC",  ["10", "0011", false]],
    ["LAC",  ["01", "0110", true]],
    ["LAS",  ["01", "0101", true]],
    ["LAT",  ["01", "0111", true]],
    ["LSR",  ["10", "0110", false]],
    ["NEG",  ["10", "0001", false]],
    ["POP",  ["00", "1111", false]],
    ["PUSH", ["01", "1111", false]],
    ["ROR",  ["10", "0111", false]],
    ["SWAP", ["10", "0010", false]],
    ["XCH",  ["01", "0100", true]]
]);

export const singleRegisterDirect = (line: Line): EncodedInstruction | undefined => {

    const codeGenerator = (
        _instructionSet: InstructionSet, _programMemory: ProgramMemory
    ) => {
        const [operationBits, suffix, readModifyWrite] =
            mapping.get(line.mnemonic)!;

        if (readModifyWrite) {
            validSymbolic(line, [["Z"], []]);
        }
        const operandRequirements: OperandRequirements = readModifyWrite
            ? [["index", "type_anything"]]
            : [];
        operandRequirements.push(["register", "type_register"]);

        const actualOperands = validScaledOperands(line, operandRequirements);
        const register = actualOperands[readModifyWrite ? 1 : 0]!;

        return template(
            `1001_0${operationBits}r rrrr_${suffix}`, {"r": register}
        );
    };

    return mapping.has(line.mnemonic) ? codeGenerator : undefined;
};
