import { assertEquals } from "assert";
import { pass } from "../assembler/pass.ts";
import { assertFailure, assertSuccess } from "../failure/testing.ts";
import { usageCount } from "./usage-count.ts";

const testEnvironment = () => {
    const currentPass = pass();
    const usage = usageCount(currentPass);
    return {
        "pass": currentPass,
        "usage": usage,
        "list": () => usage.list().toArray()
    };
};

Deno.test("A freshly added symbol has a count of zero", () => {
    const environment = testEnvironment();
    environment.usage.add("plop");
    const result = environment.list();
    assertEquals(1, result.length);
    assertEquals("plop", result[0]);
    assertEquals(0, environment.usage.current("plop"));
});

Deno.test("Each call to count increments the usage", () => {
    const environment = testEnvironment();
    environment.usage.add("plop");
    [1, 2, 3, 4].forEach((expectedCount) => {
        environment.usage.count("plop");
        const result = environment.list();
        assertEquals(1, result.length);
        assertEquals("plop", result[0]);
        assertEquals(expectedCount, environment.usage.current("plop"));
    });
});

Deno.test("If a symbol was not used on the 1st pass, there will be a warning on the 2nd", () => {
    const environment = testEnvironment();
    environment.usage.add("plop");
    environment.pass.second();
    assertFailure(environment.usage.add("plop"), "symbol_notUsed");
});

Deno.test("... will appear as used on the 2nd if it was accessed on the 1st", () => {
    const environment = testEnvironment();
    environment.usage.add("plop");
    environment.usage.count("plop");
    environment.pass.second();
    assertSuccess(environment.usage.add("plop"), undefined);
});

