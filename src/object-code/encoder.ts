import type { InstructionSet } from "../instruction-set/instruction-set.ts";
import type { Line } from "../line/line-types.ts";
import type { InstructionOperands } from "../operands/data-types.ts";
import type { Operands } from "../operands/operands.ts";

import { template } from "./template.ts";

export const encoder = (instructionSet: InstructionSet, operands: Operands) => {

    const operandMap = (
        line: Line, requirements: InstructionOperands | undefined
    ): Record<string, number> => {
        const requiredTypes = requirements == undefined ? []
            : Object.values(requirements);
        ////////////////////////////////////////////////////////////////////
        //
        // make sure this is tested with zero requirements and
        // zero (passing) or some (failing) actual operands
        //
        ////////////////////////////////////////////////////////////////////
        const actualOperands = operands(line, requiredTypes);

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

    return (line: Line) => {
        const templateAndOperands = instructionSet.instruction(line);
        if (templateAndOperands == undefined) {
            return;
        }

        const [templateString, operandRequirements] = templateAndOperands;
        return template(templateString, operandMap(line, operandRequirements));
    };
};
