import { failure } from "../failure/failure-or-box.ts";
import { NumericType } from "../numeric-values/types.ts";
import { validNumeric } from "../numeric-values/valid.ts";
import type { NumericOperand, OperandIndex, OperandType } from "./data-types.ts";
import { LineWithOperands } from "./line-types.ts";

type Scaler = (value: NumericOperand) => NumericOperand;

const scalers: Map<NumericType, Scaler> = new Map([
    ["type_registerImmediate", (value) => value - 16],
]);

export const validScaledOperands = (
    line: LineWithOperands, requiredCount: number
) => {
    const real = (
        operandType: OperandType, numericType: NumericType, index: OperandIndex
    ) => {
        const numeric = line.numericOperands[index]!;
        if (line.operandTypes[index] != operandType) {
            line.withFailure(failure(index, "operand_wrongType", operandType));
            return 0;
        }
        const valid = validNumeric(numeric, numericType);
        if (valid.which == "failure") {
            line.withFailure(valid.onOperand(index));
            return 0;
        }
        if (scalers.has(numericType)) {
            const scale = scalers.get(numericType)!;
            return scale(numeric);
        }
        return numeric;
    };

    const dummy = (
        _operandType: OperandType, _numericType: NumericType, _index: OperandIndex
    ) => 0;

    const failed = line.numericOperands.length != requiredCount;

    if (failed) {
        line.withFailure(
            failure(undefined, "operand_wrongCount", `${requiredCount}`)
        );
    }
    return failed ? dummy : real;
};
