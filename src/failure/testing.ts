import { assertEquals, AssertionError } from "assert";
import type { FailureKind } from "./failures.ts";
import type { Box, Failure } from "../failure/failure-or-box.ts";

export const assertSuccess = <Boxed>(
    actual: Box<Boxed> | Failure,
    expected: Boxed
) => {
    if (actual.which != "box") {
        throw new AssertionError(`Should be box not Failure (${actual.kind})`);
    }
    assertEquals(actual.value, expected);
};

export const assertFailure = <Boxed>(
    actual: Box<Boxed> | Failure,
    expectedKind: FailureKind
) => {
    if (actual.which != "failure") {
        throw new AssertionError(`Should be failure not box (${actual.value})`);
    }
    assertEquals(actual.kind, expectedKind);
};

export const assertFailureWithExtra = <Boxed>(
    actual: Box<Boxed> | Failure,
    expectedKind: FailureKind,
    expectedExtra: string
) => {
    if (actual.which != "failure") {
        throw new AssertionError(`Should be failure not box (${actual.value})`);
    }
    assertEquals(actual.kind, expectedKind);
    assertEquals(actual.extra, expectedExtra);
};

export const assertFailureWithError = <Boxed>(
    actual: Box<Boxed> | Failure,
    expectedKind: FailureKind,
    expectedError: ErrorConstructor,
    expectedMessage: string
) => {
    if (actual.which != "failure") {
        throw new AssertionError(`Should be failure not box (${actual.value})`);
    }
    assertEquals(actual.kind, expectedKind);
    if (!(actual.extra instanceof expectedError)) {
        throw new AssertionError(
            `"extra" should be ${expectedError.name}`
        );
    }
    assertEquals(actual.extra.message, expectedMessage);
};
