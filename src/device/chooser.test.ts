import { assertEquals } from "assert";
import { directiveFunction } from "../directives/directive-function.ts";
import { Failure } from "../failure/bags.ts";
import { assertFailureKind, assertFailureWithExtra, assertSuccess } from "../failure/testing.ts";
import { systemUnderTest } from "./testing.ts";

const irrelevantName = "testing";

Deno.test("You can choose any device that has a definition file", () => {
    for (const deviceName of ["AT-Tiny 84", "AT_Tiny 24", "AT.Tiny 44"]) {
        const system = systemUnderTest();
        const device = directiveFunction(
            irrelevantName, system.deviceChooser.deviceDirective
        );
        assertSuccess(device(deviceName));
    }
});

Deno.test("Choosing multiple devices results in failure", () => {
    const firstName = "AT-Tiny 84";
    const secondName = "AT-Tiny 2313";
    const system = systemUnderTest();
    const device = directiveFunction(
        irrelevantName, system.deviceChooser.deviceDirective
    );
    assertSuccess(device(firstName));

    const result = device(secondName);
    assertEquals(result.type, "failures");
    assertFailureWithExtra(
        result.it as Array<Failure>, "device_multiple", [firstName, secondName]
    );
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

    assertSuccess(device(firstName));
    const result = device(secondName);
    assertEquals(result.type, "failures");
    assertFailureWithExtra(
        result.it as Array<Failure>, "device_multiple", [firstName, secondName]
    );
});

Deno.test("Choosing an non-existant device returns a Failure", () => {
    const system = systemUnderTest();
    const device = directiveFunction(
        irrelevantName, system.deviceChooser.deviceDirective
    );

    const result = device("notARealDevice");
    assertEquals(result.type, "failures");
    assertFailureKind(result.it as Array<Failure>, "device_notFound");
});

Deno.test("The device name must be present and a string", () => {
    const system = systemUnderTest();
    const device = directiveFunction(
        irrelevantName, system.deviceChooser.deviceDirective
    );

    const wrongCount = device("notARealDevice");
    assertEquals(wrongCount.type, "failures");
    assertFailureKind(wrongCount.it as Array<Failure>, "device_notFound");

    const wrongArray = device([1, 2, 3]);
    assertEquals(wrongArray.type, "failures");
    assertFailureWithExtra(
        wrongArray.it as Array<Failure>, "parameter_type", ["string", "0: array"]
    );

    const wrongNumber = device(64);
    assertEquals(wrongNumber.type, "failures");
    assertFailureWithExtra(
        wrongNumber.it as Array<Failure>, "parameter_type", ["string", "0: number"]
    );

    const wrongBoolean = device(false);
    assertEquals(wrongBoolean.type, "failures");
    assertFailureWithExtra(
        wrongBoolean.it as Array<Failure>, "parameter_type", ["string", "0: boolean"]
    );

    assertSuccess(device("at tiny 24"));
});
