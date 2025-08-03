import type { CurrentLine } from "../assembler/line.ts";
import type { JsExpression } from "../javascript/expression.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";
import type { CpuRegisters } from "../registers/cpu-registers.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { Conversion, OperandType } from "./data-types.ts";

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
    let indexOffsetAt = -1;

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
            const requiredLength = indexOffsetAt < 0
                ? requiredTypes.length
                : requiredTypes.length - 1;
            if (requiredLength != actualLength) {
                addFailure(currentLine().failures, assertionFailure(
                    "operand_count", `${requiredTypes.length}`, `${actualLength}`
                ));
            }
        }
    };

    const operand = (index: number) => {
        const operand = currentLine().operands[index];
        return operand ? operand : "";
    }

    const operations: Array<Conversion> = [
        numeric(symbolTable, cpuRegisters, jsExpression),
        range as Conversion,
        scale(programMemory)
    ];

    return (requiredTypes: Array<OperandType>): Array<number> => {
        indexOffsetAt = requiredTypes.findIndex(
            requiredType => requiredType == "indexWithOffset"
        );
        lengthMatchCheck(requiredTypes);
        return requiredTypes.map((requiredType, index) => {
            const useIndex = indexOffsetAt < 0 || index <= indexOffsetAt
                ? index : index - 1
            let value: string | number = operand(useIndex);
            for (const operation of operations) {
                const result = operation(value, requiredType);
                if (typeof result != "number") {
                    result.location = {"operand": useIndex + 1};
                    addFailure(currentLine().failures, result);
                    return 0;
                }
                value = result;
            }
            return value as number;
        });
    };
};

export type Operands = ReturnType<typeof operands>;
