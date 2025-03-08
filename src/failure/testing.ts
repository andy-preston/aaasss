import { assertEquals, assertNotEquals } from "assert";
import type { BooleanBag, NumberBag, StringBag } from "../assembler/bags.ts";
import type { FailureKind } from "./failures.ts";
import type { BooleanOrFailures, Failure, BagOfFailures, NumberOrFailures, StringOrFailures } from "./bags.ts";

export const assertSuccess = (
    actual: StringOrFailures | NumberOrFailures | BooleanOrFailures
) => {
    assertNotEquals(actual.type, "failures");
};

export const assertFailures = (
    actual: StringOrFailures | NumberOrFailures | BooleanOrFailures
) => {
    assertEquals(actual.type, "failures", `Expected failures but got ${actual.type}`);
};

type Value<It> = It extends string ? StringBag
    : It extends number ? NumberBag
    : BooleanBag;


export const assertSuccessWith = <It extends string | number | boolean>(
    actual: Value<It> | BagOfFailures, expected: It
) => {
    assertSuccess(actual);
    assertEquals((actual as Value<It>).it, expected);
};

export const assertFailureKind = (
    actual: Array<Failure>, expectedKind: FailureKind
): Failure => {
    const failure = actual.find(failure => failure.kind == expectedKind);
    assertNotEquals(failure, undefined, `${expectedKind} Failure not found`);
    return failure!;
};

export const assertFailureWithExtra = (
    actual: Array<Failure>, expectedKind: FailureKind,
    expectedExtra: Array<string>
) => {
    const failure = assertFailureKind(actual, expectedKind);
    assertEquals(failure!.extra, expectedExtra, "Extra does not match");
};
