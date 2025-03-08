import { oldFailure, type OldFailure } from "../failure/bags.ts";
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
]);

type Requirement = [OperandType, NumericType, OperandIndex];

export type Requirements = Array<Requirement>;

const dummyMapper = (_requirement: Requirement) => 0 as NumericOperand;

export const validScaledOperands = (
    line: LineWithOperands, requirements: Requirements
): NumericOperands => {
    const realMapper = (requirement: Requirement): NumericOperand => {
        const [operandType, numericType, operandIndex] = requirement;

        const numeric = line.numericOperands[operandIndex]!;

        if (line.operandTypes[operandIndex] != operandType) {
            line.withFailure(oldFailure(
                operandIndex, "operand_wrongType", [operandType])
            );
            return 0;
        }

        const valid = validNumeric(numeric, numericType);
        if (valid.type == "failures") {
            const oldStyle = valid.it[0] as OldFailure;
            line.withFailure(oldStyle.onOperand(operandIndex));
            return 0;
        }

        if (scalers.has(numericType)) {
            const scale = scalers.get(numericType)!;
            return scale(numeric);
        }

        return numeric;
    };

    const failed = line.numericOperands.length != requirements.length;
    if (failed) {
        line.withFailure(oldFailure(
            undefined, "operand_wrongCount", [`${requirements.length}`]
        ));
    }

    return operands<NumericOperands>(
        requirements.map(failed ? dummyMapper : realMapper)
    );
};
