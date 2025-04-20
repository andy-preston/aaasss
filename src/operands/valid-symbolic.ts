import { clueFailure, typeFailure } from "../failure/bags.ts";
import type { OperandIndex } from "./data-types.ts";
import type { IndexOperand } from "./index-operands.ts";
import type { LineWithOperands } from "./line-types.ts";

export const validSymbolic = (
    line: LineWithOperands, expected: Array<Array<IndexOperand>>
) => {
    if (line.symbolicOperands.length != expected.length) {
        line.withFailure(clueFailure("operand_count", `${expected.length}`));
    }
    expected.forEach((expectation, position) => {
        if (expectation.length == 0) {
            return;
        }
        const actual = line.symbolicOperands[position] as IndexOperand;
        if (!expectation.includes(actual)) {
            const failure = typeFailure(
                "operand_symbolic", expectation.join("/"), actual
            );
            failure.location = { "operand": position as OperandIndex };
            line.withFailure(failure);
        }
    });
};
