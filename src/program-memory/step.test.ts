import { assertEquals } from "assert";
import { newContext } from "../context/context.ts";
import {
    rawLine, assemblyLine, tokenisedLine, addressedLine, pokedLine, codeLine,
    type Code
} from "../coupling/line.ts";
import { deviceProperties } from "../device/properties.ts";
import { newProgramMemory } from "./program-memory.ts";

const testEnvironment = () => {
    const context = newContext();
    const device = deviceProperties(context);
    return {
        "device": device,
        "memory": newProgramMemory(context, device)
    };
};

const testLine = (pokes: Array<Code>, code: Code) => {
    const raw = rawLine("", 0, "", []);
    const assembly = assemblyLine(raw, "", []);
    const tokenised = tokenisedLine(assembly, "", "", [], []);
    const addressed = addressedLine(tokenised, 0, []);
    const poked = pokedLine(addressed, pokes, []);
    return codeLine(poked, [], code, []);
};

Deno.test("If a line has no code the address remains unchanged", () => {
    const environment = testEnvironment();
    environment.device.setName("test");
    environment.device.programMemoryBytes(100);
    assertEquals(0, environment.memory.address());
    environment.memory.step(testLine([], []));
    assertEquals(0, environment.memory.address());
});

Deno.test("The program counter advances by the number of words poked", () => {
    const environment = testEnvironment();
    environment.device.setName("test");
    environment.device.programMemoryBytes(100);
    assertEquals(0, environment.memory.address());
    environment.memory.step(testLine([[1, 2, 3, 4], [5, 6]], []));
    assertEquals(3, environment.memory.address());
});

Deno.test("... or by the number of words of code", () => {
    const environment = testEnvironment();
    environment.device.setName("test");
    environment.device.programMemoryBytes(100);
    assertEquals(0, environment.memory.address());
    environment.memory.step(testLine([], [1, 2]));
    assertEquals(1, environment.memory.address());
});

Deno.test("... or both", () => {
    const environment = testEnvironment();
    environment.device.setName("test");
    environment.device.programMemoryBytes(100);
    assertEquals(0, environment.memory.address());
    environment.memory.step(testLine([[1, 2, 3, 4], [5, 6]], [1, 2]));
    assertEquals(4, environment.memory.address());
});
