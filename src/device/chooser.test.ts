import { assertFailure, assertFailureWithExtra, assertSuccess } from "../failure/testing.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("You can choose any device that has a definition file", () => {
    for (const deviceName of ["AT-Tiny 84", "AT_Tiny 24", "AT.Tiny 44"]) {
        const system = systemUnderTest();
        const result = system.chooser.deviceDirective(deviceName);
        assertSuccess(result, undefined);
    }
});

Deno.test("Choosing multiple devices results in failure", () => {
    const system = systemUnderTest();
    assertSuccess(
        system.chooser.deviceDirective("AT-Tiny 84"),
        undefined
    );
    assertFailureWithExtra(
        system.chooser.deviceDirective("AT-Tiny 2313"),
        "device_multiple",
        ["AT-Tiny 84"]
    );
});

Deno.test("Choosing the same device by different names is also a failure", () => {
    const system = systemUnderTest();
    assertSuccess(
        system.chooser.deviceDirective("AT-Tiny 84"),
        undefined
    );
    assertFailureWithExtra(
        system.chooser.deviceDirective("at tiny 84"),
        "device_multiple",
        ["AT-Tiny 84"]
    );
});

Deno.test("Choosing an non-existant device returns a Failure", () => {
    const system = systemUnderTest();
    const result = system.chooser.deviceDirective("notARealDevice");
    assertFailure(result, "device_notFound");
});

Deno.test("The device name must be a string", () => {
    const system = systemUnderTest();
    const result = system.chooser.deviceDirective(
        [1, 2, 3] as unknown as string
    );
    assertFailure(result, "type_string");
});
