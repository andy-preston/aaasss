import type { Failure } from "../failure/bags.ts";
import type { Line } from "../line/line-types.ts";
import type { NumericType } from "../numeric-values/types.ts";
import type { NumericOperand, NumericOperands, OperandIndex, OperandType } from "./data-types.ts";

import { assertionFailure } from "../failure/bags.ts";
import { validNumeric } from "../numeric-values/valid.ts";
import { operands } from "./data-types.ts";

type Scaler = (value: NumericOperand) => NumericOperand;

const scalers: Map<NumericType, Scaler> = new Map([
    ["type_registerImmediate", value => value - 16],
    ["type_ioPort",            value => value - 0x20],
    ["type_registerPair",      value => (value - 24) / 2]
]);

export type OperandRequirement = [OperandType, NumericType];
export type OperandRequirements = Array<OperandRequirement>;

export const validScaledOperands = (
    line: Line, operandRequirements: OperandRequirements
): NumericOperands => {
    const count = operandRequirements.length;
    if (count != line.numericOperands.length) {
        line.withFailures([assertionFailure(
            "operand_count", `${count}`,`${line.numericOperands.length}`
        )]);
    }

    const withFailure = (failure: Failure, operandIndex: OperandIndex) => {
        failure.location = {"operand": operandIndex};
        line.withFailures([failure]);
    }

    const mapped = operandRequirements.map((operandRequirement, index) => {
        const operandIndex = index as OperandIndex;
        const [requiredType, numericType] = operandRequirement;

        const numeric = line.numericOperands[operandIndex]!;
        const actualType = line.operandTypes[operandIndex];

        if (actualType != requiredType) {
            withFailure(
                assertionFailure("type_failure", requiredType, `${actualType}`),
                operandIndex
            );
        }

        const valid = validNumeric(numeric, numericType);
        if (valid.type == "failures") {
            (valid.it as Array<Failure>).forEach(failure => {
                withFailure(failure, operandIndex);
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
