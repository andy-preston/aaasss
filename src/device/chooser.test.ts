import { assertEquals, assertNotEquals } from "jsr:@std/assert";
import { directiveFunction } from "../directives/directive-function.ts";
import type { ClueFailure, ComparisonFailure, Failure, OldFailure } from "../failure/bags.ts";
import { systemUnderTest } from "./testing.ts";

const irrelevantName = "testing";

Deno.test("You can choose any device that has a definition file", () => {
    for (const deviceName of ["AT-Tiny 84", "AT_Tiny 24", "AT.Tiny 44"]) {
        const system = systemUnderTest();
        const device = directiveFunction(
            irrelevantName, system.deviceChooser.deviceDirective
        );
        const result = device(deviceName);
        assertNotEquals(result.type, "failures");
        assertEquals(result.it, "");
    }
});

Deno.test("Choosing multiple devices results in failure", () => {
    const firstName = "AT-Tiny 84";
    const secondName = "AT-Tiny 2313";
    const system = systemUnderTest();
    const device = directiveFunction(
        irrelevantName, system.deviceChooser.deviceDirective
    );
    const firstTry = device(firstName);
    assertNotEquals(firstTry.type, "failures");

    const secondTry = device(secondName);
    assertEquals(secondTry.type, "failures");
    const failures = secondTry.it as Array<Failure>;
    assertEquals(failures.length, 1);
    assertEquals(failures[0]!.kind, "device_multiple");
    const failure = failures[0] as ComparisonFailure;
    assertEquals(failure.before, firstName)
    assertEquals(failure.after, secondName);
});

Deno.test("Choosing the same device by different names is also a failure", () => {
    // If we think about conditional assembly - having multiple names
    // IN THE SOURCE for the same device is just plain confusing.
    const firstName = "AT-Tiny 84";
    const secondName = "at tiny 84";
    const system = systemUnderTest();
    const device = directiveFunction(
        irrelevantName, system.deviceChooser.deviceDirective
    );

    const firstTry = device(firstName);
    assertNotEquals(firstTry.type, "failures");

    const secondTry = device(secondName);
    assertEquals(secondTry.type, "failures");
    const failures = secondTry.it as Array<Failure>;
    assertEquals(failures.length, 1);
    assertEquals(failures[0]!.kind, "device_multiple");
    const failure = failures[0] as ComparisonFailure;
    assertEquals(failure.before, firstName)
    assertEquals(failure.after, secondName);
});

Deno.test("Choosing an non-existant device returns a Failure", () => {
    const system = systemUnderTest();
    const device = directiveFunction(
        irrelevantName, system.deviceChooser.deviceDirective
    );

    const result = device("notARealDevice");
    assertEquals(result.type, "failures");
    const failures = result.it as Array<Failure>;
    assertEquals(failures.length, 1);
    const failure = failures[0] as ClueFailure;
    assertEquals(failure.kind, "device_notFound");
    assertEquals(failure.clue, "./devices/notarealdevice.json");
});

Deno.test("The device name must be present", () => {
    const system = systemUnderTest();
    const device = directiveFunction(
        irrelevantName, system.deviceChooser.deviceDirective
    );

    const result = device();
    assertEquals(result.type, "failures");
    const failures = result.it as Array<Failure>;
    assertEquals(failures.length, 1);
    assertEquals(failures[0]!.kind, "parameter_count");
    const failure = failures[0] as OldFailure;
    assertEquals(failure.extra, ["1"]);
});

Deno.test("The device name must be present and a string", () => {
    const system = systemUnderTest();
    const device = directiveFunction(
        irrelevantName, system.deviceChooser.deviceDirective
    );
    const result = device("at tiny 24");
    assertNotEquals(result.type, "failures");
    assertEquals(result.it, "");
});
