import type { AssertionFailure, BoringFailure, Failure } from "../failure/bags.ts";

import { expect } from "jsr:@std/expect";
import { emptyBag, numberBag, stringBag } from "../assembler/bags.ts";
import { directiveFunction } from "../directives/directive-function.ts";
import { lineWithRawSource } from "../source-code/line-types.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("Origin addresses can't be strange type", () => {
    const system = systemUnderTest();
    const origin = directiveFunction(
        "origin", system.programMemoryPipeline.originDirective
    );

    const result = origin("nothing");
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as AssertionFailure;
    expect(failure.kind).toBe("type_failure");
    expect(failure.location).toEqual({"parameter": 0});
    expect(failure.expected).toBe("numeric");
    expect(failure.actual).toBe('"nothing"');
});

Deno.test("Origin directive is blocked by code in current line", () => {
    const system = systemUnderTest();
    const origin = directiveFunction(
        "origin", system.programMemoryPipeline.originDirective
    );

    const line = lineWithRawSource("", 0, "", "", 0, false);
    line.code.push([0, 0]);
    system.currentLine.forDirectives(line);
    const result = origin(0);
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0]! as BoringFailure;
    expect(failure.kind).toBe("programMemory_cantOrg");
});

Deno.test("Origin directive is not blocked when there's no code in current line", () => {
    const system = systemUnderTest();
    const origin = directiveFunction(
        "origin", system.programMemoryPipeline.originDirective
    );

    const line = lineWithRawSource("", 0, "", "", 0, false);
    system.currentLine.forDirectives(line);
    const result = origin(0);
    expect(result.type).not.toBe("failures");
});

Deno.test("Label directive enables labels to be set inside JS code", () => {
    const system = systemUnderTest();
    system.symbolTable.deviceSymbol("deviceName", stringBag("test"));
    system.symbolTable.deviceSymbol("programMemoryBytes", numberBag(0xff));
    const label = directiveFunction(
        "label", system.programMemoryPipeline.labelDirective
    );

    const origin = system.programMemory.origin(10);
    expect(origin).toEqual(emptyBag());
    const result = label("aTest");
    expect(result).toEqual(emptyBag());
    expect(system.symbolTable.symbolValue("aTest")).toEqual(numberBag(10));
});
