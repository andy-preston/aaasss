import { assertFailure, assertFailureWithExtra, assertSuccess } from "../failure/testing.ts";
import { testEnvironment } from "./testing.ts";

Deno.test("You can choose any device that has a definition file", () => {
    for (const deviceName of ["AT-Tiny 84", "AT_Tiny 24", "AT.Tiny 44"]) {
        const environment = testEnvironment();
        const result = environment.chooser.device(deviceName);
        assertSuccess(result, undefined);
    }
});

Deno.test("Choosing multiple devices results in failure", () => {
    const environment = testEnvironment();
    assertSuccess(
        environment.chooser.device("AT-Tiny 84"),
        undefined
    );
    assertFailureWithExtra(
        environment.chooser.device("AT-Tiny 2313"),
        "device_multiple",
        ["AT-Tiny 84"]
    );
});

Deno.test("Choosing the same device by different names is also a failure", () => {
    const environment = testEnvironment();
    assertSuccess(
        environment.chooser.device("AT-Tiny 84"),
        undefined
    );
    assertFailureWithExtra(
        environment.chooser.device("at tiny 84"),
        "device_multiple",
        ["AT-Tiny 84"]
    );
});

Deno.test("Choosing an non-existant device returns a Failure", () => {
    const environment = testEnvironment();
    const result = environment.chooser.device("notARealDevice");
    assertFailure(result, "device_notFound");
});

Deno.test("The device name must be a string", () => {
    const environment = testEnvironment();
    const result = environment.chooser.device([1, 2, 3] as unknown as string);
    assertFailure(result, "type_string");
});
