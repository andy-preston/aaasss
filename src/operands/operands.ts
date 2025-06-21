import type { JsExpression } from "../javascript/expression.ts";
import type { CurrentLine } from "../line/current-line.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";
import type { CpuRegisters } from "../registers/cpu-registers.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { OperandType } from "./data-types.ts";

import { addFailure } from "../failure/add-failure.ts";
import { assertionFailure } from "../failure/bags.ts";
import { scale } from "./scale.ts";
import { numeric } from "./numeric.ts";
import { range } from "./range.ts";

export const operands = (
    currentLine: CurrentLine,
    symbolTable: SymbolTable, cpuRegisters: CpuRegisters,
    programMemory: ProgramMemory, jsExpression: JsExpression
) => {
    const converted = numeric(symbolTable, cpuRegisters, jsExpression);
    const scaled = scale(programMemory);

    const optional = (requiredTypes: Array<OperandType>) => {
        const count = requiredTypes.filter(
            requiredType => requiredType.startsWith("optional")
        ).length;
        if (count > 1 || (count > 0 && requiredTypes.length != 1)) {
            throw new Error(
                "It's expected that if there are optional operands, there will only be 1"
            );
        }
        return count == 1;
    };

    const lengthMatchCheck = (requiredTypes: Array<OperandType>) => {
        const actualLength = currentLine().operands.length;
        if (optional(requiredTypes)) {
            if (![0, 1].includes(actualLength)) {
                addFailure(currentLine().failures, assertionFailure(
                    "operand_count", "0/1", `${actualLength}`
                ));
            }
        } else {
            if (requiredTypes.length != actualLength) {
                addFailure(currentLine().failures, assertionFailure(
                    "operand_count", `${requiredTypes.length}`, `${actualLength}`
                ));
            }
        }
    };

    return (requiredTypes: Array<OperandType>): Array<number> => {
        lengthMatchCheck(requiredTypes);

        return requiredTypes.map((requiredType, index) => {
            const numeric = converted(
                currentLine().operands[index], requiredType
            );
            if (typeof numeric != "number") {
                numeric.location = {"operand": index + 1};
                addFailure(currentLine().failures, numeric);
                return 0;
            }

            const invalid = range(numeric, requiredType);
            if (invalid) {
                invalid.location = {"operand": index + 1};
                addFailure(currentLine().failures, invalid);
                return 0;
            }

            const result = scaled(numeric, requiredType);
            if (typeof result == "number") {
                return result;
            }
            result.location = {operand: index + 1};
            addFailure(currentLine().failures, result);
            return 0;
        });
    };
};

export type Operands = ReturnType<typeof operands>;
