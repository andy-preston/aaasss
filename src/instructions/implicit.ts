import type { InstructionSet } from "../device/instruction-set.ts";
import type { Line } from "../line/line-types.ts";
import type { EncodedInstruction } from "../object-code/data-types.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";

import { validScaledOperands } from "../operands/valid-scaled.ts";
import { template } from "../object-code/template.ts";

const mapping: Map<string, string> = new Map([
    ["BREAK",  "1001_0101 1001_1000"],
    ["NOP",    "0000_0000 0000_0000"],
    ["RET",    "1001_0101 0000_1000"],
    ["RETI",   "1001_0101 0001_1000"],
    ["SLEEP",  "1001_0101 1000_1000"],
    ["WDR",    "1001_0101 1010_1000"],
    // Indirect Program Addressing
    ["IJMP",   "1001_0100 0000_1001"],
    ["EIJMP",  "1001_0100 0001_1001"],
    ["ICALL",  "1001_0101 0000_1001"],
    ["EICALL", "1001_0101 0001_1001"]
]);

export const implicit = (line: Line): EncodedInstruction | undefined => {
    const codeGenerator = (
        _instructionSet: InstructionSet, _programMemory: ProgramMemory
    ) => {
        validScaledOperands(line, []);
        return template(mapping.get(line.mnemonic)!, {});
    };

    return mapping.has(line.mnemonic) ? codeGenerator : undefined;
};
