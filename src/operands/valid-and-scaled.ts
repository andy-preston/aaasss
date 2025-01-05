import { failure } from "../failure/failures.ts";
import type { NumericOperand, OperandIndex } from "./data-types.ts";
import { LineWithOperands } from "./line-types.ts";

type Checker = (value: NumericOperand) => boolean;
type Scaler = (value: NumericOperand) => NumericOperand;

const ranges = {
    "nybble": [
        (value) => value < 0 || value > 0x0f,
        (value) => value,
    ],
    // cSpell:words RAMPD
    // LDS/STS uses RAMPD to access memory above 64K
    // but none of "my" parts have > 16K
    "dataAddress16Bit": [
        (value) => value < 0 || value > 0xffff,
        (value) => value,
    ],
    "dataAddress7Bit": [
        (value) => value <0 || value > 0x7f,
        (value) => value,
    ]
} satisfies Record<string, [Checker, Scaler]>;

export type NumericType = keyof typeof ranges;

export const validScaledOperands = (line: LineWithOperands, requiredCount: number) => {
    const real = (requirement: NumericType, index: OperandIndex) => {
        const range = ranges[requirement];
        const numeric = line.numericOperands[index]!;
        if (line.operandTypes[index] != "number") {
            line.withFailure(failure(index, "operand_wrongType", "number"));
            return 0;
        }
        if (range[0](numeric)) {
            line.withFailure(failure(index, "operand_outOfRange", requirement));
            return 0;
        }
        return range[1](numeric);
    };

    const dummy = (_requirement: NumericType, _index: OperandIndex) =>
        0;

    const failed = line.numericOperands.length != requiredCount;
    if (failed) {
        line.withFailure(
            failure(undefined, "operand_wrongCount", `${requiredCount}`)
        );
    }
    return failed ? dummy : real;
};
