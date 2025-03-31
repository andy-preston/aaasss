import { clueFailure, typeFailure, type Failure } from "../failure/bags.ts";
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

type Requirement = [OperandType, NumericType, OperandIndex];

export type Requirements = Array<Requirement>;

export const validScaledOperands = (
    line: LineWithOperands, requirements: Requirements
): NumericOperands => {
    const count = requirements.length;
    if (count != line.numericOperands.length) {
        line.withFailure(clueFailure("operand_count", `${count}`));
    }

    const mapped = requirements.map((requirement: Requirement) => {
        const [requiredType, numericType, operandIndex] = requirement;

        const numeric = line.numericOperands[operandIndex]!;
        const actualType = line.operandTypes[operandIndex];

        if (actualType != requiredType) {
            const failure = typeFailure(
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
