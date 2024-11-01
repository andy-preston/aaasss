import { assert, assertEquals, assertInstanceOf } from "assert";
import { newContext, type ContextValue } from "./context/context.ts";
import type { Failure, FailureKind } from "./failure.ts";
import { newPass } from "./state/pass.ts";

export const anEmptyContext = () => newContext(newPass(() => {}));

export const assertSuccess = (
    actual: ContextValue | Failure,
    expected: string
) => {
    assertEquals(actual.which, "value");
    assertEquals((actual as ContextValue).value, expected);
};

export const assertFailure = (
    actual: ContextValue | Failure,
    expectedKind: FailureKind
) => {
    assertEquals(actual.which, "failure");
    assert((actual as Failure).kind, expectedKind);
};

export const assertFailureWithError = (
    actual: ContextValue | Failure,
    expectedKind: FailureKind,
    expectedError: ErrorConstructor,
    expectedMessage: string
) => {
    assertFailure(actual, expectedKind);
    assertInstanceOf((actual as Failure).error, expectedError);
    assertEquals((actual as Failure).error!.message, expectedMessage);
};
