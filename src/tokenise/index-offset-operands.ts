import { box, failure, type Box, type Failure } from "../value-or-failure.ts";
import type { OperandIndex } from "../pipeline/line.ts";

export const indexOffsetOperands = (
    operands: Array<string>
): Box<Array<string>> | Failure => {
    const result: Array<string> = [];
    let found = false;
    for (const [index, operand] of operands.entries()) {
        if (operand.startsWith("Z+") && operand.length > 2) {
            if (found) {
                return failure(
                    index as OperandIndex,
                    "tooManyIndexOffset",
                    undefined
                );
            }
            found = true;
            result.push("Z+");
            result.push(operand.substring(2).trim());
        } else {
            result.push(operand);
        }
    }
    return box(result);
};
