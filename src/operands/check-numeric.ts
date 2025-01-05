import { box } from "../coupling/boxed-value.ts";
import { failure } from "../failure/failures.ts";
import type { OperandIndex } from "./data-types.ts";
import { LineWithOperands } from "./line-types.ts";

const numeric = (line: LineWithOperands, index: OperandIndex) =>
    line.operandTypes[index] == "number"
        ? box(line.numericOperands[index]!)
        : failure(index, "operand_wrongType", "number");

export const operandNybble = (line: LineWithOperands, index: OperandIndex) => {
    const num = numeric(line, index);
    if (num.which == "failure") {
        return num;
    }
    return num.value < 0 || num.value > 0x0f
        ? failure(index, "operand_outOfRange", "Nybble (00-0F)")
        : num;
};
