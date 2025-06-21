import type { InstructionSet } from "../instruction-set/instruction-set.ts";
import type { InstructionOperands } from "../operands/data-types.ts";
import type { Operands } from "../operands/operands.ts";

import { template } from "./template.ts";

export const encoder = (instructionSet: InstructionSet, operands: Operands) => {

    const operandMap = (
        requirements: InstructionOperands | undefined
    ): Record<string, number> => {
        const requiredTypes = requirements == undefined ? []
            : Object.values(requirements);
        const actualOperands = operands(requiredTypes);

        if (requirements == undefined) {
            return {};
        }

        const map: Record<string, number> = {};
        Object.keys(requirements).forEach((operand, index) => {
            operand.split("").forEach(templateOperand => {
                map[templateOperand] = actualOperands[index]!;
            });
        });
        return map;
    };

    return () => {
        const templateAndOperands = instructionSet.instruction();
        if (templateAndOperands == undefined) {
            return;
        }

        const [templateString, operandRequirements] = templateAndOperands;
        return template(templateString, operandMap(operandRequirements));
    };
};
