import { expect } from "jsr:@std/expect";
import { directiveFunction } from "../directives/directives.ts";
import { currentLine } from "../line/current-line.ts";
import { emptyLine } from "../line/line-types.ts";
import { cpuRegisters } from "../registers/cpu-registers.ts";
import { symbolTable } from "../symbol-table/symbol-table.ts";
import { embeddedJs } from "./embedded.ts";
import { jSExpression } from "./expression.ts";

const testSystem = () => {
    const $currentLine = currentLine();
    $currentLine(emptyLine("plop.asm"));
    const $cpuRegisters = cpuRegisters();
    const $symbolTable = symbolTable($currentLine, $cpuRegisters);
    const $directiveFunction = directiveFunction($currentLine);
    const $jsExpression = jSExpression(
        $currentLine, $symbolTable, $directiveFunction
    );
    const $embeddedJs = embeddedJs($currentLine, $jsExpression);
    return {
        "embeddedJs": $embeddedJs,
        "currentLine": $currentLine
    };
};

Deno.test("A symbol assignment does not pollute the `this` context object", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().rawSource = "{{ plop = 27; this.plop; }}";
    systemUnderTest.embeddedJs.pipeline();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(systemUnderTest.currentLine().assemblySource).not.toBe("27");
    expect(systemUnderTest.currentLine().assemblySource).toBe("");
});

Deno.test("JS can be delimited with moustaches on the same line", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().rawSource = "MOV {{ const test = 27; test; }}, R2";
    systemUnderTest.embeddedJs.pipeline();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(systemUnderTest.currentLine().assemblySource).toBe("MOV 27, R2");
});

Deno.test("JS can be delimited by moustaches across several lines", () => {
    const systemUnderTest = testSystem();

    systemUnderTest.currentLine().rawSource =
        "some ordinary stuff {{ const test = 27;";
    systemUnderTest.embeddedJs.pipeline();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(systemUnderTest.currentLine().assemblySource).toBe(
        "some ordinary stuff"
    );

    systemUnderTest.currentLine().rawSource = 'const message = "hello";';
    systemUnderTest.embeddedJs.pipeline();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(systemUnderTest.currentLine().assemblySource).toBe("");

    systemUnderTest.currentLine().rawSource = "message; }} matey!";
    systemUnderTest.embeddedJs.pipeline();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);
    expect(systemUnderTest.currentLine().assemblySource).toBe("hello matey!");
});

Deno.test("Multiple opening moustaches are illegal", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().rawSource = "{{ {{ }}";
    systemUnderTest.embeddedJs.pipeline();
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    expect(systemUnderTest.currentLine().failures[0]!.kind).toBe("js_jsMode");
});

Deno.test("Multiple closing moustaches are illegal", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().rawSource = "{{ }} }}";
    systemUnderTest.embeddedJs.pipeline();
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    expect(systemUnderTest.currentLine().failures[0]!.kind).toBe("js_assemblerMode");
});

Deno.test("Omitting a closing moustache is illegal", () => {
    const systemUnderTest = testSystem();
    systemUnderTest.currentLine().rawSource = "{{";
    systemUnderTest.embeddedJs.pipeline();
    expect(systemUnderTest.currentLine().failures.length).toBe(0);

    systemUnderTest.embeddedJs.reset(1);
    expect(systemUnderTest.currentLine().failures.length).toBe(1);
    expect(systemUnderTest.currentLine().failures[0]!.kind).toBe("js_jsMode");
});
