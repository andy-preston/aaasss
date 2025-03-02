import { assertFailure, assertFailureWithExtra, assertSuccess } from "../failure/testing.ts";
import { systemUnderTest } from "./testing.ts";

Deno.test("You can choose any device that has a definition file", () => {
    for (const deviceName of ["AT-Tiny 84", "AT_Tiny 24", "AT.Tiny 44"]) {
        const system = systemUnderTest();
        assertSuccess(
            system.deviceChooser.deviceDirective.body(deviceName),
            undefined
        );
    }
});

Deno.test("Choosing multiple devices results in failure", () => {
    const firstName = "AT-Tiny 84";
    const secondName = "AT-Tiny 2313";
    const system = systemUnderTest();
    assertSuccess(
        system.deviceChooser.deviceDirective.body(firstName),
        undefined
    );
    assertFailureWithExtra(
        system.deviceChooser.deviceDirective.body(secondName),
        "device_multiple",
        [firstName, secondName]
    );
});

Deno.test("Choosing the same device by different names is also a failure", () => {
    // If we think about conditional assembly - having multiple names
    // IN THE SOURCE for the same device is just plain confusing.
    const firstName = "AT-Tiny 84";
    const secondName = "at tiny 84";
    const system = systemUnderTest();
    assertSuccess(
        system.deviceChooser.deviceDirective.body(firstName),
        undefined
    );
    assertFailureWithExtra(
        system.deviceChooser.deviceDirective.body(secondName),
        "device_multiple",
        [firstName, secondName]
    );
});

Deno.test("Choosing an non-existant device returns a Failure", () => {
    const system = systemUnderTest();
    assertFailure(
        system.deviceChooser.deviceDirective.body("notARealDevice"),
        "device_notFound"
    );
});

Deno.test("The device name must be a string", () => {
    const system = systemUnderTest();
    assertFailure(
        system.jSExpression("device([1, 2, 3])"),
        "type_string"
    );
});
