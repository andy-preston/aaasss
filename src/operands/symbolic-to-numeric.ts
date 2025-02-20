import { box, type Box, type Failure } from "../failure/failure-or-box.ts";
import { JsExpression } from "../javascript/expression.ts";
import type { LineWithProcessedMacro } from "../macros/line-types.ts";
import { lineWithOperands } from "./line-types.ts";
import {
    operands,
    type NumericOperand, type OperandType, type SymbolicOperand,
    type NumericOperands, type OperandTypes, type OperandIndex
} from "./data-types.ts";

export const symbolicToNumeric = (expression: JsExpression) => {
    const indexMapping: Map<SymbolicOperand, NumericOperand> = new Map([
        ["Z+", 0],
        ["Y+", 1]
    ]);

    const dummyOperation = (line: LineWithProcessedMacro) =>
        lineWithOperands(line, [], []);

    const valueAndType = (
        symbolic: SymbolicOperand
    ): [Box<number> | Failure, OperandType] => {
        if (indexMapping.has(symbolic)) {
            return [box(indexMapping.get(symbolic)!), "index_offset"];
        }
        const numeric = expression(symbolic);
        return numeric.which == "failure"
            ? [numeric, "failure"]
            : numeric.value == ""
            ? [box(0), "number"] // why is blank zero? should be "blank"
            : [box(parseInt(numeric.value)), "number"]
    };

    const actualOperation = (line: LineWithProcessedMacro) => {
        const numericOperands: Array<NumericOperand> = [];
        const operandTypes: Array<OperandType> = [];
        for (const [index, symbolic] of line.symbolicOperands.entries()) {
            const [numeric, operandType] = valueAndType(symbolic);
            operandTypes.push(operandType);
            if (numeric.which == "failure") {
                numericOperands.push(0);
                line.withFailure(numeric.onOperand(index as OperandIndex));
            } else {
                numericOperands.push(numeric.value);
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
