import { expect } from "jsr:@std/expect";
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
        expect(result.type).not.toBe("failures");
        expect(result.it).toBe("");
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
    expect(firstTry.type).not.toBe("failures");

    const secondTry = device(secondName);
    expect(secondTry.type).toBe("failures");
    const failures = secondTry.it as Array<Failure>;
    expect(failures.length).toBe(1);
    expect(failures[0]!.kind).toBe("device_multiple");
    const failure = failures[0] as ComparisonFailure;
    expect(failure.before).toBe(firstName)
    expect(failure.after).toBe(secondName);
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
    expect(firstTry.type).not.toBe("failures");

    const secondTry = device(secondName);
    expect(secondTry.type, "failures");
    const failures = secondTry.it as Array<Failure>;
    expect(failures.length).toBe(1);
    expect(failures[0]!.kind).toBe("device_multiple");
    const failure = failures[0] as ComparisonFailure;
    expect(failure.before).toBe(firstName)
    expect(failure.after).toBe(secondName);
});

Deno.test("Choosing an non-existant device returns a Failure", () => {
    const system = systemUnderTest();
    const device = directiveFunction(
        irrelevantName, system.deviceChooser.deviceDirective
    );

    const result = device("notARealDevice");
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    const failure = failures[0] as ClueFailure;
    expect(failure.kind).toBe("device_notFound");
    expect(failure.clue).toBe("./devices/notarealdevice.json");
});

Deno.test("The device name must be present", () => {
    const system = systemUnderTest();
    const device = directiveFunction(
        irrelevantName, system.deviceChooser.deviceDirective
    );

    const result = device();
    expect(result.type).toBe("failures");
    const failures = result.it as Array<Failure>;
    expect(failures.length).toBe(1);
    expect(failures[0]!.kind).toBe("parameter_count");
    const failure = failures[0] as OldFailure;
    expect(failure.extra).toEqual(["1"]);
});

Deno.test("The device name must be present and a string", () => {
    const system = systemUnderTest();
    const device = directiveFunction(
        irrelevantName, system.deviceChooser.deviceDirective
    );
    const result = device("at tiny 24");
    expect(result.type).not.toBe("failures");
    expect(result.it).toBe("");
});
