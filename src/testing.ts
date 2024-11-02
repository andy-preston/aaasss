import { assert, assertEquals, assertInstanceOf } from "assert";
import { newContext } from "./context/context.ts";
import type { Box, Failure, FailureKind } from "./value-or-failure.ts";
import { newPass } from "./state/pass.ts";

export const anEmptyContext = () => newContext(newPass(() => {}));

export const assertSuccess = (
    actual: Box | Failure,
    expected: string
) => {
    assertEquals(actual.which, "value");
    assertEquals((actual as Box).value, expected);
};

export const assertFailure = (
    actual: Box | Failure,
    expectedKind: FailureKind
) => {
    assertEquals(actual.which, "failure");
    assert((actual as Failure).kind, expectedKind);
};

export const assertFailureWithError = (
    actual: Box | Failure,
    expectedKind: FailureKind,
    expectedError: ErrorConstructor,
    expectedMessage: string
) => {
    assertFailure(actual, expectedKind);
    assertInstanceOf((actual as Failure).error, expectedError);
    assertEquals((actual as Failure).error!.message, expectedMessage);
};
