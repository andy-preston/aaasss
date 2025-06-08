import type { Failure } from "../failure/bags.ts";
import type { JsExpression } from "../javascript/expression.ts";
import type { Line } from "../line/line-types.ts";
import type { ProgramMemory } from "../program-memory/program-memory.ts";
import type { CpuRegisters } from "../registers/cpu-registers.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import type { OperandType } from "./data-types.ts";

import { assertionFailure } from "../failure/bags.ts";
import { scaler } from "./scaler.ts";
import { symbolicToNumeric } from "./symbolic-to-numeric.ts";
import { valid } from "./valid.ts";

export const operands = (
    symbolTable: SymbolTable, cpuRegisters: CpuRegisters,
    programMemory: ProgramMemory, jsExpression: JsExpression
) => {
    const failureOnOperand = (
        failure: Failure, line: Line, operand: number
    ) => {
        failure.location = {"operand": operand};
        line.failures.push(failure);
    };

    const failuresOnOperand = (
        failures: Array<Failure>, line: Line, operand: number
    ) => failures.forEach(failure => failureOnOperand(failure, line, operand));

    const converted = symbolicToNumeric(symbolTable, cpuRegisters, jsExpression);
    const scaled = scaler(programMemory);

    const lengthMatchCheck = (line: Line, operandTypes: Array<OperandType>) => {
        const failed = (expected: string) => {
            line.failures.push(assertionFailure(
                "operand_count", expected, `${line.symbolicOperands.length}`
            ));
        };

        const optional = () => {
            const count = operandTypes.filter(
                operandType => operandType.startsWith("optional")
            ).length;
            if (count > 1 || (count > 0 && operandTypes.length != 1)) {
                throw new Error(
                    "It's expected that if there are optional operands there will only be 1"
                );
            }
            return count == 1;
        };

        if (optional()) {
            if (![0, 1].includes(line.symbolicOperands.length)) {
                failed("0/1");
            }
        } else {
            if (operandTypes.length != line.symbolicOperands.length) {
                failed(`${operandTypes.length}`);
            }
        }
    };

    return (line: Line, operandTypes: Array<OperandType>): Array<number> => {
        lengthMatchCheck(line, operandTypes);

        return operandTypes.map((operandType, index) => {
            const numeric = converted(line.symbolicOperands[index], operandType);
            if (numeric.type == "failures") {
                failuresOnOperand(numeric.it, line, index);
                return 0;
            }

            const validated = valid(numeric.it, operandType);
            if (validated.type == "failures") {
                failuresOnOperand(validated.it, line, index);
                return 0;
            }

            const result = scaled(numeric.it, operandType);
            if (result.type == "failures") {
                failuresOnOperand(result.it, line, index);
                return 0;
            }

            return result.it;
        });
    };
};

export type Operands = ReturnType<typeof operands>;
