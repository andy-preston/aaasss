import type { OperandIndex } from "./line.ts";
import { failures } from "../output/failure-messages.ts";

export type FailureKind = keyof typeof failures;

export const failure = (
    operand: OperandIndex | undefined,
    kind: FailureKind,
    extra: Error | string | undefined
) => ({
    "which": "failure" as const,
    "operand": operand,
    "kind": kind,
    "extra": extra,
});

export type Failure = Readonly<ReturnType<typeof failure>>;
export type Failures = Array<Failure>;

export const box = <T>(value: T) => ({
    "which": "box" as const,
    "value": value,
});

export type Box<T> = Readonly<ReturnType<typeof box<T>>>;
