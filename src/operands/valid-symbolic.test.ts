import type { AssertionFailure, ClueFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { testLine } from "./test.ts";
import { validSymbolic } from "./valid-symbolic.ts";

Deno.test("Line must have at least expected parameters", () => {
    const line = testLine(["X"], [0], ["index"]);
    validSymbolic(line, [["X", "X+"], ["Z"]]);
    expect(line.failed()).toBeTruthy();
    const failures = line.failures().toArray();
    expect(failures.length).toBe(2);
    {
        const failure = failures[0] as ClueFailure;
        expect(failure.kind).toBe("operand_count");
        expect(failure.clue).toBe("2");
    } {
        const failure = failures[1] as AssertionFailure;
        expect(failure.kind).toBe("operand_symbolic");
        expect(failure.location!).toEqual({"operand": 1});
        expect(failure.expected).toBe("Z");
        expect(failure.actual).toBe(undefined);
    }
});

Deno.test("line must not exceed expected parameters", () => {
    const line = testLine(["X", "Y"], [0, 0], ["index", "index"]);
    validSymbolic(line, [["X", "X+"]]);
    expect(line.failed()).toBeTruthy();
    const failures = line.failures().toArray();
    expect(failures.length).toBe(1);
    const failure = failures[0] as ClueFailure;
    expect(failure.kind).toBe("operand_count");
    expect(failure.clue).toBe("1");
});

Deno.test("line and expectation must not be different", () => {
    const line = testLine(["X", "Y"], [0, 0], ["index", "index"]);
    validSymbolic(line, [["Z", "Z+"], ["Z"]]);
    expect(line.failed()).toBeTruthy();
    const failures = line.failures().toArray();
    expect(failures.length).toBe(2);
    {
        const failure = failures[0] as AssertionFailure;
        expect(failure.kind).toBe("operand_symbolic");
        expect(failure.location!).toEqual({"operand": 0});
        expect(failure.expected).toBe("Z/Z+");
        expect(failure.actual).toBe("X");
    } {
        const failure = failures[1] as AssertionFailure;
        expect(failure.kind).toBe("operand_symbolic");
        expect(failure.location!).toEqual({"operand": 1});
        expect(failure.expected).toBe("Z");
        expect(failure.actual).toBe("Y");
    }
});

Deno.test("Everything's lovely when actual and expected match", () => {
    const line = testLine(["X", "Y"], [0, 0], ["index", "index"]);
    validSymbolic(line, [["X", "X+"], ["Y", "Y+"]]);
    expect(line.failed()).toBeFalsy();
    const failures = line.failures().toArray();
    expect(failures.length).toBe(0);
});
