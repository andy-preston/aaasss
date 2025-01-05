import { box } from "../coupling/boxed-value.ts";
import { failure } from "../failure/failures.ts";
import type { LineWithPokedBytes } from "../object-code/line-types.ts";

export const operandCount = (line: LineWithPokedBytes, requiredCount: number) =>
    line.numericOperands.length == requiredCount
        ? box(true)
        : failure(undefined, "operand_wrongCount", `${requiredCount}`);
