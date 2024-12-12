import {
    assertFailure, assertSuccess
} from "../coupling/value-failure-testing.ts";
import { anEmptyContext } from "../context/context.ts";
import { deviceChooser } from "./chooser.ts";
import { deviceProperties } from "./properties.ts";

const testEnvironment = () => {
    const context = anEmptyContext();
    return {
        "context": context,
        "chooser": deviceChooser(deviceProperties(context), context)
    };
}

Deno.test("You can choose any device that has a definition file", () => {
    for (const deviceName of ["AT-Tiny 84", "AT_Tiny 24", "AT.Tiny 44"]) {
        const environment = testEnvironment();
        const result = environment.chooser.device(deviceName);
        assertSuccess(result, "");
    }
});

Deno.test("Choosing an non-existant device returns a Failure", () => {
    const environment = testEnvironment();
    const result = environment.chooser.device("notARealDevice");
    assertFailure(result, "device.notFound");
});

Deno.test("The device name must be a string", () => {
    const environment = testEnvironment();
    const result = environment.chooser.device([1, 2, 3] as unknown as string);
    assertFailure(result, "type.string");
});
