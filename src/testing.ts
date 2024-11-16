import { assertEquals, assertInstanceOf } from "assert";
import { newContext } from "./context/context.ts";
import type { Box, Failure, FailureKind } from "./value-or-failure.ts";
import { newPass } from "./state/pass.ts";
import { NumericOperand } from "./coupling/line.ts";

export const anEmptyContext = () => newContext(newPass(() => {}));

export const assertSuccess = <Boxed extends string | NumericOperand>(
    actual: Box<Boxed> | Failure,
    expected: Boxed
) => {
    assertEquals(actual.which, "box");
    assertEquals((actual as Box<Boxed>).value, expected);
};

export const assertFailure = <Boxed extends string | NumericOperand>(
    actual: Box<Boxed> | Failure,
    expectedKind: FailureKind
) => {
    assertEquals(actual.which, "failure");
    assertEquals((actual as Failure).kind, expectedKind);
};

export const assertFailureWithError = <Boxed extends string | NumericOperand>(
    actual: Box<Boxed> | Failure,
    expectedKind: FailureKind,
    expectedError: ErrorConstructor,
    expectedMessage: string
) => {
    assertFailure(actual, expectedKind);
    assertInstanceOf((actual as Failure).error, expectedError);
    assertEquals((actual as Failure).error!.message, expectedMessage);
};
