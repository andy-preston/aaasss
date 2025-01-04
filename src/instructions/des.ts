import type { DevicePropertiesInterface } from "../device/properties.ts";
import { failure } from "../failure/failures.ts";
import type { Code } from "../object-code/data-types.ts";
import { lineWithObjectCode } from "../object-code/line-types.ts";
import type { EncodedInstruction } from "../object-code/object-code.ts";
import { template } from "../object-code/template.ts";
import type { LineWithPokedBytes } from "../program-memory/line-types.ts";

export const des = (
    line: LineWithPokedBytes
): EncodedInstruction | undefined => {
    const codeGenerator = () => {
        if (line.numericOperands.length != 1) {
            line.withFailure(failure(undefined, "operand_wrongCount", "1"));
        };
        const operand = line.numericOperands.length > 0
            ? line.numericOperands[0]!
            : 0;
        if (operand < 0 || operand > 0x0f) {
            line.withFailure(failure(0, "operand_outOfRange", "00-0F"));
        }
        const code: Code = line.failed()
            ? [0, 0]
            : template("1001_0100 KKKK_1011", [
                ["K", line.numericOperands[0]!]
            ]);
        return lineWithObjectCode(line, code);
    };

    return line.mnemonic == "DES" ? codeGenerator : undefined;
};
