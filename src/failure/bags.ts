import type { BooleanBag, NumberBag, StringBag, StringsBag } from "../assembler/bags.ts";
import type { NumericType } from "../numeric-values/types.ts";
import type { OperandIndex } from "../operands/data-types.ts";

import { failureKinds } from "./kinds.ts";

type OperandLocation = { "operand": OperandIndex };
type ParameterLocation = { "parameter": number };
type FailureLocation = undefined | OperandLocation | ParameterLocation;

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
    kind: typeof failureKinds["numericType"][number] | NumericType,
    value: unknown, min: number | undefined, max: number | undefined
) => ({
    "kind": kind, "location": undefined as FailureLocation,
    "value": value, "min": min, "max": max
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

export type Failure = AssertionFailure | BoringFailure | ClueFailure
    | DefinitionFailure | ExceptionFailure
    | NumericTypeFailure | AssertionFailure;

export const bagOfFailures = (failures: Array<Failure>) =>
    ({ "type": "failures" as const, "it": failures });
export type BagOfFailures = ReturnType<typeof bagOfFailures>;

export type NumberOrFailures = NumberBag | BagOfFailures;
export type StringOrFailures = StringBag | BagOfFailures;
export type StringsOrFailures = StringsBag | BagOfFailures;
export type BooleanOrFailures = BooleanBag | BagOfFailures;

export type BagOrFailures =
    NumberBag | StringBag | StringsBag | BooleanBag | BagOfFailures;
