import { numberBag } from "../assembler/bags.ts";
import type { NumberOrFailures, OldFailure } from "../failure/bags.ts";
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
    symbolTable: SymbolTable,
    cpuRegisters: CpuRegisters,
    jsExpression: JsExpression
) => {
    const indexMapping: Map<SymbolicOperand, NumericOperand> = new Map([
        ["Z+", 0],
        ["Y+", 1]
    ]);

    const dummyOperation = (line: LineWithProcessedMacro) =>
        lineWithOperands(line, [], []);

    const valueAndType = (
        symbolic: SymbolicOperand
    ): [NumberOrFailures, OperandType] => {
        if (indexMapping.has(symbolic)) {
            return [numberBag(indexMapping.get(symbolic)!), "index_offset"];
        }
        if (cpuRegisters.has(symbolic)) {
            return [numberBag(symbolTable.use(symbolic).it as number), "register"];
        }
        const numeric = jsExpression(symbolic);
        return numeric.type == "failures"
            ? [numeric, "failure"]
            : numeric.it == ""
            ? [numberBag(0), "number"] // why is blank zero? should be "blank"
            : [numberBag(parseInt(numeric.it)), "number"]
    };

    const actualOperation = (line: LineWithProcessedMacro) => {
        const numericOperands: Array<NumericOperand> = [];
        const operandTypes: Array<OperandType> = [];

        for (const [index, symbolic] of line.symbolicOperands.entries()) {
            const [numeric, operandType] = valueAndType(symbolic);
            operandTypes.push(operandType);
            if (numeric.type == "failures") {
                numericOperands.push(0);
                const oldStyle = numeric.it[0] as OldFailure;
                line.withFailure(oldStyle.onOperand(index as OperandIndex));
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

    return (line: LineWithProcessedMacro) =>
        line.isRecordingMacro ? dummyOperation(line) : actualOperation(line);
};

export type SymbolicToNumeric = ReturnType<typeof symbolicToNumeric>;
