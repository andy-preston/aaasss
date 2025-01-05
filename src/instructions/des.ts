import type { DevicePropertiesInterface } from "../device/properties.ts";
import type { Code } from "../object-code/data-types.ts";
import { lineWithObjectCode, type LineWithPokedBytes } from "../object-code/line-types.ts";
import type { EncodedInstruction } from "../object-code/object-code.ts";
import { template } from "../object-code/template.ts";
import { validScaledOperands } from "../operands/valid-and-scaled.ts";

export const des = (
    line: LineWithPokedBytes
): EncodedInstruction | undefined => {
    const codeGenerator = (_device: DevicePropertiesInterface) => {
        const operands = validScaledOperands(line, 1);
        const operand = operands("nybble", 0);
        const code: Code = template("1001_0100 KKKK_1011", [
            ["K", operand]
        ]);
        return lineWithObjectCode(line, code);
    };

    return line.mnemonic == "DES" ? codeGenerator : undefined;
};
