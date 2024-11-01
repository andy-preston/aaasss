import type { OperandIndex } from "./source-files/line.ts";

type ParameterFailures = "outOfRange";
type ContextFailures = "redefined";
type JavascriptFailures = "jsError" | "jsMode" | "assemblerMode";
export type FailureKind = "mockUp"
    | JavascriptFailures | ContextFailures | ParameterFailures;

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
export type Failures = Array<Failure>;
