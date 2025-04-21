import { assertionFailure, clueFailure, type Failure } from "../failure/bags.ts";
import type { NumericType } from "../numeric-values/types.ts";
import { validNumeric } from "../numeric-values/valid.ts";
import {
    operands,
    type NumericOperand, type NumericOperands, type OperandIndex, type OperandType
} from "./data-types.ts";
import type { LineWithOperands } from "./line-types.ts";

type Scaler = (value: NumericOperand) => NumericOperand;

const scalers: Map<NumericType, Scaler> = new Map([
    ["type_registerImmediate", (value) => value - 16],
    ["type_ioPort", (value) => value - 0x20]
]);

type OperandRequirement = [
    OperandType, NumericType, OperandIndex
];

export type OperandRequirements = Array<OperandRequirement>;

export const validScaledOperands = (
    line: LineWithOperands, operandRequirements: OperandRequirements
): NumericOperands => {
    const count = operandRequirements.length;
    if (count != line.numericOperands.length) {
        line.withFailure(clueFailure("operand_count", `${count}`));
    }

    const mapped = operandRequirements.map(operandRequirement => {
        const [requiredType, numericType, operandIndex] = operandRequirement;

        const numeric = line.numericOperands[operandIndex]!;
        const actualType = line.operandTypes[operandIndex];

        if (actualType != requiredType) {
            const failure = assertionFailure(
                "type_failure", requiredType, `${actualType}`
            );
            failure.location = {"operand": operandIndex};
            line.withFailure(failure);
        }

        const valid = validNumeric(numeric, numericType);
        if (valid.type == "failures") {
            (valid.it as Array<Failure>).forEach((failure) => {
                failure.location = {"operand": operandIndex};
                line.withFailure(failure);
            });
        }

        if (scalers.has(numericType)) {
            const scale = scalers.get(numericType)!;
            return scale(numeric);
        }

        return numeric ? numeric : 0;
    });

    return operands<NumericOperands>(mapped);
};
