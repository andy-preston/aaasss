import { operands, type NumericOperands } from "../../operands/data-types.ts";
import type { LineWithAddress } from "../../program-memory/line-types.ts";
import type { Context } from "../context.ts";
import { lineWithOperands } from "./line-types.ts";

export const operandsFromContext = (context: Context) =>
    (line: LineWithAddress) => {
        const numericOperands = line.symbolicOperands.map((symbolic) => {
            const value = context.value(symbolic);
            if (value.which == "failure") {
                line.withFailure(value);
                return 0;
            }
            return value.value == "" ? 0 : parseInt(value.value);
        });
        return lineWithOperands(line, operands<NumericOperands>(numericOperands));
    };

export type OperandsFromContext = ReturnType<typeof operandsFromContext>;
