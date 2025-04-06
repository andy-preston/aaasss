import { numberBag } from "../assembler/bags.ts";
import type { Failure, NumberOrFailures } from "../failure/bags.ts";
import type { JsExpression } from "../javascript/expression.ts";
import type { LineWithProcessedMacro } from "../macros/line-types.ts";
import type { CpuRegisters } from "../registers/cpu-registers.ts";
import type { SymbolTable } from "../symbol-table/symbol-table.ts";
import { lineWithOperands } from "./line-types.ts";
import {
    operands,
    type NumericOperand, type OperandType, type SymbolicOperand,
    type NumericOperands, type OperandTypes, type OperandIndex
} from "./data-types.ts";

export const symbolicToNumeric = (
    symbolTable: SymbolTable, cpuRegisters: CpuRegisters,
    jsExpression: JsExpression
) => {
    const indexMapping: Map<SymbolicOperand, NumericOperand> = new Map([
        ["Z+", 0],
        ["Y+", 1]
    ]);

    const valueAndType = (
        symbolic: SymbolicOperand
    ): [NumberOrFailures, OperandType] => {
        if (indexMapping.has(symbolic)) {
            return [
                numberBag(indexMapping.get(symbolic)!), "index_offset"
            ];
        }
        if (cpuRegisters.has(symbolic)) {
            return [
                // using the symbol table to count the usage.
                numberBag(symbolTable.use(symbolic).it as number), "register"
            ];
        }
        const numeric = jsExpression(symbolic);
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
