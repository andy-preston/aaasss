import type { AllowedValues, Max, Min } from "../assembler/data-types.ts";
import type { Mnemonic } from "../tokens/data-types.ts";

import { failureKinds } from "./kinds.ts";

type OperandLocation = { "operand": number };
type ParameterLocation = { "parameter": number };
export type FailureLocation = undefined | OperandLocation | ParameterLocation;

export const boringFailure = (
    kind: typeof failureKinds["boring"][number]
) => ({
    "kind": kind, "location": undefined as FailureLocation
});

export type BoringFailure = ReturnType<typeof boringFailure>;

export const assertionFailure = (
    kind: typeof failureKinds["assertion"][number],
    expected: string, actual: string
) => ({
    "kind": kind, "location": undefined as FailureLocation,
    "expected": expected, "actual": actual
});

export type AssertionFailure = ReturnType<typeof assertionFailure>;

export const numericTypeFailure = (
    kind: typeof failureKinds["numericType"][number],
    value: unknown, min: Min, max: Max, allowed: AllowedValues
) => ({
    "kind": kind, "location": undefined as FailureLocation,
    "value": value, "min": min, "max": max,
    "allowed": allowed == undefined ? "" : allowed.join(", ")
});

export type NumericTypeFailure = ReturnType<typeof numericTypeFailure>;

export const clueFailure = (
    kind: typeof failureKinds["clue"][number],
    clue: string
) => ({
    "kind": kind, "location": undefined as FailureLocation,
    "clue": clue
});

export type ClueFailure = ReturnType<typeof clueFailure>;

export const definitionFailure = (
    kind: typeof failureKinds["definition"][number],
    name: string, definition: string
) => ({
    "kind": kind, "location": undefined as FailureLocation,
    "name": name, "definition": definition
});

export type DefinitionFailure = ReturnType<typeof definitionFailure>;

export const exceptionFailure = (
    kind: typeof failureKinds["exception"][number],
    exception: string, message: string
) => ({
    "kind": kind, "location": undefined as FailureLocation,
    "exception": exception, "message": message
});

export type ExceptionFailure = ReturnType<typeof exceptionFailure>;

export const supportFailure = (
    kind: typeof failureKinds["notSupported"][number],
    used: Mnemonic, suggestion: Mnemonic | undefined
) => ({
    "kind": kind, "location": undefined as FailureLocation,
    "used": used, "suggestion": suggestion
});

export type SupportFailure = ReturnType<typeof supportFailure>;

export type Failure = AssertionFailure | BoringFailure | ClueFailure
    | DefinitionFailure | ExceptionFailure
    | NumericTypeFailure | SupportFailure;

export type NumberOrFailure = number | Failure;
export type StringOrFailure = string | Failure;
export type StringsOrFailure = Array<string> | Failure;
export type BooleanOrFailure = boolean | Failure;
