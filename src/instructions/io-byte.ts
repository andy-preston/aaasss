import type { DevicePropertiesInterface } from "../device/properties.ts";
import { lineWithObjectCode, type LineWithPokedBytes } from "../object-code/line-types.ts";
import type { EncodedInstruction } from "../object-code/object-code.ts";
import { template } from "../object-code/template.ts";
import type { OperandIndex } from "../operands/data-types.ts";
import { validScaledOperands, type Requirements } from "../operands/valid-scaled.ts";

const mapping: Map<string, [string, OperandIndex, OperandIndex]> = new Map([
    ["IN",  ["0", 0, 1]],
    ["OUT", ["1", 1, 0]]
]);

export const ioByte = (
    line: LineWithPokedBytes
): EncodedInstruction | undefined => {
    const codeGenerator = (_device: DevicePropertiesInterface) => {
        const [operationBit, registerPosition, portPosition] = mapping.get(
            line.mnemonic
        )!;

        const operandsRequired: Requirements = [
            ["register", "type_register", registerPosition],
            ["number",   "type_ioPort",   portPosition]
        ];
        const actualOperands = validScaledOperands(line, operandsRequired);

        const code = template(`1011_${operationBit}AAd dddd_AAAA`, [
            ["d", actualOperands[0]!],
            ["A", actualOperands[1]!]
        ]);
        return lineWithObjectCode(line, code);
    };

    return mapping.has(line.mnemonic) ? codeGenerator : undefined;
};
