import { assertEquals } from "jsr:@std/assert";
import { directiveFunction } from "../directives/directive-function.ts";
import type { MemoryRangeFailure, Failure, OldFailure } from "../failure/bags.ts";
import { assertFailureWithExtra, assertSuccess } from "../failure/testing.ts";
import { systemUnderTest } from "./testing.ts";

const irrelevantName = "testing";

Deno.test("A device must be selected before program memory can be set", () => {
    const system = systemUnderTest();
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );

    const result = origin(10);
    assertEquals(result.type, "failures");
    const failures = result.it as Array<Failure>;
    assertEquals(failures.length, 3);
    assertEquals(failures[0]!.kind, "device_notSelected");
    assertEquals(failures[1]!.kind, "symbol_notFound");
    assertEquals((failures[1] as OldFailure).extra, [undefined, "programMemoryBytes"]);
    assertEquals(failures[2]!.kind, "programMemory_sizeUnknown");
});

Deno.test("Origin addresses can't be less than zero", () => {
    const system = systemUnderTest();
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );

    const result = origin(-1);
    assertEquals(result.type, "failures");
    const failures = result.it as Array<Failure>;
    assertEquals(failures.length, 1);
    assertFailureWithExtra(
        result.it as Array<Failure>, "type_positive", ["-1", "0", ""]
    );
});

Deno.test("Origin addresses can't be strange type", () => {
    const system = systemUnderTest();
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );

    const result = origin("nothing");
    assertEquals(result.type, "failures");
    const failures = result.it as Array<Failure>;
    assertEquals(failures.length, 1);
    assertFailureWithExtra(
        failures, "parameter_type", ["number", "0: string"]
    );
});

Deno.test("Device name is used to determine if properties have been set", () => {
    const system = systemUnderTest();
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );
    system.deviceProperties.property("programMemoryBytes", "FF");

    const result = origin(10);
    assertEquals(result.type, "failures");
    const failures = result.it as Array<Failure>;
    assertEquals(failures.length, 2);
    assertEquals(failures[0]!.kind, "device_notSelected");
    assertEquals(failures[1]!.kind, "programMemory_sizeUnknown");
});

Deno.test("Origin addresses must be progmem size when a device is chosen", () => {
    const system = systemUnderTest();
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );
    system.deviceProperties.property("deviceName", "test");
    const bytesAvailable = 100;
    system.deviceProperties.property(
        "programMemoryBytes", bytesAvailable.toString(16).toUpperCase()
    );

    const tryOrigin = 92;
    const result = origin(tryOrigin);
    assertEquals(result.type, "failures");
    const failures = result.it as Array<Failure>;
    assertEquals(failures.length, 1);
    assertEquals(failures[0]!.kind, "programMemory_outOfRange");
    const failure = failures[0] as MemoryRangeFailure;
    assertEquals(failure.bytesRequested, tryOrigin * 2);
    assertEquals(failure.bytesAvailable, bytesAvailable);
});

Deno.test("Origin directive sets current address", () => {
    const system = systemUnderTest();
    const origin = directiveFunction(
        irrelevantName, system.programMemory.originDirective
    );
    system.deviceProperties.property("deviceName", "test");
    system.deviceProperties.property("programMemoryBytes", "FF");

    assertSuccess(origin(23));
    assertEquals(system.programMemory.address(), 23);
    assertSuccess(origin(42));
    assertEquals(system.programMemory.address(), 42);
});
