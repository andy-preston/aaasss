import type { AllowedValues, Max, Min } from "../assembler/data-types.ts";
import type { Mnemonic } from "../tokens/data-types.ts";

import { typeOf } from "../assembler/data-types.ts";
import { failureKinds } from "./kinds.ts";

export type FailureLocation = undefined |
    {"operand": number} | {"parameter": number};

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

export const valueTypeFailure = (
    expectedType: string, given: unknown
) => assertionFailure(
    "value_type", expectedType, `${typeOf(given)}: (${given})`
);

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

export const failures = () => {
    const theList: Array<Failure> = [];

    return (additional?: Failure) => {
        if (additional != undefined) {
            const duplicate = theList.find(existing => {
                if (existing.kind != additional.kind) {
                    return false;
                }
                for (const [key, value] of Object.entries(existing)) {
                    if (additional[key as keyof Failure] != value) {
                        return false;
                    }
                }
                return true;
            });
            if (duplicate == undefined) {
                theList.push(additional);
            }
        }
        return theList;
    };
};

export type Failures = ReturnType<typeof failures>;
