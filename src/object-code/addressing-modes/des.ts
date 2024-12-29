import type { Context } from "../../context/context.ts";
import { box } from "../../coupling/boxed-value.ts";
import { failure, type Failures } from "../../failure/failures.ts";
import { lineWithObjectCode } from "../line-types.ts";
import type { NumericOperands } from "../../operands/data-types.ts";
import { LineWithPokedBytes } from "../../program-memory/line-types.ts";
import type { AddressingModeGenerator } from "../code-generator.ts";
import { Code } from "../data-types.ts";
import { template } from "../template.ts";

export const des = (
    line: LineWithPokedBytes
): AddressingModeGenerator | undefined => {

    const codeGenerator = (context: Context) => {
        const failures: Failures = [];
        if (line.symbolicOperands.length != 1) {
            failures.push(failure(undefined, "operand_wrongCount", "1"));
        };
        const operand = line.symbolicOperands.length > 0
            ? context.operand(line.symbolicOperands[0]!)
            : box(0);
        if (operand.which == "failure") {
            failures.push(operand);
        } else if (operand.value < 0 || operand.value > 0x0f) {
            failures.push(failure(0, "operand_outOfRange", "00-0F"));
        }
        const numericOperands: NumericOperands =
            operand.which == "failure" ? [] : [operand.value];
        const code: Code = failures.length > 0 || numericOperands.length < 1
            ? [0, 0]
            : template("1001_0100 KKKK_1011", [
                ["K", numericOperands[0]!]
            ]);
        return lineWithObjectCode(line, numericOperands, code, failures);
    };

    return line.mnemonic == "DES" ? codeGenerator : undefined;
};
