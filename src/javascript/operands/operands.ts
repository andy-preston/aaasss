import { box, type Box } from "../../coupling/boxed-value.ts";
import type { Failure } from "../../failure/failures.ts";
import type { SymbolicOperand } from "../../operands/data-types.ts";
import type { Context } from "../context.ts";

export const operands = (context: Context) =>
    (operand: SymbolicOperand): Box<number> | Failure => {
    const value = context.value(operand);
    return value.which == "failure"
        ? value
        : box(value.value == "" ? 0 : parseInt(value.value));
};

