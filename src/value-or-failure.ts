import type { OperandIndex } from "./pipeline/line.ts";

type ContextFailures = "redefined";
type DeviceFailures = "deviceNotFound" | "noDeviceSelected" | "multipleDevice";
type FileFailures = "notFound";
type JavascriptFailures = "jsError" | "jsMode" | "assemblerMode";
type OperandFailures = "outOfRange" | "tooManyOperands";
type SyntaxErrors = "noSpaceInLabel" | "tooManyIndexOffset";
export type FailureKind = "mockUp" |
    ContextFailures | DeviceFailures | FileFailures |
    JavascriptFailures | OperandFailures | SyntaxErrors;

export const failure = (
    operand: OperandIndex | undefined,
    kind: FailureKind,
    error: Error | undefined
) => ({
    "which": "failure" as const,
    "operand": operand,
    "kind": kind,
    "error": error,
});

export type Failure = Readonly<ReturnType<typeof failure>>;
export type Failures = Array<Failure>;

export const box = <T>(value: T) => ({
    "which": "box" as const,
    "value": value,
});

export type Box<T> = Readonly<ReturnType<typeof box<T>>>;
