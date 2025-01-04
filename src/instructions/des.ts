import { box } from "../coupling/boxed-value.ts";
import { failure } from "../failure/failures.ts";
import type { Context } from "../javascript/context.ts";
import type { AddressingModeGenerator } from "../object-code/object-code.ts";
import type { Code } from "../object-code/data-types.ts";
import { lineWithObjectCode } from "../object-code/line-types.ts";
import { template } from "../object-code/template.ts";
import type { NumericOperands } from "../operands/data-types.ts";
import type { LineWithPokedBytes } from "../program-memory/line-types.ts";

export const des = (
    line: LineWithPokedBytes
): AddressingModeGenerator | undefined => {

    const codeGenerator = (context: Context) => {
        if (line.symbolicOperands.length != 1) {
            line.withFailure(failure(undefined, "operand_wrongCount", "1"));
        };
        const operand = line.symbolicOperands.length > 0
            ? context.operand(line.symbolicOperands[0]!)
            : box(0);
        if (operand.which == "failure") {
            line.withFailure(operand);
        } else if (operand.value < 0 || operand.value > 0x0f) {
            line.withFailure(failure(0, "operand_outOfRange", "00-0F"));
        }
        const numericOperands: NumericOperands =
            operand.which == "failure" ? [] : [operand.value];
        const code: Code = line.failed() || numericOperands.length < 1
            ? [0, 0]
            : template("1001_0100 KKKK_1011", [
                ["K", numericOperands[0]!]
            ]);
        return lineWithObjectCode(line, numericOperands, code);
    };

    return line.mnemonic == "DES" ? codeGenerator : undefined;
};
