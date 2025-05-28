import { expect } from "jsr:@std/expect";
import { currentLine } from "../line/current-line.ts";
import { dummyLine } from "../line/line-types.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { embeddedJs } from "./embedded.ts";
import { jSExpression } from "./expression.ts";

const systemUnderTest = () => {
    const $currentLine = currentLine();
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $jsExpression = jSExpression($symbolTable);
    const $embeddedJs = embeddedJs($jsExpression, $currentLine);
    return {
        "embeddedJs": $embeddedJs,
        "currentLine": $currentLine
    };
};

Deno.test("A symbol assignment does not pollute the `this` context object", () => {
    const system = systemUnderTest();
    const line = dummyLine(false, 1);
    line.rawSource = "{{ plop = 27; this.plop; }}";
    system.embeddedJs(line);
    expect(line.failed()).toBe(false);
    expect(line.assemblySource).not.toBe("27");
    expect(line.assemblySource).toBe("");
});

Deno.test("JS can be delimited with moustaches on the same line", () => {
    const system = systemUnderTest();
    const line = dummyLine(false, 1);
    line.rawSource = "MOV {{ const test = 27; test; }}, R2";
    system.embeddedJs(line);
    expect(line.failed()).toBe(false);
    expect(line.assemblySource).toBe("MOV 27, R2");
});

Deno.test("JS can be delimited by moustaches across several lines", () => {
    const system = systemUnderTest();
    const line = dummyLine(false, 1);

    line.rawSource = "some ordinary stuff {{ const test = 27;";
    system.embeddedJs(line);
    expect(line.failed()).toBe(false);
    expect(line.assemblySource).toBe("some ordinary stuff");

    line.rawSource = 'const message = "hello";';
    system.embeddedJs(line);
    expect(line.failed()).toBe(false);
    expect(line.assemblySource).toBe("");

    line.rawSource = "message; }} matey!";
    system.embeddedJs(line);
    expect(line.failed()).toBe(false);
    expect(line.assemblySource).toBe("hello matey!");
});

Deno.test("Multiple opening moustaches are illegal", () => {
    const system = systemUnderTest();
    const line = dummyLine(false, 1);
    line.rawSource = "{{ {{ }}";
    system.embeddedJs(line);
    expect(line.failed()).toBe(true);
    expect(line.failures.length).toBe(1);
    expect(line.failures[0]!.kind).toBe("js_jsMode");
});

Deno.test("Multiple closing moustaches are illegal", () => {
    const system = systemUnderTest();
    const line = dummyLine(false, 1);
    line.rawSource = "{{ }} }}";
    system.embeddedJs(line);
    expect(line.failed()).toBe(true);
    expect(line.failures.length).toBe(1);
    expect(line.failures[0]!.kind).toBe("js_assemblerMode");
});

Deno.test("Omitting a closing moustache is illegal", () => {
    const system = systemUnderTest();
    const line = dummyLine(false, 1);
    line.rawSource = "{{";
    system.embeddedJs(line);
    expect(line.failed()).toBe(false);
    expect(line.failures.length).toBe(0);

    const lastLine = dummyLine(true, 1);
    system.embeddedJs(lastLine);
    expect(lastLine.failed()).toBe(true);
    expect(lastLine.failures.length).toBe(1);
    expect(lastLine.failures[0]!.kind).toBe("js_jsMode");
});
