import type { Context } from "../javascript/context.ts";
import type { LineWithProcessedMacro } from "../macro/line-types.ts";
import { lineWithOperands } from "./line-types.ts";
import {
    operands,
    type NumericOperand, type OperandType, type SymbolicOperand,
    type NumericOperands, type OperandTypes, type OperandIndex
} from "./data-types.ts";

export const symbolicToNumeric = (
    context: Context
) => {
    const indexMapping: Map<SymbolicOperand, NumericOperand> = new Map([
        ["Z+", 0],
        ["Y+", 1]
    ]);

    const dummyOperation = (line: LineWithProcessedMacro) =>
        lineWithOperands(line, [], []);

    const actualOperation = (line: LineWithProcessedMacro) => {
        const numericOperands: Array<NumericOperand> = [];
        const operandTypes: Array<OperandType> = [];
        for (const [index, symbolic] of line.symbolicOperands.entries()) {
            if (indexMapping.has(symbolic)) {
                numericOperands.push(indexMapping.get(symbolic)!);
                operandTypes.push("index_offset");
                continue;
            }

            const value = context.value(symbolic);
            if (value.which == "failure") {
                line.withFailure(value.onOperand(index as OperandIndex));
                numericOperands.push(0);
                operandTypes.push("failure");
                continue;
            }

            numericOperands.push(value.value == "" ? 0 : parseInt(value.value));
            operandTypes.push("number");
        }
        return lineWithOperands(
            line,
            operands<NumericOperands>(numericOperands),
            operands<OperandTypes>(operandTypes)
        );
    };

    return (line: LineWithProcessedMacro) =>
        line.macroBeingDefined() ? dummyOperation(line) : actualOperation(line);
};

export type SymbolicToNumeric = ReturnType<typeof symbolicToNumeric>;
