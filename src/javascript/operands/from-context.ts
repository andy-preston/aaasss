import { NumericOperand, operands, SymbolicOperand, type NumericOperands } from "../../operands/data-types.ts";
import type { LineWithAddress } from "../../program-memory/line-types.ts";
import type { Context } from "../context.ts";
import { lineWithOperands } from "./line-types.ts";


export const operandsFromContext = (
    context: Context
) => {
    const indexMapping: Map<SymbolicOperand, NumericOperand> = new Map([
        ["Z+", 0],
        ["Y+", 1]
    ]);

    return (line: LineWithAddress) => {
        const mapping = (symbolic: SymbolicOperand) => {
            if (indexMapping.has(symbolic)) {
                return indexMapping.get(symbolic);
            }
            const value = context.value(symbolic);
            if (value.which == "failure") {
                line.withFailure(value);
                return 0;
            }
            return value.value == "" ? 0 : parseInt(value.value);
        };

        const numericOperands = line.symbolicOperands.map((mapping));
        return lineWithOperands(line, operands<NumericOperands>(numericOperands));
    };
};

export type OperandsFromContext = ReturnType<typeof operandsFromContext>;
