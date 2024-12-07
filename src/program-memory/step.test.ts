import { assertEquals } from "assert";
import { anEmptyContext } from "../context/context.ts";
import { deviceProperties } from "../device/properties.ts";
import { pokedLine, codeLine } from "../line-types/lines.ts";
import { Code } from "../object-code/data-types.ts";
import { assemblyLine, rawLine } from "../source-code/line-types.ts";
import { tokenisedLine } from "../tokenise/tokenised-line.ts";
import { addressedLine } from "./addressed-line.ts";
import { programMemory } from "./program-memory.ts";

const testEnvironment = () => {
    const context = anEmptyContext();
    const device = deviceProperties(context);
    return {
        "device": device,
        "memory": programMemory(context, device)
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
