import type { Line } from "../line/line-types.ts";
import type { OperandIndex } from "./data-types.ts";
import type { IndexOperand } from "./index-operands.ts";

import { assertionFailure } from "../failure/bags.ts";

export const validSymbolic = (
    line: Line, expected: Array<Array<IndexOperand>>
) => {
    if (line.symbolicOperands.length != expected.length) {
        line.withFailures([assertionFailure(
            "operand_count",
            `${expected.length}`, `${line.symbolicOperands.length}`
        )]);
    }
    expected.forEach((expectation, position) => {
        if (expectation.length == 0) {
            return;
        }
        const actual = line.symbolicOperands[position] as IndexOperand;
        if (!expectation.includes(actual)) {
            const failure = assertionFailure(
                "operand_symbolic", expectation.join("/"), actual
            );
            failure.location = { "operand": position as OperandIndex };
            line.withFailures([failure]);
        }
    });
};
