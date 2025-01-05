import { box } from "../coupling/boxed-value.ts";
import { failure } from "../failure/failures.ts";
import type { NumericOperand, OperandIndex } from "./data-types.ts";

export const nybble = (operand: NumericOperand, index: OperandIndex) =>
    operand < 0 || operand > 0x0f
        ? failure(index, "operand_outOfRange", "Nybble (00-0F)")
        : box(true);
