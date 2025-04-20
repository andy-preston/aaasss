import { numberBag } from "../assembler/bags.ts";
import type { Failure, NumberOrFailures } from "../failure/bags.ts";
import type { JsExpression } from "../javascript/expression.ts";
import type { LineWithProcessedMacro } from "../macros/line-types.ts";
import type { CpuRegisters } from "../registers/cpu-registers.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import {
    operands,
    type NumericOperand, type OperandType, type SymbolicOperand,
    type NumericOperands, type OperandTypes, type OperandIndex
} from "./data-types.ts";
import { IndexOperand, indexOperands } from "./index-operands.ts";
import { lineWithOperands } from "./line-types.ts";

export const symbolicToNumeric = (
    symbolTable: SymbolTable, cpuRegisters: CpuRegisters,
    jsExpression: JsExpression
) => {
    const valueAndType = (
        symbolicOperand: SymbolicOperand
    ): [NumberOrFailures, OperandType] => {
        if (indexOperands.includes(symbolicOperand as IndexOperand)) {
            return [numberBag(0), "index"];
        }
        if (cpuRegisters.has(symbolicOperand)) {
            const usageCounted = symbolTable.use(symbolicOperand).it;
            return [numberBag(usageCounted as number), "register"];
        }
        const numeric = jsExpression(symbolicOperand);
        return numeric.type == "failures" ? [numeric, "failure"]
            : numeric.it == "" ? [numberBag(0), "number"]
            : [numberBag(parseInt(numeric.it)), "number"];
    };

    const actualOperation = (line: LineWithProcessedMacro) => {
        const numericOperands: Array<NumericOperand> = [];
        const operandTypes: Array<OperandType> = [];

        const numericFailed = (
            failures: Array<Failure>, operandIndex: OperandIndex
        ) => {
            (failures).forEach(failure => {
                failure.location = { "operand": operandIndex };
                line.withFailure(failure);
            });
        };

        for (const [index, symbolic] of line.symbolicOperands.entries()) {
            const [numeric, operandType] = valueAndType(symbolic);
            operandTypes.push(operandType);
            if (numeric.type == "failures") {
                numericOperands.push(0);
                numericFailed(
                    numeric.it as Array<Failure>, index as OperandIndex
                );
            } else {
                numericOperands.push(numeric.it);
            }
        }
        return lineWithOperands(
            line,
            operands<NumericOperands>(numericOperands),
            operands<OperandTypes>(operandTypes)
        );
    };

    return (line: LineWithProcessedMacro) => line.isRecordingMacro
        ? lineWithOperands(line, [], [])
        : actualOperation(line);
};

export type SymbolicToNumeric = ReturnType<typeof symbolicToNumeric>;
