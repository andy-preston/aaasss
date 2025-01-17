import { OperandIndex } from "../operands/data-types.ts";
import { FailureKind } from "./failures.ts";

export const failure = (
    operand: OperandIndex | undefined,
    kind: FailureKind,
    extra: Error | string | undefined
) => {
    const onOperand = (index: OperandIndex) => {
        object.operand = index;
        return object;
    }
    const object = {
        "which": "failure" as const,
        "operand": operand,
        "onOperand": onOperand,
        "kind": kind,
        "extra": extra,
    };
    return object;
};

export const box = <T>(value: T) => ({
    "which": "box" as const,
    "value": value,
});

export const isFailureOrBox = (it: unknown) =>
    it instanceof Object && Object.hasOwn(it, "which");

export type Failure = Readonly<ReturnType<typeof failure>>;
export type Failures = Array<Failure>;
export type Box<T> = Readonly<ReturnType<typeof box<T>>>;
