import type { DevicePropertiesInterface } from "../device/properties.ts";
import type { Code } from "../object-code/data-types.ts";
import { lineWithObjectCode, type LineWithPokedBytes } from "../object-code/line-types.ts";
import type { EncodedInstruction } from "../object-code/object-code.ts";
import { template } from "../object-code/template.ts";
import { operandNybble } from "../operands/check-numeric.ts";
import { operandCount } from "../operands/count.ts";

export const des = (
    line: LineWithPokedBytes
): EncodedInstruction | undefined => {
    const codeGenerator = (_device: DevicePropertiesInterface) => {
        const count = operandCount(line, 1);
        if (count.which == "failure") {
            line.withFailure(count);
        };
        const operand = operandNybble(line, 0);
        if (operand.which == "failure") {
            line.withFailure(operand);
        }
        const code: Code = template("1001_0100 KKKK_1011", [
            ["K", operand.which == "box" ? operand.value : 0]
        ]);
        return lineWithObjectCode(line, code);
    };

    return line.mnemonic == "DES" ? codeGenerator : undefined;
};
