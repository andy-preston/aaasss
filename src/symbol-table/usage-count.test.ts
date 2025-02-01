import { assert, assertEquals, assertFalse } from "assert";
import { pass } from "../assembler/pass.ts";
import { usageCount } from "./usage-count.ts";

const testEnvironment = () => {
    const currentPass = pass().public;
    currentPass.start(1);
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
    assertEquals(["plop", 0], result[0]);
});

Deno.test("Each call to count increments the usage", () => {
    const environment = testEnvironment();
    environment.usage.add("plop");
    [1, 2, 3, 4].forEach((expectedCount) => {
        environment.usage.count("plop");
        const result = environment.list();
        assertEquals(1, result.length);
        assertEquals(["plop", expectedCount], result[0]);
    });
});

Deno.test("All symbols appear to be used on the first pass", () => {
    const environment = testEnvironment();
    assert(environment.pass.ignoreErrors(), "ignoreErrors was false");
    environment.usage.add("plop");
    assert(environment.usage.isUsed("plop"), "isUsed was false");
});

Deno.test("... will not appear as used on the 2nd if it wasn't counted on the 1st", () => {
    const environment = testEnvironment();
    environment.usage.add("plop");
    environment.pass.start(2);
    assertFalse(environment.pass.ignoreErrors(), "ignoreErrors was true");
    assertFalse(environment.usage.isUsed("plop"), "isUsed was true");
});

Deno.test("... will appear as used on the 2nd if it was counted on the 1st", () => {
    const environment = testEnvironment();
    environment.usage.add("plop");
    assert(environment.pass.ignoreErrors(), "ignoreErrors was false");
    environment.usage.count("plop");
    environment.pass.start(2);
    assertFalse(environment.pass.ignoreErrors(), "ignoreErrors was true");
    assert(environment.usage.isUsed("plop"), "isUsed was false");
});

