import { assert, assertEquals, assertNotEquals } from "assert";
import type { BooleanBag, NumberBag, StringBag } from "../assembler/bags.ts";
import type {
    FailureKind, BagOfFailures, OldFailure, Failure,
    BooleanOrFailures, NumberOrFailures, StringOrFailures
} from "./bags.ts";

export const assertSuccess = (
    actual: StringOrFailures | NumberOrFailures | BooleanOrFailures
) => {
    assertNotEquals(actual.type, "failures");
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
    assert(Object.hasOwn(failure, "extra"), `Failure ${failure.kind} doesn't have extras`);
    const oldStyle = failure as OldFailure;
    assertEquals(oldStyle.extra, expectedExtra, "Extra does not match");
};
