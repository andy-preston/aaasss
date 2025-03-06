import type { DevicePropertiesInterface } from "../device/properties.ts";
import type { NumericType } from "../numeric-values/types.ts";
import { lineWithObjectCode, type LineWithPokedBytes } from "../object-code/line-types.ts";
import type { EncodedInstruction } from "../object-code/object-code.ts";
import { template } from "../object-code/template.ts";
import { validScaledOperands } from "../operands/valid-scaled.ts";
import type { OperandIndex } from "../operands/data-types.ts";

const mapping: Map<string, [string, OperandIndex, OperandIndex]> = new Map([
    ["LDS", ["0", 0, 1]],
    ["STS", ["1", 1, 0]]
]);

const options = (hasReducedCore: boolean): [
    NumericType, NumericType, string, string
] =>
    hasReducedCore ? [
        "type_registerImmediate", "type_7BitDataAddress",
        "1010_", "kkk dddd_kkkk"
    ] : [
        "type_register", "type_16BitDataAddress",
        "1001_00", "d dddd_0000 kkkk_kkkk kkkk_kkkk"
    ];

export const dataDirect = (
    line: LineWithPokedBytes
): EncodedInstruction | undefined => {
    const codeGenerator = (device: DevicePropertiesInterface) => {
        const hasReducedCore = (): boolean => {
            const reducedCore = device.hasReducedCore();
            if (reducedCore.which == "failure") {
                line.withFailure(reducedCore);
                return false;
            }
            return reducedCore.value;
        };

        const [operationBit, registerIndex, addressIndex] =
            mapping.get(line.mnemonic)!;

        const [registerType, addressType, prefix, suffix] =
            options(hasReducedCore());

        const [register, address] = validScaledOperands(line, [
            ["register", registerType, registerIndex],
            ["number", addressType, addressIndex],
        ]);

        const code = template(`${prefix}${operationBit}${suffix}`, [
            ["d", register!],
            ["k", address!]
        ]);
        return lineWithObjectCode(line, code);
    };

    return mapping.has(line.mnemonic) ? codeGenerator : undefined;
};
