import { pass } from "../assembler/pass.ts";
import { deviceChooser } from "../device/chooser.ts";
import { defaultDeviceFinder, defaultJsonLoader } from "../device/device-file.ts";
import { deviceProperties } from "../device/properties.ts";
import { assertFailure, assertSuccess } from "../failure/testing.ts";
import { anEmptyContext } from "../javascript/context.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { dataMemory } from "./data-memory.ts";

const testEnvironment = () => {
    const currentPass = pass();
    const table = symbolTable(anEmptyContext(), currentPass);
    const device = deviceProperties(table);
    const choose = deviceChooser(
        device, table, [defaultDeviceFinder, defaultJsonLoader]
    );
    const memory = dataMemory(device.public);
    currentPass.addResetStateCallback(memory.reset);
    return {
        "pass": currentPass,
        "choose": choose.choose,
        "dataMemory": memory
    };
};

Deno.test("A device must be selected before SRAM can be allocated", () => {
    const environment = testEnvironment();
    environment.pass.second();
    const allocation = environment.dataMemory.alloc(23);
    assertFailure(allocation, "ram_sizeUnknown");
});

Deno.test("A stack allocation can't be beyond available SRAM", () => {
    const environment = testEnvironment();
    environment.choose("dummy", { "ramEnd": 20 });
    environment.pass.second();
    const allocation = environment.dataMemory.allocStack(23);
    assertFailure(allocation, "ram_outOfRange");
});

Deno.test("A memory allocation can't be beyond available SRAM", () => {
    const environment = testEnvironment();
    environment.choose("dummy", { "ramEnd": 20 });
    environment.pass.second();
    const allocation = environment.dataMemory.allocStack(23);
    assertFailure(allocation, "ram_outOfRange");
});

Deno.test("Memory allocations start at the top of SRAM and work down", () => {
    const environment = testEnvironment();
    environment.choose("dummy", { "ramEnd": 100 });
    environment.pass.second();
    assertSuccess(environment.dataMemory.alloc(25), "0");
    assertSuccess(environment.dataMemory.alloc(25), "25");
    assertSuccess(environment.dataMemory.alloc(25), "50");
});

Deno.test("Stack and memory allocations both decrease the available SRAM", () => {
    const environment = testEnvironment();
    environment.choose("dummy", { "ramEnd": 50 });
    environment.pass.second();
    assertSuccess(environment.dataMemory.alloc(25), "0");
    environment.dataMemory.allocStack(25);
    const allocation = environment.dataMemory.alloc(23);
    assertFailure(allocation, "ram_outOfRange");
});

Deno.test("Allocations don't get repeated on the second pass", () => {
    const environment = testEnvironment();
    environment.choose("dummy", { "ramEnd": 50 });
    assertSuccess(environment.dataMemory.alloc(25), "0");
    assertSuccess(environment.dataMemory.alloc(25), "25");
    environment.pass.second();
    assertSuccess(environment.dataMemory.alloc(25), "0");
    assertSuccess(environment.dataMemory.alloc(25), "25");
});
