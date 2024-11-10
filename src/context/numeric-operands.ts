import {
    operandLine, operands,
    type OperandLine, type TokenisedLine, type NumericOperands
} from "../pipeline/line.ts";

import type { Failure } from "../value-or-failure.ts";

import type { Context } from "./context.ts";

export const numericOperands = (context: Context) =>
    (theLine: TokenisedLine): OperandLine => {
        if (theLine.failed()) {
            return operandLine(theLine, [], []);
        }

        const failures: Array<Failure> = [];
        const numericOperands = theLine.symbolicOperands.map(
            (symbolic) => {
                const fromContext = context.operand(symbolic);
                if (fromContext.which == "failure") {
                    failures.push(fromContext);
                    return undefined;
                } else {
                    return fromContext.value;
                }
            }
        );

        return operandLine(
            theLine,
            operands<NumericOperands>(numericOperands),
            failures
        );
    };
