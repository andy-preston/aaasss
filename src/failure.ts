import type { OperandIndex } from "./source-files/line.ts";

type ParameterFailures = "outOfRange";
type ContextFailures = "redefined";
export type FailureKind = "mockUp" | "js" | ContextFailures | ParameterFailures;

export const failure = (
    operand: OperandIndex | undefined,
    kind: FailureKind,
    error: Error | undefined
) => ({
    "which": "failure" as const,
    "operand": operand,
    "kind": kind,
    "error": error
});

export type Failure = Readonly<ReturnType<typeof failure>>;
