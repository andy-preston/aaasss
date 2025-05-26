import type { AssertionFailure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { dummyLine } from "../line/line-types.ts";
import { validSymbolic } from "./valid-symbolic.ts";

Deno.test("Line must have at least expected parameters", () => {
    const line = dummyLine(false);
    line.symbolicOperands = ["X"];
    line.numericOperands = [0];
    line.operandTypes = ["index"];
    validSymbolic(line, [["X", "X+"], ["Z"]]);
    expect(line.failed()).toBe(true);
    expect(line.failures.length).toBe(2);
    {
        const failure = line.failures[0] as AssertionFailure;
        expect(failure.kind).toBe("operand_count");
        expect(failure.expected).toBe("2");
        expect(failure.actual).toBe("1");
    } {
        const failure = line.failures[1] as AssertionFailure;
        expect(failure.kind).toBe("operand_symbolic");
        expect(failure.location!).toEqual({"operand": 1});
        expect(failure.expected).toBe("Z");
        expect(failure.actual).toBe(undefined);
    }
});

Deno.test("line must not exceed expected parameters", () => {
    const line = dummyLine(false);
    line.symbolicOperands = ["X", "Y"];
    line.numericOperands = [0, 0];
    line.operandTypes = ["index", "index"];
    validSymbolic(line, [["X", "X+"]]);
    expect(line.failed()).toBe(true);
    expect(line.failures.length).toBe(1);
    const failure = line.failures[0] as AssertionFailure;
    expect(failure.kind).toBe("operand_count");
    expect(failure.expected).toBe("1");
    expect(failure.actual).toBe("2");
});

Deno.test("line and expectation must not be different", () => {
    const line = dummyLine(false);
    line.symbolicOperands = ["X", "Y"];
    line.numericOperands = [0, 0];
    line.operandTypes = ["index", "index"];
    validSymbolic(line, [["Z", "Z+"], ["Z"]]);
    expect(line.failed()).toBe(true);
    expect(line.failures.length).toBe(2);
    {
        const failure = line.failures[0] as AssertionFailure;
        expect(failure.kind).toBe("operand_symbolic");
        expect(failure.location!).toEqual({"operand": 0});
        expect(failure.expected).toBe("Z/Z+");
        expect(failure.actual).toBe("X");
    } {
        const failure = line.failures[1] as AssertionFailure;
        expect(failure.kind).toBe("operand_symbolic");
        expect(failure.location!).toEqual({"operand": 1});
        expect(failure.expected).toBe("Z");
        expect(failure.actual).toBe("Y");
    }
});

Deno.test("Everything's lovely when actual and expected match", () => {
    const line = dummyLine(false);
    line.symbolicOperands = ["X", "Y"];
    line.numericOperands = [0, 0];
    line.operandTypes = ["index", "index"];
    validSymbolic(line, [["X", "X+"], ["Y", "Y+"]]);
    expect(line.failed()).toBe(false);
    expect(line.failures.length).toBe(0);
});
