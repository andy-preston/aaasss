import { assertFailure, assertSuccess } from "../testing.ts";
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
        const result = environment.chooser.directive(deviceName);
        assertSuccess(result, "");
    }
});

Deno.test("Choosing an non-existant device returns a Failure", () => {
    const environment = testEnvironment();
    const result = environment.chooser.directive("notARealDevice");
    assertFailure(result, "device.notFound");
});
