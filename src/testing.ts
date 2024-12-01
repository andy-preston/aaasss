import { assertEquals, assertInstanceOf } from "assert";
import type { Box, Failure, FailureKind } from "./value-or-failure.ts";

export const assertSuccess = <Boxed>(
    actual: Box<Boxed> | Failure,
    expected: Boxed
) => {
    assertEquals(actual.which, "box");
    assertEquals((actual as Box<Boxed>).value, expected);
};

export const assertFailure = <Boxed>(
    actual: Box<Boxed> | Failure,
    expectedKind: FailureKind
) => {
    assertEquals(actual.which, "failure");
    assertEquals((actual as Failure).kind, expectedKind);
};

export const assertFailureWithError = <Boxed>(
    actual: Box<Boxed> | Failure,
    expectedKind: FailureKind,
    expectedError: ErrorConstructor,
    expectedMessage: string
) => {
    assertFailure(actual, expectedKind);
    assertInstanceOf((actual as Failure).extra, expectedError);
    assertEquals(((actual as Failure).extra as Error).message, expectedMessage);
};
