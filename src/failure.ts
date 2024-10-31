import type { OperandIndex } from "./source-files/line.ts";

type FailureKind = "js" | "outOfRange" | "mockUp";

export const failure = (
    operand: OperandIndex | undefined,
    kind: FailureKind,
    exceptionMessage: string
) => ({
    "operand": operand,
    "kind": kind,
    "exceptionMessage": exceptionMessage
});

export type Failure = Readonly<ReturnType<typeof failure>>;
