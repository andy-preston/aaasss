import { failure } from "../failure/failure-or-box.ts";
import type { NumericOperand, OperandIndex, OperandType } from "./data-types.ts";
import { LineWithOperands } from "./line-types.ts";

type Checker = (value: NumericOperand) => boolean;
type Scaler = (value: NumericOperand) => NumericOperand;

const noScaling: Scaler = (value) => value;

const ranges = {
    "nybble": [
        (value) => value < 0 || value > 0x0f,
        noScaling,
    ],
    // cSpell:words RAMPD
    // LDS/STS uses RAMPD to access memory above 64K
    // but none of "my" parts have > 16K
    "dataAddress16Bit": [
        (value) => value < 0 || value > 0xffff,
        noScaling,
    ],
    "dataAddress7Bit": [
        (value) => value < 0 || value > 0x7f,
        noScaling,
    ],
    "registerImmediate": [
        (value) => value < 16 || value > 31,
        (value) => value - 16
    ],
    "register": [
        (value) => value < 0 || value > 31,
        noScaling
    ],
} satisfies Record<string, [Checker, Scaler]>;

export type RangeType = keyof typeof ranges;

export const validScaledOperands = (
    line: LineWithOperands, requiredCount: number
) => {
    const real = (
        operandType: OperandType, rangeType: RangeType, index: OperandIndex
    ) => {
        const numeric = line.numericOperands[index]!;
        if (line.operandTypes[index] != operandType) {
            line.withFailure(failure(index, "operand_wrongType", operandType));
            return 0;
        }
        const range = ranges[rangeType];
        if (range[0](numeric)) {
            line.withFailure(failure(index, "operand_outOfRange", rangeType));
            return 0;
        }
        return range[1](numeric);
    };

    const dummy = (
        _operandType: OperandType, _rangeType: RangeType, _index: OperandIndex
    ) => 0;

    const failed = line.numericOperands.length != requiredCount;
    if (failed) {
        line.withFailure(
            failure(undefined, "operand_wrongCount", `${requiredCount}`)
        );
    }
    return failed ? dummy : real;
};
